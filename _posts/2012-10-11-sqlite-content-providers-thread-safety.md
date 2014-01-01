---
layout: post
title: 'SQLite, ContentProviders, & Thread Safety'
date: 2012-10-11
permalink: /2012/10/sqlite-contentprovider-thread-safety.html
comments: true
---

A common source of confusion when implementing `ContentProvider`s is that of thread-safety.
We all know that any potentially expensive query should be asynchronous so as not to block
the UI thread, but when, if ever, is it OK to make calls to the `ContentProvider` from
multiple threads?

<!--more-->

## Threads and ContentProviders

The <a href="http://developer.android.com/reference/android/content/ContentProvider.html">documentation</a>
on ContentProviders warns that its methods may be called from multiple threads and therefore
must be thread-safe:

> Data access methods (such as `insert(Uri, ContentValues)` and 
> `update(Uri, ContentValues, String, String[]))` may be called from many
> threads at once, and must be thread-safe.

In other words, Android **does not** synchronize access to the ContentProvider for you.
If two calls to the same method are made simultaneously from separate threads, neither
call will wait for the other. Requiring the client to deal with concurrency themselves
makes sense from a framework developer's point of view. The abstract `ContentProvider` class
cannot assume that its subclasses will require synchronization, as doing so would be
horribly inefficient.

## Ensuring Thread Safety

So now that we know that the ContentProvider is not thread safe, what do we need to
do in order to eliminate potential race conditions? Just make every method
`synchronized`, right?

Well... no, not necessarily. Consider a ContentProvider that uses a `SQLiteDatabase`
as its backing data source. As per the
<a href="http://developer.android.com/reference/android/database/sqlite/SQLiteDatabase.html#setLockingEnabled(boolean)">documentation</a>,
access to the `SQLiteDatabase` is synchronized by default, thus guaranteeing that
no two threads will ever touch it at the same time. In this case, synchronizing
each of the ContentProvider's methods is both unnecessary and costly. Remember
that a `ContentProvider` serves as a wrapper around the underlying data source;
whether or not you must take extra measures to ensure thread safety often depends
on the data source itself.

## Conclusion

Although the ContentProvider lacks in thread-safety, often times you will find that
no further action is required on your part with respect to preventing potential
race conditions. The canonical example is when your ContentProvider is backed by
a `SQLiteDatabase`; when two threads attempt to write to the database at the same
time, the `SQLiteDatabase` will lock itself down, ensuring that one will wait until
the other has completed. Each thread will be given mutually exclusive access to the
data source, ensuring the thread safety is met.

This has been a rather short post, so don't hesitate to leave a comment if you have
any clarifying questions. Don't forget to +1 this post below if you found it helpful!