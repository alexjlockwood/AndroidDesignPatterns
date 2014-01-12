---
layout: post
title: Thread Scheduling in Android
---
This post will give an overview of how thread scheduling works in Android, and will briefly
describe how and when you should set thread priorities yourself to ensure that your application
remains responsive even as multiple threads continue to run in the background.

For those who are unfamiliar with the term, a _scheduler_ is the part of the operating system
in charge of deciding which processes and threads run, when, and for how long. Android's thread
scheduler behaves similarly to the stock scheduler used in Linux, and uses two main factors to
determine how threads are scheduled across the entire system: _nice values_ and _cgroups_.

<!--more-->

### Nice values

Similar to how they are used in Linux's completely fair scheduling policy, _nice values_ in Android
are used as a measure of a thread's priority. Threads with higher niceness (i.e., lower priority,
as in they are being "nice" to other processes and threads in the system) will run less often than
those with lower niceness (higher priority). The most important of these are the
[default](http://developer.android.com/reference/android/os/Process.html#THREAD_PRIORITY_DEFAULT)
and [background](http://developer.android.com/reference/android/os/Process.html#THREAD_PRIORITY_BACKGROUND)
priorities: user interface threads typically run at the default priority, whereas background threads
run in the background priority. Intuitively, background thread priorities should be chosen
inverse-proportionally to the amount of work the thread is expected to do. The more work the
thread will do, the less favorable priority (higher niceness) it should get so that it doesn't
starve the system. 

Nice values are a theoretically important concept because they help reduce how much background work
interrupts the user interface. In practice, however, they alone are not sufficient. For example,
consider ten background threads and a single foreground thread driving the UI. Despite their low
individual priorities, the ten background threads waiting to run will likely impact the performance
of the single foreground thread, resulting in lag and hurting the user experience. At any given moment,
several background services could potentially be waiting to run in the background, so the Android OS
must somehow address these scenarios. Enter _cgroups_.

### Cgroups

To address this problem, Android enforces an even stricter foreground vs. background scheduling policy
using Linux [_cgroups_](http://en.wikipedia.org/wiki/Cgroups) (control groups). To constrain the amount
of CPU time given to background applications, Android assigns threads to one of two cgroups. Threads
in the default, foreground cgroup are scheduled as normal. Threads in the background cgroup, however,
are limited to only a small percent<a href="#footnote1"><sup>1</sup></a> of the device's total CPU
time.<a href="#footnote2"><sup>2</sup></a> This is enough to allow background threads to make some
forward progress, without having enough of an impact on the foreground threads to be generally visible
to the user.

Threads with high nice values are implicitly assigned to the background cgroup. In addition, when an
application goes into the background, Android will implicitly move all of that application's threads
to the background cgroup, as the application's performance is no longer critical to the user. The
automatic assignment of application threads to cgroups helps ensure that the current foreground
application thread will always be the priority, regardless of how many applications are running
in the background.

### The `Process#setThreadPriority(int)` Method

For the most part, the official Android APIs involved with concurrency will automatically assign
each worker thread a background priority before its execution (see the source code for
[`HandlerThread`](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/os/HandlerThread.java)
and [`AsyncTask`](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/os/AsyncTask.java),
for example). It is important to remember, however, that this will not generally be the case otherwise.
For example, raw `Thread`s which are instantiated from the UI thread will inherit its default,
foreground priority, making lag more likely and potentially hurting the application's performance.
Thus, when working with raw `Thread`s, you should <b>always</b> remember to set the thread's
priority by calling
[`Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND)`](https://developer.android.com/reference/android/os/Process.html#setThreadPriority(int))
before it starts. A short code snippet is given below: 

```java
new Thread(new Runnable() {
  @Override
  public void run() {
    // Moves the background thread into the background.
    Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);

    // ...
  }
}).start();
```

As always, thanks for reading, and leave a comment if you have any questions. Don't forget to +1 this blog post too! 

<hr class="footnote-divider" />

<sup><a name="footnote1">1</a></sup> This percentage was 5% at the time of this writing, though it is possible that this value could change in the future.

<sup><a name="footnote2">2</a></sup> Of course, if no foreground thread wants to run, the background threads can use all of the available CPU cycles.