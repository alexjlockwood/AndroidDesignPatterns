---
layout: post
title: How to Leak a Context: Handlers & Inner Classes
date: 2013-01-14
permalink: /2013/01/inner-class-handler-memory-leak.html
comments: true
---

<p>Consider the following code:</p>

```java
public class SampleActivity extends Activity {

  private final Handler mLeakyHandler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      // ... 
    }
  }
}
```

<p>While not readily obvious, this code can cause cause a massive memory leak. Android Lint will give the following warning: <i>"In Android, Handler classes should be static or leaks might occur."</i> But where exactly is the leak and how might it happen? Let's determine the source of the problem by first documenting what we know:</p>

<ol>

<li value="1">
<p>When an Android application first starts, the framework creates a <code><a href="http://developer.android.com/reference/android/os/Looper.html">Looper</a></code> object for the application's main thread. A <code>Looper</code> implements a simple message queue, processing <code><a href="http://developer.android.com/reference/android/os/Message.html">Message</a></code> objects in a loop one after another. All major application framework events (such as Activity lifecycle method calls, button clicks, etc.) are contained inside <code>Message</code> objects, which are added to the <code>Looper</code>'s message queue and are processed one-by-one. The main thread's <code>Looper</code> exists throughout the application's lifecycle.</p>
</li>

<li value="2">
<p>When a <code><a href="http://developer.android.com/reference/android/os/Handler.html">Handler</a></code> is instantiated on the main thread, it is associated with the <code>Looper</code>'s message queue. Messages posted to the message queue will hold a reference to the <code>Handler</code> so that the framework can call <code><a href="http://developer.android.com/reference/android/os/Handler.html#handleMessage(android.os.Message)">Handler#handleMessage(Message)</a></code> when the <code>Looper</code> eventually processes the message.</p>
</li>

<li value="3">
<p>In Java, non-static inner and anonymous classes hold an implicit reference to their outer class. Static inner classes, on the other hand, do not.</p>
</li>
</ol>

<!--more-->

<p>So where exactly is the memory leak? It's very subtle, but consider the following code as an example:</p>

```java
public class SampleActivity extends Activity {

  private final Handler mLeakyHandler = new Handler() {
    @Override
    public void handleMessage(Message msg) {
      // ...
    }
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Post a message and delay its execution for 10 minutes.
    mLeakyHandler.postDelayed(new Runnable() {
      @Override 
      public void run() { }
    }, 60 * 10 * 1000);
    
    // Go back to the previous Activity.
    finish();
  }
}
```

<p>When the activity is finished, the delayed message will continue to live in the main thread's message queue for 10 minutes before it is processed. The message holds a reference to the activity's <code>Handler</code>, and the <code>Handler</code> holds an implicit reference to its outer class (the <code>SampleActivity</code>, in this case). This reference will persist until the message is processed, thus preventing the activity context from being garbage collected and leaking all of the application's resources. Note that the same is true with the anonymous Runnable class on line 15. Non-static instances of anonymous classes hold an implicit reference to their outer class, so the context will be leaked.</p>

<p>To fix the problem, subclass the <code>Handler</code> in a new file or use a static inner class instead. Static inner classes do not hold an implicit reference to their outer class, so the activity will not be leaked. If you need to invoke the outer activity's methods from within the <code>Handler</code>, have the Handler hold a <code>WeakReference</code> to the activity so you don't accidentally leak a context. To fix the memory leak that occurs when we instantiate the anonymous Runnable class, we make the variable a static field of the class (since static instances of anonymous classes do not hold an implicit reference to their outer class):</p>

```java
public class SampleActivity extends Activity {

  /**
   * Instances of static inner classes do not hold an implicit
   * reference to their outer class.
   */
  private static class MyHandler extends Handler {
    private final WeakReference&lt;SampleActivity&gt; mActivity;

    public MyHandler(SampleActivity activity) {
      mActivity = new WeakReference&lt;SampleActivity&gt;(activity);
    }

    @Override
    public void handleMessage(Message msg) {
      SampleActivity activity = mActivity.get();
      if (activity != null) {
        // ...
      }
    }
  }

  private final MyHandler mHandler = new MyHandler(this);

  /**
   * Instances of anonymous classes do not hold an implicit
   * reference to their outer class when they are "static".
   */
  private static final Runnable sRunnable = new Runnable() {
      @Override
      public void run() { }
  };

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Post a message and delay its execution for 10 minutes.
    mHandler.postDelayed(sRunnable, 600000);
    
    // Go back to the previous Activity.
    finish();
  }
}
```

<p>The difference between static and non-static inner classes is subtle, but is something every Android developer should understand. What's the bottom line? Avoid using non-static inner classes in an activity if instances of the inner class outlive the activity's lifecycle. Instead, prefer static inner classes and hold a weak reference to the activity inside.<p>

<p>As always, leave a comment if you have any questions and don't forget to +1 this blog in the top right corner! :)</p>
