---
layout: post
title: Binders & Window Tokens
date: 2013-07-31
permalink: /2013/07/binders-window-tokens.html
comments: true
---

<i>Note: if you liked this post, be sure to read my second blog post about <a href="http://www.androiddesignpatterns.com/2013/08/binders-death-recipients.html">`Binder`s &amp; Death Recipients</a> as well!</i>

One of Android's key design goals was to provide an open platform that doesn't rely on a central authority to verify that applications do what they claim. To achieve this, Android uses application sandboxes and Linux process isolation to prevent applications from being able to access the system or other applications in ways that are not controlled and secure. This architecture was chosen with both developers and device users in mind: neither should have to take extra steps to protect the device from malicious applications. Everything should be taken care of automatically by the system.

For a long time I took this security for granted, not completely understanding how it was actually enforced. But recently I became curious. What mechanism prevents me from, for example, tricking the system into releasing a wake lock acquired by another application, or from hiding another application's windows from the screen? More generally, how do Android's core system services respond to requests made by third-party applications in a way that is both efficient and secure?

<!--more-->

To my surprise, the answer to nearly all of my questions was pretty simple: "the Binder". Binders are the cornerstone of Android's architecture; they abstract the low-level details of IPC from the developer, allowing applications to easily talk to both the System Server and others' remote service components. But Binders also have a number of other cool features that are used extensively throughout the system in a mix of clever ways, making it much easier for the framework to address security issues. This blog post will cover one of these features in detail, known as <i>Binder tokens</i>.

## Binder Tokens

An interesting property of `Binder` objects is that each instance maintains <b>a unique identity across all processes in the system</b>, no matter how many process boundaries it crosses or where it goes. This facility is provided by the Binder kernel driver, which analyzes the contents of each Binder transaction and assigns a unique 32-bit integer value to each `Binder` object it sees. To ensure that Java's `==` operator adheres to the Binder's unique, cross-process object identity contract, a `Binder`'s object reference is treated a little differently than those of other objects. Specifically, each `Binder`'s object reference is assigned either,

1. A <i>virtual memory address</i> pointing to a `Binder` object in the <i>same process</i>, or
2. A <i>unique 32-bit handle</i> (as assigned by the Binder kernel driver) pointing to the `Binder`'s virtual memory address in a <i>different process</i>.

The Binder kernel driver maintains a mapping of local addresses to remote Binder handles (and vice versa) for each `Binder` it sees, and assigns each `Binder`'s object reference its appropriate value to ensure that equality will behave as expected even in remote processes.

The Binder's unique object identity rules allow them to be used for a special purpose: as <i>shared, security access tokens</i>.<a href="#footnote1"><sup>1</sup></a> Binders are globally unique, which means if you create one, nobody else can create one that appears equal to it. For this reason, the application framework uses Binder tokens extensively in order to ensure secure interaction between cooperating processes: a client can create a `Binder` object to use as a token that can be shared with a server process, and the server can use it to validate the client's requests without there being anyway for others to spoof it.

Let's see how this works through a simple example. Consider an application which makes a request to the `PowerManager` to acquire (and later release) a wake lock:

```java
/**
 * An example activity that acquires a wake lock in onCreate() 
 * and releases it in onDestroy().
 */
public class MyActivity extends Activity {
    
  private PowerManager.WakeLock wakeLock;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
    wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "My Tag");
    wakeLock.acquire();
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();

    wakeLock.release();
  }
}
```

Inspecting the `PowerManager` <a href="https://android.googlesource.com/platform/frameworks/base/+/android-4.3_r2.1/core/java/android/os/PowerManager.java">source code</a> helps us understand what's happening under the hood (note that some of the source code has been cleaned-up for the sake of brevity):

```java
/**
 * The interface that applications use to talk to the global power manager
 * system service.
 *
 * @see frameworks/base/core/java/android/os/PowerManager.java
 */
public final class PowerManager {

  // Our handle on the global power manager service.
  private final IPowerManager mService;

  public WakeLock newWakeLock(int levelAndFlags, String tag) {
    return new WakeLock(levelAndFlags, tag);
  }

  public final class WakeLock {
    private final IBinder mToken;
    private final int mFlags;
    private final String mTag;

    WakeLock(int flags, String tag) {
      // Create a token that uniquely identifies this wake lock.
      mToken = new Binder();
      mFlags = flags;
      mTag = tag;
    }

    public void acquire() {
      // Send the power manager service a request to acquire a wake
      // lock for the application. Include the token as part of the 
      // request so that the power manager service can validate the
      // application's identity when it requests to release the wake
      // lock later on.
      mService.acquireWakeLock(mToken, mFlags, mTag);
    }

    public void release() {
      // Send the power manager service a request to release the
      // wake lock associated with 'mToken'.
      mService.releaseWakeLock(mToken);
    }
  }
}
```

