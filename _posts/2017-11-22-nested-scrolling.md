---
layout: post
title: 'Nested scrolling'
date: 2017-11-22
permalink: /2017/11/nested-scrolling.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
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

As I reflect on my 3 years at Google, my favorite memories were probably from the time I spent working on Google Expeditions, a virtual reality app that allows teachers to lead their students on immersive virtual field trips all over the world. The team was small and our UX team was ambitious, so for a little over half a year I helped rewrite and polish the app's UI in time for its first public release. I especially enjoyed writing the app's field trip selector screen, which rendered a SurfaceView behind a beautifully designed card-based layout that allowed the user to quickly switch between different VR experiences.

<!--more-->

It's been awhile since I've written hardcore Android code (I've spent a majority of the past year building Android developer tools like [Shape Shifter][shapeshifter-github] and [avdo][avdo-github]), so the other day I attempted to rewrite parts of the screen, mostly as a technical exercise. **Figure 1** shows a side-by-side comparison of Google Expeditions' field trip selector screen and the resulting sample app I wrote (available on [GitHub][adp-nested-scrolling-github] and [Google Play][adp-nested-scrolling-play-store]).

<!-- Figure 1 -->
<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2017/11/22/poster-expeditions-sample.jpg"
            preload="auto"
            onclick="resumeVideo(this)" >
            <source src="/assets/videos/posts/2017/11/22/expeditions-sample-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2017/11/22/expeditions-sample-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2017/11/22/expeditions-sample-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 1</strong> - A side-by-side comparison of the Google Expeditions' Android app vs. the sample app I wrote for this blog post.
    </p>
</div>

As I was writing the sample app's code, I was reminded of some of the initial confusion I had with Android's nested scrolling APIs when I first wrote the screen a couple of years ago. First introduced in API 21, Android's nested scrolling APIs make it possible for scrollable views to exist as children inside of other scrollable views, allowing us to create the fancy scrolling gestures that Material Design formalizes on its [scrolling techniques][material-spec-scrolling-techniques] patterns page. **Figure 2** shows a common use case involving a parent `CoordinatorLayout` and a child `NestedScrollView` from Chris Banes' [Cheese Square][cheesesquare-github] app. Without nested scrolling, the `NestedScrollView` scrolls independently of its surroundings. When enabled, however, the `CoordinatorLayout` and `NestedScrollView` cooperate with each other throughout the duration of the scroll in order to create a cool "collapsing toolbar" effect that feels more fluid and natural.

<!-- Figure 2 -->
<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2017/11/22/poster-cheesesquare.jpg"
            preload="auto"
            onclick="resumeVideo(this)" >
            <source src="/assets/videos/posts/2017/11/22/cheesesquare-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2017/11/22/cheesesquare-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2017/11/22/cheesesquare-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 2</strong> - A side-by-side comparison of Chris Banes' <a href="https://github.com/chrisbanes/cheesesquare">Cheese Square</a> app with nested scrolling disabled vs. enabled.
    </p>
</div>

So how exactly do the nested scrolling APIs work anyway?

Well, for starters, you'll need two views in your hierarchy that implement the [`NestedScrollingParent`][NestedScrollingParent] and [`NestedScrollingChild`][NestedScrollingChild] interfaces. In my case, the parent is a `NestedScrollView` and the child is a `RecyclerView`, as shown in **Figure 3** below. The obvious question is what happens if the user begins a scroll gesture on top of the red area below? Should it cause the `NestedScrollView` or `RecyclerView` to be scrolled? How does the app make this decision?

<!-- Figure 3 -->
<div class="figure-container">
    <img
        class="figure-image"
        src="/assets/images/posts/2017/11/22/sample-app-layouts.jpg"
        alt="Sample app layouts"
        title="Sample app layouts">
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 3</strong> - The sample app consists of a parent <code>NestedScrollView</code> and a child <code>RecyclerView</code>.
    </p>
</div>

To answer these questions, let's walk through the exact sequence of events that occurs when the user begins a scroll gesture on top of the child `RecyclerView`.

1. The user drags their finger on top of the `RecyclerView`.
2. The `RecyclerView`'s `onTouchEvent(ACTION_MOVE)` method is called.
3. The `RecyclerView` notifies the `NestedScrollView` that a scroll event is in progress by calling its own `dispatchNestedPreScroll()` method.
4. As a result, the `NestedScrollView`'s `onNestedPreScroll()` method is called, giving the `NestedScrollView` an opportunity to react to the scroll event before the `RecyclerView` consumes it.
5. The `RecyclerView` consumes the remainder of the scroll (or does nothing if the `NestedScrollView` consumed the entire event).
6. The `RecyclerView` notifies the `NestedScrollView` that it has consumed a portion of the scroll by calling its own `dispatchNestedScroll()` method, .
7. As a result, the `NestedScrollView`'s `onNestedScroll()` method is called, giving the `NestedScrollView` an opportunity to consume any remaining scroll pixels that have still not been consumed.
8. The `RecyclerView` returns `true` from the current call to `onTouchEvent(ACTION_MOVE)`, consuming the touch event.

Steps 4 and 7 are the most important steps to understand. The `onNestedPreScroll()` and `onNestedScroll()` methods give the parent an opportunity to react to a scroll event before and after the child consumes it respectively. Nested flings are handled similarly. The `RecyclerView` detects a fling in its `onTouchEvent(ACTION_UP)` method, notifies the parent by calling its own `dispatchNestedPreFling()` and `dispatchNestedFling()` methods, which triggers a call to the parent's `onNestedPreFling()` and `onNestedFling()` methods, giving the parent an opportunity to react to the fling before the child consumes it.

I mentioned earlier that I was initially confused by the nested scrolling APIs, mainly because my first attempt at the app didn't work as I expected. There were two main bugs, as shown in **Figure 4**. On the left, the `RecyclerView` should **not** begin scrolling its content until the card has been scrolled all the way to the top of the screen. On the right, flinging the `RecyclerView` downwards should collapse the card in a single smooth motion.

<!-- Figure 4 -->
<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2017/11/22/poster-nested-scrolling-bugs1.jpg"
            preload="auto"
            onclick="resumeVideo(this)" >
            <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs1-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs1-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs1-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 4</strong> -
    </p>
</div>

In both cases, the root of the problem is that the `RecyclerView` is consuming the scroll and fling events when it shouldn't be. So to fix the problem, I created a custom `NestedScrollView` class:

```java
public class CustomNestedScrollView extends NestedScrollView {

  // The NestedScrollView should steal the scroll/fling events away from the
  // RecyclerView if: (1) the user is dragging their finger down and the
  // RecyclerView is scrolled to the top of its content, or (2) the user
  // is dragging their finger up and the NestedScrollView is not scrolled
  // to the bottom of its content.

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) {
    final RecyclerView rv = (RecyclerView) target;
    if ((dy < 0 && isRvScrolledToTop(rv)) || (dy > 0 && !isNsvScrolledToBottom(this))) {
      // Scroll the NestedScrollView's content and record the number of pixels consumed
      // so that the RecyclerView doesn't perform the scroll as well.
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
      // Fling the NestedScrollView's content and return true so that the RecyclerView
      // doesn't perform the fling as well.
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

There is still one more bug that we need to fix, shown in **Figure 5**:

<!-- Figure 5 -->
<div class="figure-container">
    <div class="figure-parent">
        <video
            class="figure-video figure-element"
            poster="/assets/videos/posts/2017/11/22/poster-nested-scrolling-bugs2.jpg"
            preload="auto"
            onclick="resumeVideo(this)" >
            <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs2-opt.mp4" type="video/mp4">
            <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs2-opt.webm" type="video/webm">
            <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs2-opt.ogv" type="video/ogg">
        </video>
    </div>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 5</strong> - The video on the left is buggy. The video on the right is not.
    </p>
</div>

Chris Banes wrote a [blog post][carry-on-scrolling-blog-post] last June explaining the issue.

For some reason `NestedScrollView` was updated to implement the `NestedScrollingChild2` interface, but not the `NestedScrollingParent2` interface. So I had to create another custom class ([source code][NestedScrollView2]). Then I could update my custom nested scroll view to extend the new base class.

Note that I no longer need to override `onNestedPreFling()`. When the user lifts their finger and a fling begins, the `RecyclerView` calls `fling()` on itself, which begins a new round of nested scrolling beginning with a call to [`startNestedScroll(TYPE_NON_TOUCH)`][RecyclerView#startNestedScroll], then [`dispatchNestedPreScroll(TYPE_NON_TOUCH)`][RecyclerView#dispatchNestedPreScroll], then [`dispatchNestedScroll(TYPE_NON_TOUCH)`][RecyclerView#dispatchNestedScroll], and finally [`stopNestedScroll(TYPE_NON_TOUCH)`][RecyclerView#stopNestedScroll].

And we're done!

  [shapeshifter-github]: https://github.com/alexjlockwood/ShapeShifter
  [avdo-github]: https://github.com/alexjlockwood/avdo
  [adp-nested-scrolling-github]: https://github.com/alexjlockwood/adp-nested-scrolling
  [adp-nested-scrolling-play-store]: https://play.google.com/store/apps/details?id=alexjlockwood.nestedscrolling
  [material-spec-scrolling-techniques]: https://material.io/guidelines/patterns/scrolling-techniques.html#scrolling-techniques-app-bar-scrollable-regions
  [cheesesquare-github]: https://github.com/chrisbanes/cheesesquare
  [carry-on-scrolling-blog-post]: https://chris.banes.me/2017/06/09/carry-on-scrolling/
  [NestedScrollView2]: https://github.com/alexjlockwood/adp-nested-scrolling/blob/master/app/src/main/java/design/shapeshifter/nestedscrolling/NestedScrollView2.java
  [RecyclerView#startNestedScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L2158
  [RecyclerView#dispatchNestedPreScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4849
  [RecyclerView#dispatchNestedScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4893
  [RecyclerView#stopNestedScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4938
  [carry-on-scrolling-blog-post]: https://chris.banes.me/2017/06/09/carry-on-scrolling/
  [NestedScrollingChild]: https://developer.android.com/reference/android/support/v4/view/NestedScrollingChild.html
  [NestedScrollingParent]: https://developer.android.com/reference/android/support/v4/view/NestedScrollingParent.html
