---
layout: post
title: Activitys, Threads, & Memory Leaks
date: 2013-04-15
permalink: /2013/04/activitys-threads-memory-leaks.html
comments: true
---

<p>A common difficulty in Android programming is coordinating long-running tasks over the Activity lifecycle and avoiding the subtle memory leaks which might result. Consider the Activity code below, which starts and loops a new thread upon its creation:</p>

```java
/**
 * Example illustrating how threads persist across configuration
 * changes (which cause the underlying Activity instance to be
 * destroyed). The Activity context also leaks because the thread
 * is instantiated as an anonymous class, which holds an implicit
 * reference to the outer Activity instance, therefore preventing
 * it from being garbage collected.
 */
public class MainActivity extends Activity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    exampleOne();
  }

  private void exampleOne() {
    new Thread() {
      @Override
      public void run() {
        while (true) {
          SystemClock.sleep(1000);
        }
      }
    }.start();
  }
}
```

<p><b>Note:</b> the source code in this blog post is available on <a href="https://github.com/alexjlockwood/leaky-threads">GitHub</a>.</p>

<p>When a configuration change occurs, causing the entire Activity to be destroyed and re-created, it is easy to assume that Android will clean up after us and reclaim the memory associated with the Activity and its running thread. However, this is not the case. Both will leak never to be reclaimed, and the result will likely be a significant reduction in performance.</p>

<!--more-->

<h4>How to Leak an Activity</h4>

<p>The first memory leak should be immediately obvious if you read my <a href="http://www.androiddesignpatterns.com/2013/01/inner-class-handler-memory-leak.html">previous post</a> on Handlers and inner classes. In Java, non-static anonymous classes hold an implicit reference to their enclosing class. If you're not careful, storing this reference can result in the Activity being retained when it would otherwise be eligible for garbage collection. Activity objects hold a reference to their entire view hierarchy and all its resources, so if you leak one, you leak a lot of memory.</p>

<p>The problem is only exacerbated by configuration changes, which signal the destruction and re-creation of the entire underlying Activity. For example, after ten orientation changes running the code above, we can see (using <a href="http://www.eclipse.org/mat/">Eclipse Memory Analyzer</a>) that each Activity object is in fact retained in memory as a result of these implicit references:</p>

<table align="center" cellpadding="0" cellspacing="0" class="tr-caption-container" style="float: center; margin-left: 0em; text-align: left;">
  <tbody>
    <tr><td style="text-align: center;"><a href="http://4.bp.blogspot.com/-EKohlXPS6dk/UWwwQaH8AEI/AAAAAAAAHJI/EIFY4B3yg6w/s1600/chart134.png" imageanchor="1" style="margin-left: auto; margin-right: auto;"><img border="0" height="175" src="http://4.bp.blogspot.com/-EKohlXPS6dk/UWwwQaH8AEI/AAAAAAAAHJI/EIFY4B3yg6w/s400/chart134.png" width="400" /></a>
    </td></tr>
    <tr><td class="tr-caption" style="text-align: center;">Figure 1. Activity instances retained in memory after ten orientation changes.
    </td></tr>
  </tbody>
</table>

<p>After each configuration change, the Android system creates a new Activity and leaves the old one behind to be garbage collected. However, the thread holds an implicit reference to the old Activity and prevents it from ever being reclaimed. As a result, each new Activity is leaked and all resources associated with them are never able to be reclaimed.</p>

<p>The fix is easy once we've identified the source of the problem: declare the thread as a private static inner class as shown below.</p>

```java
/**
 * This example avoids leaking an Activity context by declaring the 
 * thread as a private static inner class, but the threads still 
 * continue to run even across configuration changes. The DVM has a
 * reference to all running threads and whether or not these threads
 * are garbaged collected has nothing to do with the Activity lifecycle.
 * Active threads will continue to run until the kernel destroys your 
 * application's process.
 */
public class MainActivity extends Activity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    exampleTwo();
  }

  private void exampleTwo() {
    new MyThread().start();
  }

  private static class MyThread extends Thread {
    @Override
    public void run() {
      while (true) {
        SystemClock.sleep(1000);
      }
    }
  }
}
```

<p>The new thread no longer holds an implicit reference to the Activity, and the Activity will be eligible for garbage collection after the configuration change.</p>

<h4>How to Leak a Thread</h4>

