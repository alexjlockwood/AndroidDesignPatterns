---
layout: post
title: Redesigning Android Design Patterns
permalink: /2014-01-08-redesigning-android-design-patterns.html
thumbnails: ['/assets/images/posts/2014/01/08/adp-n7-screenshot-after.png']

---
A couple weeks ago, I began the ambitious task of redesigning this blog from scratch.
Today, I'm happy to introduce a brand new look: one that is cleaner, faster, and more
responsive. A few of the major changes are listed below:

  + **Goodbye Blogger, hello Jekyll.** I've never been a huge fan of Blogger and was eager to
    try something new. After a bit of research I decided to give [Jekyll][1] a shot. Unlike Blogger,
    which dynamically parses content and templates on each request, Jekyll generates the entire
    website once beforehand to serve statically, and is much more efficient as a result. So far,
    I have had no complaints.
    
  + **Android Design Patterns is now 100% open-source.** The source code powering this blog can
    be found on [GitHub][2] and may be used by others as the basis of their own blogs under the 
    [MIT license][3] (with the exception of the contents of the actual posts, of course :P).
    Given that this blog wouldn't even exist without Android&mdash;one of the largest open source
    projects in the world&mdash;this seemed fitting. Another cool implication of an entirely
    open-source blog is that readers can propose corrections themselves by submitting pull requests
    to GitHub.

  + **Faster page loading times.** Compare the new design to the [old design][4] and see for yourself. The
    biggest difference is that all Javascript is executed asynchronously, and thus will not block visible
    content from being rendered properly (_ahem_, [SyntaxHighlighter][5]).

  + **Responsive and mobile-friendly.** A blog dedicated to teaching Android best practices
    should be mobile-friendly. The new design is responsive to computers, tablets, and phones of
    all sizes.
    
    <table><tbody>
    <tr><td>photo 1-1
    </td><td>photo 1-2
    </td><td>photo 1-3
	</td></tr></tbody></table>
    
  + **Disqus comments.** When it came the time to pick a third-party commenting platform to use, there weren't
    many options. I ended up choosing [Disqus][6], as it was one of the few commenting systems that I could find
    that could reliably import my old Blogger comments. Spam detection is also a plus. However, one of the consequences of
    the migration is that all old threaded comments are now unthreaded, meaning that some of my older posts with
    lots of comments are a bit of a mess right now. I plan on manually cleaning up these posts at some point in
    the future. Going forward, all new comments will thread normally.

Let me know what you think of the new design in the comments below! 

[1]: http://jekyllrb.com/
[2]: https://github.com/alexjlockwood/alexjlockwood.github.io
[3]: https://github.com/alexjlockwood/alexjlockwood.github.io/blob/master/README.md#license-and-copyright
[4]: http://androiddesignpatterns.blogspot.com
[5]: http://alexgorbatchev.com/SyntaxHighlighter/
[6]: http://disqus.com/