So what's going on? Let's walk through the code step-by-step:

  1. The client application requests an instance of the `PowerManager` class in `onCreate()`.
     The `PowerManager` class provides an interface for the client application to talk to the global
     <a href="https://android.googlesource.com/platform/frameworks/base/+/android-4.3_r2.1/services/java/com/android/server/power/PowerManagerService.java">`PowerManagerService`</a>,
     which runs in the System Server process and is in charge of managing the device's power
     state (i.e. determining the screen's brightness, starting Daydreams, detecting when the
     device is plugged into a dock, etc.).

  2. The client application creates and acquires a wake lock in `onCreate()`. The `PowerManager`
     sends the `WakeLock`'s unique `Binder` token as part of the `acquire()` request. When the
     `PowerManagerService` receives the request, it holds onto the token for safe-keeping and
     forces the device to remain awake, until...

  3. The client application releases the wake lock in `onDestroy()`. The `PowerManager` sends
     the `WakeLock`'s unique `Binder` token as part of the request. When the `PowerManagerService`
     receives the request, it compares the token against all other `WakeLock` tokens it has stored,
     and only releases the `WakeLock` if it finds a match. This additional "validation step" is an
     important security measure put in place to guarantee that other applications cannot trick the
     `PowerManagerService` into releasing a `WakeLock` held by a different application.

Because of their unique object-identity capabilities, Binder tokens are used extensively<a href="#footnote2"><sup>2</sup></a>
in the system for security. Perhaps the most interesting example of how they are used in the framework is the "window token,"
which we will now discuss below.

## Window Tokens

If you've ever scrolled through the official documentation for Android's `View` class, chances are you've stumbled across the <a href="http://developer.android.com/reference/android/view/View.html#getWindowToken()">`getWindowToken()`</a> method and wondered what it meant. As its name implies, a window token is a special type of Binder token that the window manager uses to uniquely identify a window in the system. Window tokens are important for security because they make it impossible for malicious applications to draw on top of the windows of other applications. The window manager protects against this by requiring applications to pass their application's window token as part of each request to add or remove a window.<a href="#footnote3"><sup>3</sup></a> If the tokens don't match, the window manager rejects the request and throws a <a href="http://developer.android.com/reference/android/view/WindowManager.BadTokenException.html">`BadTokenException`</a>. Without window tokens, this necessary identification step wouldn't be possible and the window manager wouldn't be able to protect itself from malicious applications.

By this point you might be wondering about the real-world scenarios in which you would need to obtain a window token. Here are some examples:

  + When an application starts up for the first time, the `ActivityManagerService`<a href="#footnote4"><sup>4</sup></a>
    creates a special kind of window token called an <b>application window token</b>, which uniquely identifies the application's
    top-level container window.<a href="#footnote5"><sup>5</sup></a> The activity manager gives this token to both the
    application and the window manager, and the application sends the token to the window manager each time it wants to
    add a new window to the screen. This ensures secure interaction between the application and the window manager
    (by making it impossible to add windows on top of other applications), and also makes it easy for the activity
    manager to make direct requests to the window manager. For example, the activity manager can say, "hide all of
    this token's windows", and the window manager will be able to correctly identify the set of windows which should be closed.

  + Developers implementing their own custom Launchers can interact with the live wallpaper window that sits directly behind them by calling the 
    <a href="https://developer.android.com/reference/android/app/WallpaperManager.html#sendWallpaperCommand(android.os.IBinder, java.lang.String, int, int, int, android.os.Bundle)">`sendWallpaperCommand(IBinder windowToken, String action, int x, int y, int z, Bundle extras)`</a>
    method. To ensure that no other application other than the Launcher is able to interact with the live wallpaper, the
    framework requires developers to pass a window token as the first argument to the method. If the window token does not
    identify the current foreground activity window sitting on top of the wallpaper, the command is ignored and a warning is logged.

  + Applications can ask the <a href="http://developer.android.com/reference/android/view/inputmethod/InputMethodManager.html">`InputMethodManager`</a>
    to hide the soft keyboard by calling the <a href="http://developer.android.com/reference/android/view/inputmethod/InputMethodManager.html#hideSoftInputFromWindow(android.os.IBinder, int)">`hideSoftInputFromWindow(IBinder windowToken, int flags)`</a>
    method, but must provide a window token as part of the request. If the token doesn't match the window token belonging to the
    window currently accepting input, the `InputMethodManager` will reject the request. This makes it impossible for malicious
    applications to force-close a soft keyboard opened by another application.

  + Applications which manually add new windows to the screen (i.e. using the
    <a href="https://developer.android.com/reference/android/view/WindowManager.html">`addView(View, WindowManager.LayoutParams)`</a>
    method) may need to specify their application's window token by setting the
    <a href="http://developer.android.com/reference/android/view/WindowManager.LayoutParams.html#token">`WindowManager.LayoutParams.token`</a>
    field. It is very unlikely that any normal application would ever have to do this, since the
    <a href="http://developer.android.com/reference/android/app/Activity.html#getWindowManager()">`getWindowManager()`</a>
    method returns a `WindowManager` which will automatically set the token's value for you. That said, if at some point
    in the future you encounter a situation in which you need to add a panel window to the screen from a background
    service, know that you would need to manually sign the request with your application window token in order to achieve it. :P

