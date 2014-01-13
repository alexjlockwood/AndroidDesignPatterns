---
layout: post
title: Thread Scheduling in Android
related: ['/2013/04/activitys-threads-memory-leaks.html',
          '/2012/10/sqlite-contentprovider-thread-safety.html',
          '/2013/07/binders-window-tokens.html']
---
This post will give an overview of how thread scheduling works in Android, and will briefly
demonstrate how to explicitly set
[thread priorities](http://developer.android.com/reference/android/os/Process.html)
yourself to ensure that your application remains responsive even as multiple threads
run in the background.

For those who are unfamiliar with the term, a _thread scheduler_ is the part of the operating system
in charge of deciding which threads in the system should run, when, and for how long. Android's thread
scheduler uses two main factors to determine how threads are scheduled across the entire
system: _nice values_ and _cgroups_.

<!--more-->

### Nice values

Similar to how they are used in Linux's completely fair scheduling policy, _nice values_ in Android
are used as a measure of a thread's priority. Threads with a higher nice value (i.e., lower priority,
as in they are being "nice" to other threads in the system) will run less often than
those with lower nice values (i.e., higher priority). The two most important of these are the
[default](http://developer.android.com/reference/android/os/Process.html#THREAD_PRIORITY_DEFAULT)
and [background](http://developer.android.com/reference/android/os/Process.html#THREAD_PRIORITY_BACKGROUND)
thread priorities. Intuitively, thread priorities should be chosen
inverse-proportionally to the amount of work the thread is expected to do: the more work the
thread will do, the less favorable thread priority it should get so that it doesn't
starve the system. For this reason, user interface threads (such as the main thread of a foreground `Activity`) 
are typically given a default priority, whereas background threads (such as a thread executing an `AsyncTask`)
are typically given a background priority.

Nice values are theoretically important because they help reduce background work that might otherwise
interrupt the user interface. In practice, however, they alone are not sufficient. For example, consider
twenty background threads and a single foreground thread driving the UI. Despite their low
individual priorities, collectively the twenty background threads will still likely impact the performance
of the single foreground thread, resulting in lag and hurting the user experience. Since at any given moment
several applications could potentially have background threads waiting to run, the Android OS
must somehow address these scenarios. Enter _cgroups_.

### Cgroups

To address this problem, Android enforces an even stricter foreground vs. background scheduling policy
using Linux [_cgroups_](http://en.wikipedia.org/wiki/Cgroups) (control groups). Threads with
background priorities are implicitly moved into a background cgroup, where they are
limited to only a small percentage<sup><a href="#footnote1" id="ref1">1</a></sup> of the available
CPU if threads in other groups are busy. This separation allows background threads to make some
forward progress, without having enough of an impact on the foreground threads to be visible
to the user.

In addition to automatically assigning low-priority threads to the background cgroup, Android ensures that all
threads belonging to applications not currently running in the foreground are implicitly moved to the background cgroup as well. This automatic assignment of application threads to cgroups ensures that the current foreground
application thread will always be the priority, regardless of how many applications are running in the background.

### Setting Priorities with `Process#setThreadPriority(int)`

For the most part, the Android APIs already assign worker threads a background priority for you
(for example, see the source code for
[`HandlerThread`](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/os/HandlerThread.java)
and [`AsyncTask`](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/os/AsyncTask.java)). It is important to remember, however, that this will not always be the case.
`Thread`s and `ExecutorService`s that are instantiated on the main UI thread, for example,
will inherit a default, foreground priority, making lag more likely and possibly hurting
the application's performance. In these cases, you should _always_ remember to set the thread's
priority by calling
<a href="https://developer.android.com/reference/android/os/Process.html#setThreadPriority(int)">`Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND)`</a>
before the `Thread` is run. Doing so is straightforward, as shown in the example below:

```java
new Thread(new Runnable() {
  @Override
  public void run() {
    Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);

    // ...
  }
}).start();
```

As always, thanks for reading, and leave a comment if you have any questions. Don't forget to +1 this blog post too! 

<hr class="footnote-divider" />

<sup id="footnote1">1</sup> This percentage was 5% at the time of this writing, though it is possible that this value could change in the future. As of Android 4.4.2, cgroup mount points are created and initialized at boot-up in [`/system/core/rootdir/init.rc`](https://android.googlesource.com/platform/system/core/+/android-sdk-4.4.2_r1/rootdir/init.rc) (see lines 100-123). <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>