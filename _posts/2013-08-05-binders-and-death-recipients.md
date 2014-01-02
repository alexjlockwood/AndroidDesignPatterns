---
layout: post
title: 'Binders & Death Recipients'
date: 2013-08-05
permalink: /2013/08/binders-death-recipients.html
comments: true
---

<em>Note: before you begin, make sure you've read my <a href="/2013/07/binders-window-tokens.html">previous post</a> about `Binder` tokens!</em>

Since the very beginning, Android's central focus has been the ability to multitask. In order to achieve it,
Android takes a unique approach by allowing multiple applications to run at the same time. Applications are
never explicitly closed by the user, but are instead left running at a low priority to be killed by the system
when memory is low. This ability to keep processes waiting in the background speeds up app-switching later
down the line.

Developers learn early on that the key to how Android handles applications in this way is that <b>processes
aren't shut down cleanly</b>. Android doesn't rely on applications being well-written and responsive to
polite requests to exit. Rather, it brutally force-kills them without warning, allowing the kernel to
immediately reclaim resources associated with the process. This helps prevent serious out of memory situations
and gives Android total control over misbehaving apps that are negatively impacting the system. For this reason,
there is no guarantee that any user-space code (such as an Activity's `onDestroy()` method) will
ever be executed when an application's process goes away.

<!--more-->

Considering the limited memory available in mobile environments, this approach seems promising. However, there
is still one issue that needs to be addressed: <i>how should the system detect an application's death so that
it can quickly clean up its state</i>? When an application dies, its state will be spread over dozens of system
services (the Activity Manager, Window Manager, Power Manager, etc.) and several different processes. These
system services need to be notified immediately when an application dies so that they can clean up its state
and maintain an accurate snapshot of the system. Enter death recipients.

## Death Recipients

As it turns out, this task is made easy using the `Binder`'s "link-to-death" facility, which allows a process to get a callback when another process hosting a binder object goes away. In Android, any process can receive a notification when another process dies by taking the following steps:

  1. First, the process creates a <a href="http://developer.android.com/reference/android/os/IBinder.DeathRecipient.html">`DeathRecipient`</a> 
     callback object containing the code to be executed when the death notification arrives.

  2. Next, it obtains a reference to a `Binder` object that lives in another process and calls its 
     <a href="http://developer.android.com/reference/android/os/Binder.html#linkToDeath(android.os.IBinder.DeathRecipient, int)">`linkToDeath(IBinder.DeathRecipient recipient, int flags)`</a>,
     passing the `DeathRecipient` callback object as the first argument.

  3. Finally, it waits for the process hosting the `Binder` object to die. When the Binder kernel
     driver detects that the process hosting the `Binder` is gone, it will notify the registered
     `DeathRecipient` callback object by calling its 
     <a href="http://developer.android.com/reference/android/os/IBinder.DeathRecipient.html#binderDied()">`binderDied()`</a>
     method.

Analyzing the source code once again gives some insight into how this pattern is used inside the framework.
Consider an example application that (similar to the example given in my <a href="/2013/07/binders-window-tokens.html">previous post</a>)
acquires a wake lock in `onCreate()`, but is abruptly killed by the system before it is
able to release the wake lock in `onDestroy()`. How and when will the
<a href="https://android.googlesource.com/platform/frameworks/base/+/android-4.3_r2.1/services/java/com/android/server/power/PowerManagerService.java">`PowerManagerService`</a>
be notified so that it can quickly release the wake lock before wasting the device's battery? As you might
expect, the `PowerManagerService` achieves this by registering a `DeathRecipient`
(note that some of the source code has been cleaned up for the sake of brevity):

```java
/**
 * The global power manager system service. Application processes 
 * interact with this class remotely through the PowerManager class.
 *
 * @see frameworks/base/services/java/com/android/server/power/PowerManagerService.java
 */
public final class PowerManagerService extends IPowerManager.Stub {

  // List of all wake locks acquired by applications.
  private List<WakeLock> mWakeLocks = new ArrayList<WakeLock>();

  @Override // Binder call
  public void acquireWakeLock(IBinder token, int flags, String tag) {
    WakeLock wakeLock = new WakeLock(token, flags, tag);

    // Register to receive a notification when the process hosting 
    // the token goes away.
    token.linkToDeath(wakeLock, 0);

    // Acquire the wake lock by adding it as an entry to the list.
    mWakeLocks.add(wakeLock);

    updatePowerState();
  }

  @Override // Binder call
  public void releaseWakeLock(IBinder token, int flags) {
    int index = findWakeLockIndex(token);
    if (index < 0) {
      // The client app has sent us an invalid token, so ignore
      // the request.
      return;
    }

    // Release the wake lock by removing its entry from the list.
    WakeLock wakeLock = mWakeLocks.get(index);
    mWakeLocks.remove(index);

    // We no longer care about receiving death notifications.
    wakeLock.mToken.unlinkToDeath(wakeLock, 0);

    updatePowerState();
  }

  private int findWakeLockIndex(IBinder token) {
    for (int i = 0; i < mWakeLocks.size(); i++) {
      if (mWakeLocks.get(i).mToken == token) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Represents a wake lock that has been acquired by an application.
   */
  private final class WakeLock implements IBinder.DeathRecipient {
    public final IBinder mToken;
    public final int mFlags;
    public final String mTag;

    public WakeLock(IBinder token, inf flags, String tag) {
      mToken = token;
      mFlags = flags;
      mTag = tag;
    }

    @Override
    public void binderDied() {
      int index = mWakeLocks.indexOf(this);
      if (index < 0) {
        return;
      }

      // The token's hosting process was killed before it was
      // able to explicitly release the wake lock, so release 
      // it for them.
      mWakeLocks.remove(index);

      updatePowerState();
    }
  }

  /**
   * Updates the global power state of the device.
   */
  private void updatePowerState() {
    // ...
  }
}
```

The code might seem a little dense at first, but the concept is simple:

  + When the application requests to acquire a wake lock, the power manager service's
    `acquireWakeLock()` method is called. The power manager service registers
    the wake lock for the application, and also links to the death of the wake lock's
    unique `Binder` token so that it can get notified if the application process
    is abruptly killed.

  + When the application requests to release a wake lock, the power manager service's
    `releaseWakeLock()` method is called. The power manager service releases
    the wake lock for the application, and also unlinks to the death of the wake lock's
    unique `Binder` token (as it no longer cares about getting notified when
    the application process dies).

  + When the application is abruptly killed before the wake lock is explicitly released,
    the Binder kernel driver notices that the wake lock's Binder token has been linked
    to the death of the application process. The Binder kernel driver quickly dispatches
    a death notification to the registered death recipient's `binderDied()`
    method, which quickly releases the wake lock and updates the device's power state.

## Examples in the Framework

The `Binder`'s link-to-death feature is an incredibly useful tool that is 
used extensively by the framework's system services. Here are some of the more 
interesting examples:

  + The window manager links to the death of the window's 
    <a href="https://developer.android.com/reference/android/view/Window.Callback.html">callback interface</a>.
    In the rare case that the application's process is killed while its windows are still showing, 
    the window manager will receive a death notification callback, at which point it can clean up after
    the application by closing its windows.

  + When an application binds to a remote service, the application links to the death of the binder
    stub returned by the remote service's `onBind()` method. If the remote service suddenly
    dies, the registered death recipient's `binderDied()` method is called, which contains
    some clean up code, as well as the code that calls the
    <a href="https://developer.android.com/reference/android/content/ServiceConnection.html#onServiceDisconnected(android.content.ComponentName)">`onServiceDisconnected(ComponentName name)`</a>
    method (the source code illustrating how this is done is located
    <a href="https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/app/LoadedApk.java">here</a>).

  + Many other system services depend on the Binder's link-to-death facility in order to ensure that
    expensive resources aren't leaked when an application process is forcefully killed. Some other examples
    (not including the `PowerManagerService`) are the
    <a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/java/com/android/server/VibratorService.java">`VibratorService`</a>,
    <a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/java/com/android/server/LocationManagerService.java">`LocationManagerService`</a>,
    <a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/java/com/android/server/location/GpsLocationProvider.java">`GpsLocationProvider`</a>,
    and the <a href="https://android.googlesource.com/platform/frameworks/base/+/master/services/java/com/android/server/wifi/WifiService.java">`WifiService`</a>.

## Additional Reading

If you would like to learn more about `Binder`s and how they work at a deeper level, I've included
some links below. These articles were extremely helpful to me as I was writing these last two posts about
`Binder` tokens and `DeathRecipient`s, and I would strongly recommend reading them
if you get a chance!

  + <a href="https://lkml.org/lkml/2009/6/25/3">This post</a> is what initially got me interested in this
    topic. Special thanks to <a class="g-profile" href="http://plus.google.com/105051985738280261832" target="_blank">+Dianne Hackborn</a>
    for explaining this!
  + <a href="http://www.nds.rub.de/media/attachments/files/2012/03/binder.pdf">A great paper</a> which
    explains almost everything you need to know about Binders.
  + <a href="http://events.linuxfoundation.org/images/stories/slides/abs2013_gargentas.pdf">These slides</a> are
    another great Binder resource.
  + <a href="https://plus.google.com/105051985738280261832/posts/ACaCokiLfqK">This Google+ post</a> talks about
    how/why live wallpapers are given their own window.
  + <a href="http://android-developers.blogspot.com/2010/04/multitasking-android-way.html">A great blog post</a>
    discussing multitasking in Android.
  + <a href="https://plus.google.com/105051985738280261832/posts/XAZ4CeVP6DC">This Google+ post</a> talks about
    how windows are crucial in achieving secure and efficient graphics performance.
  + <a href="http://shop.oreilly.com/product/0636920021094.do">This book</a> taught me a lot about how the
    application framework works from an embedded systems point of view... and it taught me a couple of really cool
    `adb` commands too!

As always, thanks for reading, and leave a comment if you have any questions. Don't forget to +1 this blog and share this post on Google+ if you found it interesting!