## Conclusion

Though their existence is for the most part hidden from developers, Binder tokens are used extensively in the system for security. Android is a massively distributed system of cooperating processes reliant on the fact that Binder objects are unique across all processes on the device. Binder tokens are the driving force behind interaction in the framework, and without them secure communication between application processes and the system would be difficult to achieve.

As always, thanks for reading, and leave a comment if you have any questions. Don't forget to +1 this blog in the top right corner!

<br><hr color="#000000" size="1" width="60%" align="left">

<a name="footnote1"><sup>1</sup></a> The <a href="http://developer.android.com/reference/android/os/Binder.html">documentation</a> actually hints that `Binder`s can be used for this purpose: "You can... simply instantiate a raw Binder object directly to use as a token that can be shared across processes."

<a name="footnote2"><sup>2</sup></a> Pick a random file in <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/services/java/com/android/server">`frameworks/base/services/java/com/android/server`</a> and chances are it makes use of Binder tokens in some shape or form. Another cool example involves the status bar, notification manager, and the system UI. Specifically, the <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/services/java/com/android/server/StatusBarManagerService.java">`StatusBarManagerService`</a> maintains a global mapping of Binder tokens to notifications. When the <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/services/java/com/android/server/NotificationManagerService.java">`NotificationManagerService`</a> makes a request to the status bar manager to add a notification to the status bar, the status bar manager creates a binder token uniquely identifying the notification and passes it to both the notification manager and the <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/packages/SystemUI/">`SystemUI`</a>. Since all three parties know the notification's Binder token, any changes to the notification from that point forward (i.e. the notification manager cancels the notification, or the SystemUI detects that the user has swiped a notification off screen) will go through the status bar manager first. This makes it easier for the three system services to stay in sync: the status bar manager can be in charge of centralizing all of the information about which notifications should currently be shown without the SystemUI and notification manager ever having to interact with each other directly.

<a name="footnote3"><sup>3</sup></a> Applications that hold the `android.permission.SYSTEM_ALERT_WINDOW` permission (a.k.a. the "draw over other apps" permission) are notable exceptions to this rule. <a href="https://play.google.com/store/apps/details?id=com.facebook.orca">Facebook Messenger</a> and <a href="https://play.google.com/store/apps/details?id=com.inisoft.mediaplayer.a">DicePlayer</a> are two popular applications which require this permission, and use it to add windows on top of other applications from a background service.

<a name="footnote4"><sup>4</sup></a> The <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/services/java/com/android/server/am/ActivityManagerService.java">`ActivityManagerService`</a> is the global system service (running in the System Server process) that is in charge of starting (and managing) new components, such as Activities and Services. It's also involved in the maintenance of OOM adjustments used by the in-kernel low-memory handler, permissions, task management, etc.

<a name="footnote5"><sup>5</sup></a> You can obtain a reference by calling <a href="http://developer.android.com/reference/android/view/View.html#getApplicationWindowToken()">`getApplicationWindowToken()`</a>.