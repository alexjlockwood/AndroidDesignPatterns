---
layout: post
title: 'Why Ice Cream Sandwich Crashes your App'
date: 2012-06-18
permalink: /2012/06/app-force-close-honeycomb-ics.html
---
The following question has plagued StackOverflow ever since Ice Cream
Sandwich's initial release:

> My application works fine on devices running Android 2.x, but
> force closes on devices running Honeycomb (3.x) and Ice Cream
> Sandwich (4.x). Why does this occur?

This is a great question; after all, newer versions of Android are
released with the expectation that old apps will remain compatible
with new devices. In my experience, there are a couple reasons why
this might occur. Most of the time, however, the reason is simple:
_you are performing a potentially expensive operation on the UI
thread_.

<!--more-->

### What is the UI Thread?

The concept and importance of the  application's **main UI thread**
is something every Android developer should understand. Each time an
application is launched, the system creates a thread called "main"
for the application. The main thread (also known as the "UI thread")
is in charge of dispatching events to the appropriate views/widgets
and thus is very important. It's also the thread where your application
interacts with running components of your application's UI. For instance,
if you touch a button on the screen, the UI thread dispatches the touch
event to the view, which then sets its pressed state and posts an invalidate
request to the event queue. The UI thread dequeues this request and then
tells the view to redraw itself.

This single-thread model can yield poor performance unless Android
applications are implemented properly. Specifically, if the UI thread
was in charge of running everything in your entire application,
performing long operations such as network access or database queries
on the UI thread would block the entire user interface. No event would
be able to be dispatched&mdash;including drawing and touchscreen
events&mdash;while the long operation is underway. From the user's
perspective, the application will appear to be frozen.

In these situations, instant feedback is vital. Studies show that
**0.1 seconds** is about the limit for having the user feel that
the system is reacting instantaneously. Anything slower than this
limit will probably be considered as **lag**
(<a href="http://www.useit.com/papers/responsetime.html">Miller 1968; Card et al. 1991</a>).
While a fraction of a second might not seem harmful, even a tenth
of a second can be the difference between a good review and a bad
review on Google Play. Even worse, if the UI thread is blocked
for more than about five seconds, the user is presented with the
notorious "application not responding" (ANR) dialog and the app is
force closed.

### Why Android Crashes Your App

The reason why your application crashes on Android versions 3.0 and above,
but works fine on Android 2.x is because **Honeycomb and Ice Cream Sandwich
are much stricter about abuse against the UI Thread**. For example, when
an Android device running HoneyComb or above detects a network access on
the UI thread, a `NetworkOnMainThreadException` will be thrown:

```
E/AndroidRuntime(673): java.lang.RuntimeException: Unable to start activity
    ComponentInfo{com.example/com.example.ExampleActivity}: android.os.NetworkOnMainThreadException
```

The explanation as to why this occurs is well documented on the Android
developer's site:

> A `NetworkOnMainThreadException` is thrown when an application
> attempts to perform a networking operation on its main thread. This is
> only thrown for applications targeting the Honeycomb SDK or higher.
> Applications targeting earlier SDK versions are allowed to do networking
> on their main event loop threads, but it's heavily discouraged.

Some examples of other operations that ICS and Honeycomb _won't_ allow
you to perform on the UI thread are:

  + Opening a `Socket` connection (i.e. `new Socket()`).
  + HTTP requests (i.e. `HTTPClient` and `HTTPUrlConnection`).
  + Attempting to connect to a remote MySQL database.
  + Downloading a file (i.e. `Downloader.downloadFile()`).

If you are attempting to perform any of these operations on the UI thread, you
_must_ wrap them in a worker thread. The easiest way to do this is to use
of an `AsyncTask`, which allows you to perform asynchronous work on
your user interface. An `AsyncTask` will perform the blocking operations
in a worker thread and will publish the results on the UI thread, without
requiring you to handle threads and/or handlers yourself.

### Conclusion

The reason why I decided to write about this topic is because I have seen it
come up on StackOverflow and other forums countless times. The majority of
the time the error stems from placing expensive operations directly on the UI
thread. To ensure you don't disrupt the user experience, it is very important
to execute Socket connections, HTTP requests, file downloads, and other
long-term operations on a separate Thread. The easiest way to do this is
to wrap your operation in an AsyncTask, which launches a new thread and
allows you to perform asynchronous work on your user interface.

As always, let me know if this was helpful by +1-ing the post or leaving a
comment below! Feel free to ask questions too... I respond to them quickly. :)

### Helpful Links

Here are some helpful links that might help you get started with `AsyncTask`s:

  + <a href="http://developer.android.com/reference/android/os/AsyncTask.html">`AsyncTask`</a> documentation
  + <a href="http://android-developers.blogspot.com/2010/07/multithreading-for-performance.html">Multithreading For Performance</a>
  