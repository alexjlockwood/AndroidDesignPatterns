---
layout: post
title: 'Tutorial: AppListLoader (part 4)'
date: 2012-09-16
permalink: /2012/09/tutorial-loader-loadermanager.html
comments: true
related: [{title: 'Life Before Loaders (part 1)', link: '/2012/07/loaders-and-loadermanager-background.html'},
          {title: 'Understanding the LoaderManager (part 2)', link: '/2012/07/understanding-loadermanager.html'},
          {title: 'Implementing Loaders (part 3)', link: '/2012/08/implementing-loaders.html'}]
---
This will be my fourth and final post on Loaders and the LoaderManager. Let me know in the comments if they have been helpful!
Links to my previous Loader-related posts are given below:

  + **Part 1:** <a href="/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders</a>
  + **Part 2:** <a href="/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a>
  + **Part 3:** <a href="/2012/08/implementing-loaders.html">Implementing Loaders</a>
  + **Part 4:** <a href="/2012/09/tutorial-loader-loadermanager.html">Tutorial: AppListLoader</a>

Due to public demand, I've written a sample application that illustrates how to correctly implement a custom Loader.
The application is named <a href="https://play.google.com/store/apps/details?id=com.adp.loadercustom">AppListLoader</a>,
and it is a simple demo application that queries and lists all installed applications on your Android device.
The application is a modified, re-thought (and bug-free) extension of the
<a href="http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android-apps/4.1.1_r1/com/example/android/apis/app/LoaderCustom.java">LoaderCustom.java</a>
sample that is provided in the API Demos. The application uses an `AppListLoader`
(a subclass of `AsyncTaskLoader`) to query its data, and the LoaderManager to
manage the Loader across the Activity/Fragment lifecycle:

<!--more-->

<a class="no-border" href="/assets/images/posts/2012/09/16/app-screenshot.png">
<img src="/assets/images/posts/2012/09/16/app-screenshot.png" style="border:0px; width:400px; height:269px;"/>
</a>

The AppListLoader registers two `BroadcastReceiver`s which observe/listen for system-wide broadcasts that
impact the underlying data source. The `InstalledAppsObserver` listens for newly installed, updated, or
removed applications, and the `SystemLocaleObserver` listens for locale changes. For example, if the user
changes the language from English to Spanish, the `SystemLocaleObserver` will notify the AppListLoader to
re-query its data so that the application can display each application's name in Spanish (assuming an alternate
Spanish name has been provided). Click "Change language" in the options menu and watch the Loader's seamless
reaction to the event (it's awesome, isn't it? :P).

Log messages are written to the logcat whenever an important Loader/LoaderManager-related event occurs, so be
sure to run the application while analyzing the logcat! Hopefully it'll give you a better understanding of how
Loaders work in conjunction with the LoaderManager and the Activity/Fragment lifecycle. Be sure to filter the
logcat by application name ("com.adp.loadercustom") for the best results!

<a class="no-border" href="/assets/images/posts/2012/09/16/eclipse-screenshot.png">
<img src="/assets/images/posts/2012/09/16/eclipse-screenshot.png" style="border:0px; width:400px; height:260px;"/>
</a>

You can download the application from Google Play by clicking the badge below:

<a class="no-border" href="https://play.google.com/store/apps/details?id=com.adp.loadercustom">
<img src="/assets/images/posts/2012/09/16/google-play-badge.png" />
</a>

<a href="https://github.com/alexjlockwood/AppListLoader">The source code is available on GitHub</a>.
An excessive amount of comments flesh out the entire application-Loader workflow. Download it,
import it as an eclipse project, and modify it all you want!

Let me know if these posts have been helpful by leaving a comment below! As always,
don't hesitate to ask questions either!
