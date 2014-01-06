---
layout: post
title: 'Reaping the Benefits of the LoaderManager'
date: 2012-05-26
permalink: /2012/05/why-you-should-use-loadermanager.html
---
With Android 3.0 came the introduction of the `LoaderManager` class, an abstract
class associated with an `Activity` or `Fragment` for managing one or
more `Loader` instances. The `LoaderManager` class is one of my favorite
additions to the Android framework for a number of reasons, but mostly because it _significantly_
reduces code complexity and makes your application run a lot smoother. Implementing data loaders
with the `LoaderManager` is simple to implement, and takes care of everything about
lifecycle management so are much less error prone.

<!--more-->

While applications are free to write their own loaders for loading various types of data, the
most common (and simplest) use of the `LoaderManager` is with a `CursorLoader`.
When done correctly, the `CursorLoader` class offloads the work of loading data on a thread,
and keeps the data persistent during short term activity refresh events, such as an orientation change.
In addition to performing the initial query, the `CursorLoader` registers a
`ContentObserver` with the dataset you requested and calls `forceLoad()`
on itself when the data set changes, and is thus auto-updating. This is extremely convenient for
the programmer, as he doesn't have to worry about performing these queries himself. Further,
for bigger screens it becomes more important that you query on a separate thread since configuration
changes involve recreating the entire view layout, a complex operation that can cause disasters
when blocked.

As mentioned earlier, one could implement his or her class to load data on a separate
thread using an `AsyncTask` or even a `Thread`.
The point, however, is that the `LoaderManager` does this all for you, so
it's convenient for the developer, less error prone, and simple to implement. Of course
it is possible to use an `AsyncTask` to keep your application UI thread friendly,
but it will involve a lot more code, and implementing your class so that it will retain the
loaded `Cursor` over the twists and turns of the `Activity` lifecycle
won't be simple. The bottom line is that `LoaderManager` will do this automatically
for you, as well as taking care of correctly creating and closing the `Cursor`
based on the `Activity` lifecycle.

To use `LoaderManager` with (or without) the `CursorLoader`
in an app targeting pre-Honeycomb devices, you should make use of the classes provided
in the Android Support Package, including the `FragmentActivity` class. A
`FragmentActivity` is just an `Activity` that has been created
for Android compatibility support, and does not require the use of fragments in your
application. When transitioning from an `Activity`s to `FragmentActivity`s,
be extremely careful that you use the `getSupportLoaderManager()` instead of
`getLoaderManager()`. `FragmentActivity` extends `Activity`,
thus inheriting all of its methods, and as a result the compiler will not complain if you
accidentally mix up these methods, so be very careful!

<p>Leave a comment if you have any questions or criticisms... or just to let me know
that you managed to read through this entire post without getting distracted! I'm also
open to providing more explicit code samples if anyone asks.