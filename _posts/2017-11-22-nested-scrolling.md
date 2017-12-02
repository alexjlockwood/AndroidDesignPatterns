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

As I reflect on my 3 years at Google, my favorite memories were probably from the time I spent working on Google Expeditions, a virtual reality app that allows teachers to lead their students on immersive virtual field trips all over the world. The team was small and our UX team was ambitious, so for a little over half a year I helped rewrite and polish the app’s UI in time for its first public release. I especially enjoyed writing the app’s field trip selector screen, which rendered a SurfaceView behind a beautifully designed card-based layout that allowed the user to quickly switch between different VR experiences.

<!--more-->

It’s been awhile since I’ve written hardcore Android code (I've spent a majority of the past year building Android developer tools like [Shape Shifter][shapeshifter-github] and [avdo][avdo-github]), so the other day I attempted to rewrite parts of the screen, mostly as a technical exercise. **Figure 1** shows a side-by-side comparison of Google Expeditions' field trip selector screen and the resulting sample app I wrote (available on [GitHub][adp-nested-scrolling-github] and [Google Play][adp-nested-scrolling-play-store]).

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

As I was working through the code, I was reminded me of the initial confusion I had with Android’s nested scrolling APIs when I first wrote the screen a couple of years ago. Android’s nested scrolling APIs make it possible for scrollable views to exist as children inside of other scrollable views, and enable us to create the fancy scrolling gestures that Material Design formalizes on its [scrolling techniques][material-spec-scrolling-techniques] patterns page. **Figure 2** shows a common use case involving a parent `CoordinatorLayout` and a child `NestedScrollView` from Chris Banes' [Cheese Square][cheesesquare-github] app. Without nested scrolling, the `NestedScrollView` scrolls independently of its surroundings. Once enable, however, the nested scrolling APIs allow the parent `CoordinatorLayout` to intercept these same scroll events before they `NestedScrollView` consumes them, making it possible to create a cool "collapsing toolbar" effect that feels more fluid and natural.

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

So how exactly do the nested scrolling APIs work anyway? Well, let's consider my sample app as an example. The layout consists of a parent `NestedScrollView` and a child `RecyclerView`, as shown in **Figure 3** below. The obvious question is what happens if the user begins a scroll gesture on top of the red area below? Should it cause the `NestedScrollView` or `RecyclerView` to be scrolled? How does the app make this decision?

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
2. The framework calls the `RecyclerView`'s `onTouchEvent(ACTION_MOVE)` method.
3. The `RecyclerView` notifies the `NestedScrollView` that a scroll event is in progress by calling its own `dispatchNestedPreScroll()` method.
4. This results in an immediate call to the `NestedScrollView`'s `onNestedPreScroll()` method. This callback method is important because it gives the `NestedScrollView` an opportunity to react to the scroll event before the `RecyclerView` consumes it.
5. The `RecyclerView` consumes the remainder of the scroll event (or does nothing if the `NestedScrollView` already consumed the entire scroll event).
6. The `RecyclerView` notifies the `NestedScrollView` that it has consumed a portion of the scroll event by calling its own `dispatchNestedScroll()` method.
7. This results in an immediate call to the `NestedScrollView`'s `onNestedScroll()` method. This callback method is important because it gives the `NestedScrollView` an opportunity to consume any remaining scroll pixels that have still not been consumed.
8. The `RecyclerView` returns `true` from the current call to `onTouchEvent(ACTION_MOVE)`, consuming the touch event.

## Issues

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
        <strong>Figure 4</strong> - Both videos are buggy.
    </p>
</div>

### Scrolling bug

The solution is a custom nested scroll view.

```java
class CustomNestedScrollView extends NestedScrollView {

  /* ... */

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) {
    final RecyclerView rv = (RecyclerView) target;
    final LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
    final boolean isRvScrolledToTop =
        lm.findFirstVisibleItemPosition() == 0 && lm.findViewByPosition(0).getTop() == 0;
    final boolean isNsvScrolledToBottom = !canScrollVertically(1);
    if ((dy < 0 && isRvScrolledToTop) || (dy > 0 && !isNsvScrolledToBottom)) {
      // The NestedScrollView should steal the scroll event away from the
      // RecyclerView in one of two cases: (1) if the user is scrolling their
      // finger down and the RecyclerView is scrolled to the top, or (2) if
      // the user is scrolling their finger up and the NestedScrollView is
      // not scrolled to the bottom.
      scrollBy(0, dy);
      consumed[1] = dy;
      return;
    }
    super.onNestedPreScroll(target, dx, dy, consumed);
  }

  /* ... */
}
```

### Flinging bug

```java
class CustomNestedScrollView extends NestedScrollView {

  /* ... */

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) { /* ... */ }

  @Override
  public boolean onNestedPreFling(View target, float velX, float velY) {
    final RecyclerView rv = (RecyclerView) target;
    final LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
    final boolean isRvScrolledToTop =
        lm.findFirstVisibleItemPosition() == 0 && lm.findViewByPosition(0).getTop() == 0;
    final boolean isNsvScrolledToBottom = !canScrollVertically(1);
    if ((velY < 0 && isRvScrolledToTop) || (velY > 0 && !isNsvScrolledToBottom)) {
      // The NestedScrollView should steal the fling event away from the
      // RecyclerView in one of two cases: (1) if the user is flinging their
      // finger down and the RecyclerView is scrolled to the top, or (2) if
      // the user is flinging their finger up and the NestedScrollView is
      // not scrolled to the bottom.
      fling((int) velY);
      return true;
    }
    return super.onNestedPreFling(target, velX, velY);
  }
}
```

### Issue 3: another flinging bug

Flings still don't work properly.

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

Chris Banes wrote a [blog post][carry-on-scrolling-blog-post] last June
explaining the issue.

For some reason `NestedScrollView` was updated to implement the
`NestedScrollingChild2` interface, but not the `NestedScrollingParent2`
interface. So I had to create another custom class ([source code][NestedScrollView2]):

```java
/**
 * A {@link NestedScrollView} that implements the {@link NestedScrollingParent2} interface.
 */
class NestedScrollView2 extends NestedScrollView implements NestedScrollingParent2 {
  private final NestedScrollingParentHelper parentHelper;

  public NestedScrollView2(Context context, AttributeSet attrs) {
    super(context, attrs);
    parentHelper = new NestedScrollingParentHelper(this);
  }

  // NestedScrollingParent2 methods.

  @Override
  public boolean onStartNestedScroll(View child, View target, int axes, int type) {
    return (axes & ViewCompat.SCROLL_AXIS_VERTICAL) != 0;
  }

  @Override
  public void onNestedScrollAccepted(View child, View target, int axes, int type) {
    parentHelper.onNestedScrollAccepted(child, target, axes);
    startNestedScroll(ViewCompat.SCROLL_AXIS_VERTICAL, type);
  }

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed, int type) {
    dispatchNestedPreScroll(dx, dy, consumed, null, type);
  }

  @Override
  public void onNestedScroll(
      View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed, int type) {
    final int oldScrollY = getScrollY();
    scrollBy(0, dyUnconsumed);
    final int myConsumed = getScrollY() - oldScrollY;
    final int myUnconsumed = dyUnconsumed - myConsumed;
    dispatchNestedScroll(0, myConsumed, 0, myUnconsumed, null, type);
  }

  @Override
  public void onStopNestedScroll(View target, int type) {
    parentHelper.onStopNestedScroll(target, type);
    stopNestedScroll(type);
  }

  // NestedScrollingParent methods. For the most part these methods delegate
  // to the NestedScrollingParent2 methods above, passing TYPE_TOUCH as the
  // type to maintain API compatibility.

  @Override
  public boolean onStartNestedScroll(View child, View target, int axes) {
    return onStartNestedScroll(child, target, axes, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public void onNestedScrollAccepted(View child, View target, int axes) {
    onNestedScrollAccepted(child, target, axes, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) {
    onNestedPreScroll(target, dx, dy, consumed, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public void onNestedScroll(
      View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
    onNestedScroll(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public void onStopNestedScroll(View target) {
    onStopNestedScroll(target, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public int getNestedScrollAxes() {
    return parentHelper.getNestedScrollAxes();
  }
}
```

Then I could update my custom nested scroll view as follows.

Note that I no longer need to override `onNestedPreFling()`. When the user lifts their
finger and a fling begins, the `RecyclerView` calls `fling()` on itself, which begins
a new round of nested scrolling beginning with a call to
[`startNestedScroll(TYPE_NON_TOUCH)`][RecyclerView#startNestedScroll], then
[`dispatchNestedPreScroll(TYPE_NON_TOUCH)`][RecyclerView#dispatchNestedPreScroll], then
[`dispatchNestedScroll(TYPE_NON_TOUCH)`][RecyclerView#dispatchNestedScroll], and finally
[`stopNestedScroll(TYPE_NON_TOUCH)`][RecyclerView#stopNestedScroll].

```java
class CustomNestedScrollView2 extends NestedScrollView2 {

  /* ... */

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed, int type) {
    final RecyclerView rv = (RecyclerView) target;
    final LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
    final boolean isRvScrolledToTop =
        lm.findFirstVisibleItemPosition() == 0 && lm.findViewByPosition(0).getTop() == 0;
    final boolean isNsvScrolledToBottom = !canScrollVertically(1);
    if ((dy < 0 && isRvScrolledToTop) || (dy > 0 && !isNsvScrolledToBottom)) {
      // The NestedScrollView should steal the scroll event away from the
      // RecyclerView in one of two cases: (1) if the user is scrolling their
      // finger down and the RecyclerView is scrolled to the top, or (2) if
      // the user is scrolling their finger up and the NestedScrollView is
      // not scrolled to the bottom.
      scrollBy(0, dy);
      consumed[1] = dy;
      return;
    }
    super.onNestedPreScroll(target, dx, dy, consumed, type);
  }
}
```

And we're done!

  [shapeshifter-github]: https://github.com/alexjlockwood/ShapeShifter
  [avdo-github]: https://github.com/alexjlockwood/avdo
  [adp-nested-scrolling-github]: https://github.com/alexjlockwood/adp-nested-scrolling
  [adp-nested-scrolling-play-store]: https://play.google.com/store/apps/details?id=alexjlockwood.nestedscrolling
  [material-spec-scrolling-techniques]: https://material.io/guidelines/patterns/scrolling-techniques.html#scrolling-techniques-app-bar-scrollable-regions
  [cheesesquare-github]: https://github.com/chrisbanes/cheesesquare
