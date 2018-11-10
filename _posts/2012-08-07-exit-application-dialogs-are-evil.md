---
layout: post
title: "'Exit Application?' Dialogs Are Evil, Don't Use Them!"
date: 2012-08-07
permalink: /2012/08/exit-application-dialogs-are-evil-dont.html
---
Here's a question that is worth thinking about:

> Should I implement an "Exit application?" dialog in my app?

In my experience, the answer is almost always **no**. Consider the official Flickr app,
as an example. At the main screen, the user clicks the back button and is immediately
prompted with a dialog, questioning whether or not the user wishes to exit the application:

<!--more-->

<table>
<tbody>
<tr>
<td style="text-align: center;">
<a class="no-border" href="/assets/images/posts/2012/08/07/back-button-pressed.png"><img alt="Back button pressed." src="/assets/images/posts/2012/08/07/back-button-pressed.png"/></a>
</td>
<td style="text-align: center;">
<a class="no-border" href="/assets/images/posts/2012/08/07/dialog-showing.png"><img alt="An exit dialog is shown." src="/assets/images/posts/2012/08/07/dialog-showing.png"/></a>
</td>
</tr>
<tr>
<td style="text-align: center;">(a) Back button pressed.</td>
<td style="text-align: center;">(b) "Exit Flickr?"</td>
</tr>
</tbody>
</table>

So what went wrong? Well, pretty much everything, at least in my opinion.
Here are the three major flaws I see in Flickr's decision to include the dialog:

  1. **It slows down the user experience.** An additional click is required to leave the application.
     Sure, it doesn't seem like much... but zero clicks is always better than one. Including the
     dialog will annoy the occasional meticulous power user and will make it much more likely
     that people like me will write-up angry rants about it online. To make matters worse, Flickr's
     dialog incorrectly positions the "OK" and  "Cancel" buttons, which as of Android 4.0, should be
     positioned on the right and left respectively. This is also not a _huge_ deal, but it forces
     users to think more than they should need to, and the simple action of exiting the application is
     no longer seamless as a result.

  2. **It is inconsistent.** Name one native Android application that warns the user when they are
     about to exit the application. If you can't, that's because there are none. Of all the familiar,
     Google-made Android apps (Gmail, Google Drive, etc.), exactly _none_ of them exhibit this
     behavior. The user expects the back button to bring him or her back to the top activity on the
     Activity Stack; there is no reason why it shouldn't do otherwise in this simple situation.

  3. **It serves absolutely no purpose.** What baffles me the most, however, is that there is no
     reason to confirm exit in the first place. _Maybe_ the dialog would be OK if there was a
     long-running operation running in the background that is specific to the Activity (i.e. an
     `AsyncTask` that the user might not want canceled). A dialog _might_ also
     make sense if the application took a long time to load, for example, a fancy, video intensive FPS like
     <a href="https://play.google.com/store/apps/details?id=com.madfingergames.deadtrigger">Dead Trigger</a>.
     In Flickr's case, there is no acceptable reason why the user shouldn't be allowed to "back-out" of
     the application immediately.

In my opinion, dialogs are both slow and annoying, and should be used as little as possible.
Always prefer the faster "edit in place" user model (as described
<a href="http://developer.android.com/reference/android/app/Activity.html#SavingPersistentState">here</a>)
when it comes to saving persistent state, and never prompt the user when they wish to "back-out" of the
application unless you have a _very_ good reason for doing so.

As always, let me know if you agree or disagree in the comments below!

**EDIT:** For more discussion on this topic, I recommend reading through the content/comments
of <a href="https://plus.google.com/118417777153109946393/posts/EiXqUDrr6jT">this Google+ post</a> (made by
<a class="g-profile" href="http://plus.google.com/118417777153109946393" target="_blank">+Cyril Mottier</a>,
a very talented Android developer recognized by Google as a
<a href="https://developers.google.com/experts/">Android Developer Expert</a>).