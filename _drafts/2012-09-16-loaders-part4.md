---
layout: post
title: Tutorial: AppListLoader (part 4)
date: 2012-09-16
permalink: /2012/09/tutorial-loader-loadermanager.html
comments: true
---

<p>This will be my fourth and final post on Loaders and the LoaderManager. Let me know in the comments if they have been helpful! Links to my previous Loader-related posts are given below:</p>

<ul>
<li><b>Part 1:</b> <a href="http://www.androiddesignpatterns.com/2012/07/loaders-and-loadermanager-background.html">Life Before Loaders</a></li>
<li><b>Part 2:</b> <a href="http://www.androiddesignpatterns.com/2012/07/understanding-loadermanager.html">Understanding the LoaderManager</a></li>
<li><b>Part 3:</b> <a href="http://www.androiddesignpatterns.com/2012/08/implementing-loaders.html">Implementing Loaders</a></li>
<li><b>Part 4:</b> <a href="http://www.androiddesignpatterns.com/2012/09/tutorial-loader-loadermanager.html">Tutorial: AppListLoader</a></li>
</ul>

<h4>Introducing AppListLoader</h4>

<p>Due to public demand, I've written a sample application that illustrates how to correctly implement a custom Loader. The application is named <a href="https://play.google.com/store/apps/details?id=com.adp.loadercustom">AppListLoader</a>, and it is a simple demo application that queries and lists all installed applications on your Android device. The application is a modified, re-thought (and bug-free) extension of the <a href="http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android-apps/4.1.1_r1/com/example/android/apis/app/LoaderCustom.java"><code>LoaderCustom.java</code></a> sample that is provided in the API Demos. The application uses an <code>AppListLoader</code> (a subclass of <code>AsyncTaskLoader</code>) to query its data, and the LoaderManager to manage the Loader across the Activity/Fragment lifecycle:<p>

<p><a href="http://4.bp.blogspot.com/-h7hgUFVox1M/UFj92VbYqLI/AAAAAAAAE3w/L6B5li-ZZGw/s1600/framed_device-2012-09-18-185425.png" imageanchor="1"><img height="269" width="400" src="http://4.bp.blogspot.com/-h7hgUFVox1M/UFj92VbYqLI/AAAAAAAAE3w/L6B5li-ZZGw/s400/framed_device-2012-09-18-185425.png" style="border:0px;"/></a></p>

<!--more-->

<p>The AppListLoader registers two <code>BroadcastReceiver</code>s which observe/listen for system-wide broadcasts that impact the underlying data source. The <code>InstalledAppsObserver</code> listens for newly installed, updated, or removed applications, and the <code>SystemLocaleObserver</code> listens for locale changes. For example, if the user changes the language from English to Spanish, the <code>SystemLocaleObserver</code> will notify the AppListLoader to re-query its data so that the application can display each application's name in Spanish (assuming an alternate Spanish name has been provided). Click "Change language" in the options menu and watch the Loader's seamless reaction to the event (it's awesome, isn't it? :P).</p>

<p>Log messages are written to the logcat whenever an important Loader/LoaderManager-related event occurs, so be sure to run the application while analyzing the logcat! Hopefully it'll give you a better understanding of how Loaders work in conjunction with the LoaderManager and the Activity/Fragment lifecycle. Be sure to filter the logcat by application name ("com.adp.loadercustom") for the best results!</p>

<p><a href="http://3.bp.blogspot.com/-fDNIPUJUJ-0/UFYzs313K4I/AAAAAAAAE18/QmIkU1qUfZE/s1600/AppListLoader%2Beclipse.png" imageanchor="1"><img height="260" src="http://3.bp.blogspot.com/-fDNIPUJUJ-0/UFYzs313K4I/AAAAAAAAE18/QmIkU1qUfZE/s400/AppListLoader%2Beclipse.png" style="border: 0px;" width="400" /></a></p>

<h4>Download the App!</h4>

<p>You can download the application from Google Play by clicking the badge below:</p>

<p><a href="https://play.google.com/store/apps/details?id=com.adp.loadercustom" imageanchor="1"><img src="http://2.bp.blogspot.com/-NFnsInNBlFo/UFX2Hj3c7MI/AAAAAAAAE1U/7Nao1V2uyKg/s320/android_app_on_play_large.png" /></a></p>

<h4>Grab the Source Code!</h4>

<p><a href="https://github.com/alexjlockwood/AppListLoader">The source code is available on GitHub</a>. An excessive amount of comments flesh out the entire application-Loader workflow. Download it, import it as an eclipse project, and modify it all you want! :)</p>

<h4>Leave a comment!</h4>

<p>Let me know if these posts have been helpful by leaving a comment below! As always, don't hesitate to ask questions either!</p>