<p>The second issue is that for each new Activity that is created, a thread is leaked and never able to be reclaimed. Threads in Java are GC roots; that is, the Dalvik Virtual Machine (DVM) keeps hard references to all active threads in the runtime system, and as a result, threads that are left running will never be eligible for garbage collection. For this reason, you must remember to implement cancellation policies for your background threads! One example of how this might be done is shown below:</p>

```java
/**
 * Same as example two, except for this time we have implemented a
 * cancellation policy for our thread, ensuring that it is never 
 * leaked! onDestroy() is usually a good place to close your active 
 * threads before exiting the Activity.
 */
public class MainActivity extends Activity {
  private MyThread mThread;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    exampleThree();
  }

  private void exampleThree() {
    mThread = new MyThread();
    mThread.start();
  }

  /**
   * Static inner classes don't hold implicit references to their
   * enclosing class, so the Activity instance won't be leaked across
   * configuration changes.
   */
  private static class MyThread extends Thread {
    private boolean mRunning = false;

    @Override
    public void run() {
      mRunning = true;
      while (mRunning) {
        SystemClock.sleep(1000);
      }
    }

    public void close() {
      mRunning = false;
    }
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
    mThread.close();
  }
}
```

<p>In the code above, closing the thread in <code>onDestroy()</code> ensures that you never accidentally leak the thread. If you want to persist the same thread across configuration changes (as opposed to closing and re-creating a new thread each time), consider using a retained, UI-less worker fragment to perform the long-running task. Check out my blog post, titled <a href="http://www.androiddesignpatterns.com/2013/04/retaining-objects-across-config-changes.html">Handling Configuration Changes with Fragments</a>, for an example explaining how this can be done. There is also a comprehensive example available in the <a href="https://android.googlesource.com/platform/development/+/master/samples/ApiDemos/src/com/example/android/apis/app/FragmentRetainInstance.java">API demos</a> which illustrates the concept.</p>

<h4>Conclusion</h4>

<p>In Android, coordinating long-running tasks over the Activity lifecycle can be difficult and memory leaks can result if you aren't careful. Here are some general tips to consider when dealing with coordinating your long-running background tasks with the Activity lifecycle:</p>

<ul>

<li><p><b>Favor static inner classes over nonstatic.</b> Each instance of a nonstatic inner class will have an extraneous reference to its outer Activity instance. Storing this reference can result in the Activity being retained when it would otherwise be eligible for garbage collection. If your static inner class requires a reference to the underlying Activity in order to function properly, make sure you wrap the object in a <code>WeakReference</code> to ensure that you don't accidentally leak the Activity.</p></li>

<li><p><b>Don't assume that Java will ever clean up your running threads for you.</b> In the example above, it is easy to assume that when the user exits the Activity and the Activity instance is finalized for garbage collection, any running threads associated with that Activity will be reclaimed as well. <i>This is never the case.</i> Java threads will persist until either they are explicitly closed or the entire process is killed by the Android system. As a result, it is extremely important that you remember to implement cancellation policies for your background threads, and to take appropriate action when Activity lifecycle events occur.</p></li>

<li><p><b>Consider whether or not you should use a Thread.</b> The Android application framework provides many classes designed to make background threading easier for developers. For example, consider using a Loader instead of a thread for performing short-lived asynchronous background queries in conjunction with the Activity lifecycle. Likewise, if your the background thread is not tied to any specific Activity, consider using a Service and report the results back to the UI using a <code>BroadcastReceiver</code>. Lastly, remember that everything discussed regarding threads in this blog post also applies to <code>AsyncTask</code>s (since the <code>AsyncTask</code> class uses an ExecutorService to execute its tasks). However, given that <code>AsyncTask</code>s should only be used for short-lived operations ("a few seconds at most", as per the <a href="http://developer.android.com/reference/android/os/AsyncTask.html">documentation</a>), leaking an Activity or a thread by these means should never be an issue.</p></li>

</ul>

<p>The source code for this blog post is available on <a href="https://github.com/alexjlockwood/leaky-threads">GitHub</a>. A standalone application (which mirrors the source code exactly) is also available for download on <a href="https://play.google.com/store/apps/details?id=com.adp.leaky.threads">Google Play</a>.</p>

<p><a href="https://play.google.com/store/apps/details?id=com.adp.leaky.threads" imageanchor="1" ><img border="0" src="http://4.bp.blogspot.com/-N40gsQs2Ytg/UXycCupURtI/AAAAAAAAHKE/HNLW-xEGGrc/s320/Screenshot_2013-04-27-16-22-17.png" /></a></p>

<p>As always, leave a comment if you have any questions and don't forget to +1 this blog in the top right corner!</p>