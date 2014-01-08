---
layout: post
title: Redesigning Android Design Patterns
permalink: /2014-01-08-redesigning-android-design-patterns.html
thumbnails: ['/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png']
---
A couple weeks ago, I began the ambitious task of rewriting this blog from scratch.
Today, I'm happy to introduce a brand new look: one that is cleaner, faster, and more
responsive. Some of the major changes are listed below. You can find the old
version of the site [here](http://androiddesignpatterns.blogspot.com) to use as a reference.

<!--more-->

  + <b>Goodbye Blogger, hello Jekyll.</b> I've never been a huge fan of Blogger and was eager to
    try something new. After a bit of research I decided to give [Jekyll](http://jekyllrb.com/)
    a shot. Unlike Blogger,
    which dynamically parses content and templates on each request, Jekyll generates the entire
    website once beforehand to serve statically, and is much more efficient as a result. It's a little
    under documented and I'm not a huge fan of [Liquid](https://github.com/Shopify/liquid),
    but other than that I have no complaints. I would pick Jekyll over Blogger any day.
    
  + <b>Android Design Patterns is now 100% open-source.</b> The source code powering this blog can
    be found on [GitHub](https://github.com/alexjlockwood/alexjlockwood.github.io), and may be used
    by others as the basis of their own blogging templates under the
    [MIT license](https://github.com/alexjlockwood/alexjlockwood.github.io/blob/master/README.md#license-and-copyright)
    (with the exception of the contents of the actual posts, of course :P).
    Given that this blog wouldn't even exist without Android&mdash;one of the largest open source
    projects in the world&mdash;making the blog 100% open source seemed fitting. Another cool implication of an entirely
    open-source blog is that readers can propose corrections themselves by submitting pull requests
    to GitHub.

  + <b>Faster page loading times.</b> Check out the [old version](http://androiddesignpatterns.blogspot.com) of this blog
    and see for yourself! Rendering
    visible page content is the first priority and all Javascript is executed asynchronously.
    Thanks to Jekyll, there is also no longer any need for Javascript-based libraries such as
    [SyntaxHighlighter](http://alexgorbatchev.com/SyntaxHighlighter/) to dynamically (and synchronously)
    render syntax-highlighted code blocks.
    [Page Speed](https://developers.google.com/speed/pagespeed/) reports 89/100 for mobile devices and 95/100 for desktop computers.

  + <b>Clean, responsive, and mobile-friendly.</b> First of all, I'd like to thank [+Shannon Lee](https://plus.google.com/116871425473751000037)
    for coming up with most of the new design. I consider myself a beginner at web-design, so this couldn't have been done without her!
    I recommend checking out the site on your phone or tablet, as it's one of my favorite
    aspects of the new design. I much prefer it over typical RSS feed reader applications (such as Currents, Newsstand, Flipboard, etc.),
    which typically won't display code blocks properly. Below is a comparison of the old vs. new versions of the site on a Nexus 7:

    <div style="overflow:hidden;width:100%;display:block;">
    <a href="/assets/images/posts/2014/01/08/adp-n7-screenshot-before.png">
    <img style="display:block;float:left;max-width:300px;width:50%;position:relative;" src="/assets/images/posts/2014/01/08/adp-n7-screenshot-before.png"/>
    <a href="/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png">
    <img style="display:block;float:left;max-width:300px;width:50%;position:relative;" src="/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png"/></a>
    </div>

  + <b>Disqus comments.</b> When it came time to pick a third-party commenting platform to use, there weren't
    many options. I ended up choosing [Disqus](http://disqus.com/), as it was one of the few commenting systems that I could find
    that could reliably import my old Blogger comments. Spam detection is also a plus. One of the consequences of
    the migration, however, is that all old threaded comments are now unthreaded, meaning that most of the old 
    comments are a bit of a mess right now. I plan on manually cleaning up these at some point in
    the future. Going forward, all new comments will thread normally.

Let me know what you think of the new design in the comments below! Make sure to also let me know if you have any
suggestions, criticisms, or feature requests&mdash;the design will continue to be refined until it's perfect. :)