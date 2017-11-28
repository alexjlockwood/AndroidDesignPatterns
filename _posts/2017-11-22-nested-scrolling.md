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

Introduction.

<!--more-->

## Introduction

Expeditions and sample app.

<!-- Figure 1 -->
<div class="figure-container">
    <video
        class="figure-video figure-element"
        poster="/assets/videos/posts/2017/11/22/poster-expeditions-sample.png"
        preload="auto"
        onclick="resumeVideo(this)" >
        <source src="/assets/videos/posts/2017/11/22/expeditions-sample-opt.mp4" type="video/mp4">
        <source src="/assets/videos/posts/2017/11/22/expeditions-sample-opt.webm" type="video/webm">
        <source src="/assets/videos/posts/2017/11/22/expeditions-sample-opt.ogv" type="video/ogg">
    </video>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 1</strong> - The video on the left is the Google Expeditions app. The video on the right is my sample app.
    </p>
</div>

The sample app's layout consists of a `NestedScrollView` and a `RecyclerView`.

<!-- Figure 2 -->
<img
    class="figure-image"
    src="/assets/images/posts/2017/11/22/sample-app-layouts.png"
    alt="Sample app layouts"
    title="Sample app layouts">
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 2</strong> - The sample app is made up of a <code>NestedScrollView</code> and a <code>RecyclerView</code>.
    </p>
</div>

<!-- Figure 3 -->
<div class="figure-container">
    <video
        class="figure-video figure-element"
        poster="/assets/videos/posts/2017/11/22/poster-cheesesquare.png"
        preload="auto"
        onclick="resumeVideo(this)" >
        <source src="/assets/videos/posts/2017/11/22/cheesesquare-opt.mp4" type="video/mp4">
        <source src="/assets/videos/posts/2017/11/22/cheesesquare-opt.webm" type="video/webm">
        <source src="/assets/videos/posts/2017/11/22/cheesesquare-opt.ogv" type="video/ogg">
    </video>
</div>
<div class="caption-container">
    <p class="caption-element">
        <strong>Figure 3</strong> - Cheesesquare.
    </p>
</div>

## Issues

<!-- Figure 4 -->
<div class="figure-container">
    <video
        class="figure-video figure-element"
        poster="/assets/videos/posts/2017/11/22/poster-nested-scrolling-bugs1.png"
        preload="auto"
        onclick="resumeVideo(this)" >
        <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs1-opt.mp4" type="video/mp4">
        <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs1-opt.webm" type="video/webm">
        <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs1-opt.ogv" type="video/ogg">
    </video>
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
    <video
        class="figure-video figure-element"
        poster="/assets/videos/posts/2017/11/22/poster-nested-scrolling-bugs2.png"
        preload="auto"
        onclick="resumeVideo(this)" >
        <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs2-opt.mp4" type="video/mp4">
        <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs2-opt.webm" type="video/webm">
        <source src="/assets/videos/posts/2017/11/22/nested-scrolling-bugs2-opt.ogv" type="video/ogg">
    </video>
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

  [carry-on-scrolling-blog-post]: https://chris.banes.me/2017/06/09/carry-on-scrolling/
  [adp-nested-scrolling]: https://github.com/alexjlockwood/adp-nested-scrolling
  [NestedScrollView2]: https://github.com/alexjlockwood/adp-nested-scrolling/blob/master/app/src/main/java/design/shapeshifter/nestedscrolling/NestedScrollView2.java
  [RecyclerView#startNestedScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L2158
  [RecyclerView#dispatchNestedPreScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4849
  [RecyclerView#dispatchNestedScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4893
  [RecyclerView#stopNestedScroll]: https://github.com/aosp-mirror/platform_frameworks_support/blob/034bc505154bbb42c588e2fc06f46596e3a44a1b/v7/recyclerview/src/main/java/android/support/v7/widget/RecyclerView.java#L4938

