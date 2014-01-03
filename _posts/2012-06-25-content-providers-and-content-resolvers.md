---
layout: post
title: 'Content Providers & Content Resolvers'
date: 2012-06-25
permalink: /2012/06/content-resolvers-and-content-providers.html
comments: true
---
Content Providers and Content Resolvers are a common source of confusion for beginning
Android developers. Further, online tutorials and sample code are not sufficient in
describing how the two classes work together to provide access to the Android data
model. This post hopes to fill in this gap by explaining their place in the
`android.content` package. It concludes with a walk through the life of a
simple query to the Content Resolver.

<!--more-->

### The `android.content` Package

The <a href="http://developer.android.com/reference/android/content/package-summary.html">`android.content`</a>
package contains classes for accessing and publishing data. The Android framework
enforces a **robust** and **secure** data sharing model. Applications are _not_
allowed direct access to other application's internal data. Two classes in the
package help enforce this requirement: the `ContentResolver` and the `ContentProvider`.

### What is the Content Resolver?

The Content Resolver is the single, global instance in your application that provides
access to your (and other applications') content providers. The Content Resolver
behaves exactly as its name implies: it accepts requests from clients, and _resolves_
these requests by directing them to the content provider with a distinct authority.
To do this, the Content Resolver stores a mapping from authorities to Content Providers.
This design is important, as it allows a simple and secure means of accessing other
applications' Content Providers.

The Content Resolver includes the CRUD (create, read, update, delete) methods corresponding
to the abstract methods (insert, delete, query, update) in the Content Provider class.
The Content Resolver does not know the implementation of the Content Providers it is
interacting with (nor does it need to know); each method is passed an URI that specifies
the Content Provider to interact with.

### What is a Content Provider?

Whereas the Content Resolver provides an abstraction from the application's Content Providers,
Content Providers provides an abstraction from the underlying data source
(i.e. a SQLite database). They provide mechanisms for defining data security (i.e. by
enforcing read/write permissions) and offer a standard interface that connects data
in one process with code running in another process.

Content Providers provide an interface for publishing and consuming data, based around a
simple URI addressing model using the `content://` schema. They enable you to decouble
your application layers from the underlying data layers, making your application
data-source agnostic by abstracting the underlying data source.

### The Life of a Query

So what exactly is the step-by-step process behind a simple query? As described above,
when you query data from your database via the content provider, you don't communicate
with the provider directly. Instead, you use the Content Resolver object to communicate
with the provider. The specific sequence of events that occurs when a query is made
is given below:

  1. A call to `getContentResolver().query(Uri, String, String, String, String)` is made. 
     The call invokes the Content Resolver's `query` method, _not_ the `ContentProvider`'s.
  2. When the `query` method is invoked, the Content Resolver parses the `uri` argument 
     and extracts its authority.
  3. The Content Resolver directs the request to the content provider registered with the
     (unique) authority. This is done by calling the Content Provider's `query` method.
  4. When the Content Provider's `query` method is invoked, the query is performed and
     a Cursor is returned (or an exception is thrown). The resulting behavior depends
     entirely on the Content Provider's implementation.

### Conclusion

An integral part of the 
<a href="http://developer.android.com/reference/android/content/package-summary.html">`android.content`</a>
package, the `ContentResolver` and `ContentProvider` classes work together to
ensure secure access to other applications' data. Understanding how the underlying
system works becomes second nature once you've written enough Android code, but I
hope that someone finds this explanation helpful some day.

Let me know if you have any questions about the process!