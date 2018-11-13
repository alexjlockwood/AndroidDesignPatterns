---
layout: post
title: 'Experimenting with Nested Scrolling'
date: 2018-01-24
permalink: /2018/01/experimenting-with-nested-scrolling.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2016/11/introduction-to-icon-animation-techniques.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
style: |
    .figure-video {
      border-radius: 4px;
    }
    .figure-image {
      width: 100%;
      border-radius: 4px;
      text-align: center;
    }
    .figure-container {
      padding: 0% 10%;
    }
    .figure-parent {
      position: relative;
      width: 100%;
      padding-top: 75%;
    }
    .figure-element {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .caption-container {
      font-size: 10pt;
      margin-left: 20px;
      margin-bottom: 30px
    }
    .caption-element {
      margin-top: 3px;
      margin-bottom:10px;
      text-align: center;
    }
script: |
    function resumeVideo(videoElement) {
      videoElement.load();
      videoElement.play();
    }
---

<!--morestart-->

One of the coolest projects I worked on during my 3 years at Google was Google Expeditions, a virtual reality app that allows teachers to lead students on immersive virtual field trips around the world. I especially enjoyed working on the app's field trip selector screen, which renders a `SurfaceView` behind a beautifully designed card-based layout that allows the user to quickly switch between different VR experiences.

<!--more-->

It's been awhile since I've written Android code (I've spent a majority of the past year building Android developer tools like [Shape Shifter][shapeshifter-github] and [`avocado`][avocado-github]), so the other day I challenged myself to rewrite parts of the screen as an exercise. **Figure 1** shows a side-by-side comparison of Google Expeditions' field trip selector screen and the resulting sample app I wrote (available on [GitHub][adp-nested-scrolling-github] and [Google Play][adp-nested-scrolling-play-store]).

<!-- Figure 1 -->

<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2018/01/24/poster-expeditions-sample.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/01/24/expeditions-sample-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/01/24/expeditions-sample-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2018/01/24/expeditions-sample-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 1</strong> - A side-by-side comparison of the Google Expeditions' Android app vs. the sample app I wrote for this blog post.
    </p>
</div>

As I was working through the code, I was reminded of some of the challenges I faced with Android's nested scrolling APIs when I first wrote the screen a couple of years ago. Introduced in API 21, the nested scrolling APIs make it possible for a scrollable parent view to contain scrollable children views, enabling us to create the scrolling gestures that Material Design formalizes on its [scrolling techniques][material-spec-scrolling-techniques] patterns page. **Figure 2** shows a common use case of these APIs involving a parent `CoordinatorLayout` and a child `NestedScrollView`. Without nested scrolling, the `NestedScrollView` scrolls independently of its surroundings. Once enabled, however, the `CoordinatorLayout` and `NestedScrollView` take turns intercepting and consuming the scroll, creating a 'collapsing toolbar' effect that looks more natural.

<!-- Figure 2 -->

<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2018/01/24/poster-cheesesquare.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/01/24/cheesesquare-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/01/24/cheesesquare-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2018/01/24/cheesesquare-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 2</strong> - A side-by-side comparison of Chris Banes' <a href="https://github.com/chrisbanes/cheesesquare">Cheese Square</a> app with nested scrolling disabled vs. enabled.
    </p>
</div>

How exactly do the nested scrolling APIs work? For starters, you need a parent view that implements [`NestedScrollingParent`][nestedscrollingparent] and a child view that implements [`NestedScrollingChild`][nestedscrollingchild]. In **Figure 3** below, the `NestedScrollView` (`NSV`) is the parent and the `RecyclerView` (`RV`) is the child:

<!-- Figure 3 -->

<div class="figure-container">
    <img
        class="figure-image"
        src="/assets/images/posts/2018/01/24/sample-app-layouts.jpg"
        alt="Sample app layouts"
        title="Sample app layouts">
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 3</strong> - The sample app consists of a parent <code>NestedScrollView</code> and a child <code>RecyclerView</code>.
    </p>
</div>

Let's say the user attempts to scroll the `RV` above. Without nested scrolling, the `RV` will immediately consume the scroll event, resulting in the undesirable behavior we saw in **Figure 2**. What we _really_ want is to create the illusion that the two views are scrolling together as a single unit. More specifically:<sup><a href="#footnote1" id="ref1">1</a></sup>

* If the `RV` is at the top of its content, scrolling the `RV` up should cause the `NSV` to scroll up.
* If the `NSV` is *not* at the bottom of its content, scrolling the `RV` down should cause the `NSV` to scroll down.

As you might expect, the nested scrolling APIs provide a way for the `NSV` and `RV` to communicate with each other throughout the duration of the scroll, so that each view can confidently determine who should consume each scroll event. This becomes clear when you consider the sequence of events that takes place when the user drags their finger on top of the `RV`:

1. The `RV`'s `onTouchEvent(ACTION_MOVE)` method is called.
2. The `RV` calls its own `dispatchNestedPreScroll()` method, which notifies the `NSV` that it is about to consume a portion of the scroll.
3. The `NSV`'s `onNestedPreScroll()` method is called, giving the `NSV` an opportunity to react to the scroll event before the `RV` consumes it.
4. The `RV` consumes the remainder of the scroll (or does nothing if the `NSV` consumed the entire event).
5. The `RV` calls its own `dispatchNestedScroll()` method, which notifies the `NSV` that it has consumed a portion of the scroll.
6. The `NSV`'s `onNestedScroll()` method is called, giving the `NSV` an opportunity to consume any remaining scroll pixels that have still not been consumed.
7. The `RV` returns `true` from the current call to `onTouchEvent(ACTION_MOVE)`, consuming the touch event.<sup><a href="#footnote2" id="ref2">2</a></sup>

Unfortunately, simply using a `NSV` and `RV` was not enough to get the scrolling behavior I wanted. **Figure 4** shows the two problematic bugs that I needed to fix. The cause of both problems is that the `RV` is consuming scroll and fling events when it shouldn't be. On the left, the `RV` should *not* begin scrolling until the card has reached the top of the screen. On the right, flinging the `RV` downwards should collapse the card in a single smooth motion.

<!-- Figure 4 -->

<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2018/01/24/poster-nested-scrolling-bugs1.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/01/24/nested-scrolling-bugs1-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/01/24/nested-scrolling-bugs1-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2018/01/24/nested-scrolling-bugs1-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 4</strong> - On the left, the <code>RV</code> should <i>not</i> begin scrolling until the card has reached the top of the screen. On the right, flinging the <code>RV</code> downwards should collapse the card in a single smooth motion.
    </p>
</div>

Fixing these two problems is relatively straightforward now that we understand how the nested scrolling APIs work. All we need to do is create a `CustomNestedScrollView` class and customize its scrolling behavior by overriding the `onNestedPreScroll()` and `onNestedPreFling()` methods:

```java
/**
 * A NestedScrollView with our custom nested scrolling behavior.
 */
public class CustomNestedScrollView extends NestedScrollView {

  // The NestedScrollView should steal the scroll/fling events away from
  // the RecyclerView if: (1) the user is dragging their finger down and
  // the RecyclerView is scrolled to the top of its content, or (2) the
  // user is dragging their finger up and the NestedScrollView is not
  // scrolled to the bottom of its content.

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) {
    final RecyclerView rv = (RecyclerView) target;
    if ((dy < 0 && isRvScrolledToTop(rv)) || (dy > 0 && !isNsvScrolledToBottom(this))) {
      // Scroll the NestedScrollView's content and record the number of pixels consumed
      // (so that the RecyclerView will know not to perform the scroll as well).
      scrollBy(0, dy);
      consumed[1] = dy;
      return;
    }
    super.onNestedPreScroll(target, dx, dy, consumed);
  }

  @Override
  public boolean onNestedPreFling(View target, float velX, float velY) {
    final RecyclerView rv = (RecyclerView) target;
    if ((velY < 0 && isRvScrolledToTop(rv)) || (velY > 0 && !isNsvScrolledToBottom(this))) {
      // Fling the NestedScrollView's content and return true (so that the RecyclerView
      // will know not to perform the fling as well).
      fling((int) velY);
      return true;
    }
    return super.onNestedPreFling(target, velX, velY);
  }

  /**
   * Returns true iff the NestedScrollView is scrolled to the bottom of its
   * content (i.e. if the card's inner RecyclerView is completely visible).
   */
  private static boolean isNsvScrolledToBottom(NestedScrollView nsv) {
    return !nsv.canScrollVertically(1);
  }

  /**
   * Returns true iff the RecyclerView is scrolled to the top of its
   * content (i.e. if the RecyclerView's first item is completely visible).
   */
  private static boolean isRvScrolledToTop(RecyclerView rv) {
    final LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
    return lm.findFirstVisibleItemPosition() == 0
        && lm.findViewByPosition(0).getTop() == 0;
  }
}
```

We're nearly there! For the perfectionists out there, however, **Figure 5** shows one more bug that would be nice to fix. In the video on the left, the fling stops abruptly once the child reaches the top of its content. What we want is for the fling to finish in a single, fluid motion, as shown in the video on the right.

<!-- Figure 5 -->

<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2018/01/24/poster-nested-scrolling-bugs2.jpg"
            preload="auto"
            onclick="resumeVideo(this)">
            <source src="/assets/videos/posts/2018/01/24/nested-scrolling-bugs2-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2018/01/24/nested-scrolling-bugs2-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2018/01/24/nested-scrolling-bugs2-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 5</strong> - On the left, the fling stops abruptly once the child reaches the top of its content. On the right, the fling completes in a single, fluid motion.
    </p>
</div>

The crux of the problem is that up until recently, the support library did not provide a way for nested scroll children to transfer leftover nested fling velocity up to a nested scroll parent. I won't go into too much detail here because Chris Banes has already written a detailed [blog post][carry-on-scrolling-blog-post] explaining the issue and how it should be fixed.<sup><a href="#footnote3" id="ref3">3</a></sup> But to summarize, all we need to do is update our parent and child views to implement the new-and-improved `NestedScrollingParent2` and `NestedScrollingChild2` interfaces, which were specifically added to address this problem in v26 of the support library.

Unfortunately `NestedScrollView` still implements the older `NestedScrollingParent` interface, so I had to create my own [`NestedScrollView2`][nestedscrollview2] class that implements the `NestedScrollingParent2` interface to get things working.<sup><a href="#footnote4" id="ref4">4</a></sup> The final, bug-free `NestedScrollView` implementation is given below:

```java
/**
 * A NestedScrollView that implements the new-and-improved NestedScrollingParent2
 * interface and that defines its own customized nested scrolling behavior. View
 * source code for the NestedScrollView2 class here: j.mp/NestedScrollView2
 */
public class CustomNestedScrollView2 extends NestedScrollView2 {

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed, int type) {
    final RecyclerView rv = (RecyclerView) target;
    if ((dy < 0 && isRvScrolledToTop(rv)) || (dy > 0 && !isNsvScrolledToBottom(this))) {
      scrollBy(0, dy);
      consumed[1] = dy;
      return;
    }
    super.onNestedPreScroll(target, dx, dy, consumed, type);
  }

  // Note that we no longer need to override onNestedPreFling() here; the
  // new-and-improved nested scrolling APIs give us the nested flinging
  // behavior we want already by default!

  private static boolean isNsvScrolledToBottom(NestedScrollView nsv) {
    return !nsv.canScrollVertically(1);
  }

  private static boolean isRvScrolledToTop(RecyclerView rv) {
    final LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
    return lm.findFirstVisibleItemPosition() == 0
        && lm.findViewByPosition(0).getTop() == 0;
  }
}
```

That's all I've got for now! Thanks for reading, and don't forget to leave a comment below if you have any questions!

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> This blog post uses the same terminology that <a href="https://developer.android.com/reference/android/view/View.html#canScrollVertically(int)">the framework uses</a> to describe scroll directions. That is, dragging your finger toward the bottom of the screen causes the view to scroll <i>up</i>, and dragging your finger towards the top of the screen causes the view to scroll <i>down</i>. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> It's worth noting that nested flings are handled in a very similar fashion. The child detects a fling in its <code>onTouchEvent(ACTION_UP)</code> method and notifies the parent by calling its own <code>dispatchNestedPreFling()</code> and <code>dispatchNestedFling()</code> methods. This triggers calls to the parent's <code>onNestedPreFling()</code> and <code>onNestedFling()</code> methods and gives the parent an opportunity to react to the fling before and after the child consumes it. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>

<sup id="footnote3">3</sup> I recommend watching the second half of Chris Banes' <a href="https://www.youtube.com/watch?v=-bhjI_qLPdE">Droidcon 2016 talk</a> for more information on this topic as well. <a href="#ref3" title="Jump to footnote 3.">&#8617;</a>

<sup id="footnote4">4</sup> If enough people star <a href="https://issuetracker.google.com/issues/69819421">this bug</a>, maybe this won't be necessary in the future! :) <a href="#ref4" title="Jump to footnote 4.">&#8617;</a>

[shapeshifter-github]: https://github.com/alexjlockwood/ShapeShifter
[avocado-github]: https://github.com/alexjlockwood/avocado
[adp-nested-scrolling-github]: https://github.com/alexjlockwood/adp-nested-scrolling
[adp-nested-scrolling-play-store]: https://play.google.com/store/apps/details?id=alexjlockwood.nestedscrolling
[material-spec-scrolling-techniques]: https://material.io/design/components/app-bars-top.html#behavior
[cheesesquare-github]: https://github.com/chrisbanes/cheesesquare
[carry-on-scrolling-blog-post]: https://chris.banes.me/2017/06/09/carry-on-scrolling/
[nestedscrollview2]: https://github.com/alexjlockwood/adp-nested-scrolling/blob/master/app/src/main/java/alexjlockwood/nestedscrolling/NestedScrollView2.java
[recyclerview#startnestedscroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L2158
[recyclerview#dispatchnestedprescroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4849
[recyclerview#dispatchnestedscroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4893
[recyclerview#stopnestedscroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4938
[carry-on-scrolling-blog-post]: https://chris.banes.me/2017/06/09/carry-on-scrolling/
[nestedscrollingchild]: https://developer.android.com/reference/android/support/v4/view/NestedScrollingChild.html
[nestedscrollingparent]: https://developer.android.com/reference/android/support/v4/view/NestedScrollingParent.html
