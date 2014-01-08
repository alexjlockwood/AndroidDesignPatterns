---
layout: post
title: Redesigning Android Design Patterns
permalink: /2014-01-08-redesigning-android-design-patterns.html
thumbnails: ['/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png']
---
A couple weeks ago, I began the ambitious task of redesigning this blog from scratch.
Today, I'm happy to introduce a brand new look: one that is cleaner, faster, and more
responsive. Some of the major changes are listed below (if this is your first time visiting
the site, the old version of the site can be found [here][0]):

<!--more-->

  + <b>Goodbye Blogger, hello Jekyll.</b> I've never been a huge fan of Blogger and was eager to
    try something new. After a bit of research I decided to give [Jekyll][1] a shot. Unlike Blogger,
    which dynamically parses content and templates on each request, Jekyll generates the entire
    website once beforehand to serve statically, and is much more efficient as a result. So far,
    I have had no complaints.
    
  + <b>Android Design Patterns is now 100% open-source.</b> The source code powering this blog can
    be found on [GitHub][2] and may be used by others as the basis of their own blogs under the 
    [MIT license][3] (with the exception of the contents of the actual posts, of course :P).
    Given that this blog wouldn't even exist without Android&mdash;one of the largest open source
    projects in the world&mdash;this seemed fitting. Another cool implication of an entirely
    open-source blog is that readers can propose corrections themselves by submitting pull requests
    to GitHub.

  + <b>Faster page loading times.</b> Compare the new design to the old design and see for yourself! The
    biggest difference is that all Javascript is executed asynchronously, and thus will not block visible
    content from being rendered properly (<em>ahem</em> , [SyntaxHighlighter][4]).

  + <b>Clean, responsive, and mobile-friendly.</b> A blog dedicated to teaching Android best practices
    should be mobile-friendly. The new design is responsive to computers, tablets, and phones of
    all sizes. I recommend checking out the site on your phone or tablet, as it's one of my favorite
    aspects of the new design. Below is a comparison of the old vs. new versions of the site on a Nexus 7:

    <div style="overflow:hidden;width:100%;display:block;">
    <a href="/assets/images/posts/2014/01/08/adp-n7-screenshot-before.png"><img style="display:block;float:left;max-width:300px;width:50%;position:relative;" src="/assets/images/posts/2014/01/08/adp-n7-screenshot-before.png"/>
    <a href="/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png">
    <img style="display:block;float:left;max-width:300px;width:50%;position:relative;" src="/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png"/></a>
    </div>
    
    Overall, the site is cleaner and better organized (and print-friendly too)!
        
  + <b>Disqus comments.</b> When it came time to pick a third-party commenting platform to use, there weren't
    many options. I ended up choosing [Disqus][5], as it was one of the few commenting systems that I could find
    that could reliably import my old Blogger comments. Spam detection is also a plus. One of the consequences of
    the migration, however, is that all old threaded comments are now unthreaded, meaning that most of the old 
    comments are a bit of a mess right now. I plan on manually cleaning up these at some point in
    the future. Going forward, all new comments will thread normally.

Let me know what you think of the new design in the comments below! Make sure to also let me know if you have any
suggestions, criticisms, or feature requests&mdash;I will continue to refine the design until I think it's perfect. :)

Special thanks to [+Shannon Lee][6] as well for helping me out with the design!

[0]: http://androiddesignpatterns.blogspot.com
[1]: http://jekyllrb.com/
[2]: https://github.com/alexjlockwood/alexjlockwood.github.io
[3]: https://github.com/alexjlockwood/alexjlockwood.github.io/blob/master/README.md#license-and-copyright
[4]: http://alexgorbatchev.com/SyntaxHighlighter/
[5]: http://disqus.com/
[6]: https://plus.google.com/116871425473751000037
