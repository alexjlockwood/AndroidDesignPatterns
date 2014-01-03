---
layout: post
title: 'Use Go to Implement your Android Backends'
date: 2013-01-12
permalink: /2013/01/gcm-appengine-golang-android-backends.html
comments: true
---
A couple weeks ago I wrote a <a href="http://github.com/alexjlockwood/gcm">library</a>
that simplifies the interaction between Go-based application servers and Google Cloud
Messaging servers. I plan on covering GCM (both the application-side and server-side
aspects) in more detail in a future blog post, but for now I will just leave a link
to the library to encourage more people to write their GCM application servers using
the Go Programming Language 
(<a href="https://developers.google.com/appengine/docs/go/overview">Google App Engine</a>,
hint hint).

_...but why Go?_

I'm glad you asked. There are several reasons:

<!--more-->

  + <strong><em>Go is modern.</em></strong> Programming languages like C, C++, and Java
    are old, designed before the advent of multicore machines, networking, and web
    application development. Go was designed to be suitable for writing large Google
    programs such as web servers.

  + <strong><em>Go is concise, yet familiar.</em></strong> Tasks that require 40+ lines of code
    in Java (i.e. setting up HTTP servers and parsing JSON responses) can be done in 1 or 2
    lines. Go significantly reduces the amount of work required to write simple programs,
    and yet the language's syntax is not too radical, still resembling the most common
    procedural languages.

  + <strong><em>Go is easy to learn.</em></strong> Learn the language in a day: 
    <a href="http://tour.golang.org">A Tour of Go</a> and 
    <a href="http://golang.org/doc/effective_go.html">Effective Go</a>.

  + <strong><em>Go was invented at Google.</em></strong> Enough said. :)

That's all for now... but expect a lot more on GCM, Google App Engine, and Golang
later! The comments are open as always, and don't forget to +1 this post!

### Links

  + <a href="https://github.com/alexjlockwood/gcm">Google Cloud Messaging for Go</a>
  + <a href="https://developers.google.com/appengine/">Google App Engine</a>
  + <a href="http://tour.golang.org">A Tour of Go</a>
  + <a href="http://golang.org/doc/effective_go.html">Effective Go</a>
  + <a href="http://golang.org">golang.org</a>
