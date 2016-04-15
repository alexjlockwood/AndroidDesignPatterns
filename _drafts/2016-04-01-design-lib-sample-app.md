---
layout: post
title: 'Design lib sample app'
date: 2016-04-01
permalink: /2016/04/design-lib-sample-app.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

<!--morestart-->

Introduction to the blog post and stuff, explain the goal of the sample app, blah blah blah.

<!--more-->

A brief summary of my initial layout is given below:

```xml
<CoordinatorLayout>

  <ImageView/>

  <FrameLayout>
    <Toolbar/>
  </FrameLayout>

  <NestedScrollView>
    <FrameLayout>
      
      <CardView>
        <LinearLayout>
          <TextView android:text="Title"/>
          <TextView android:text="Subtitle"/>
          <RecyclerView/>
        </LinearLayout>
      </CardView>
      
      <FloatingActionButton/>

    </FrameLayout>
  </NestedScrollView>

</CoordinatorLayout>
```

### Max height recycler view

The first issue I encountered was an edge case that occurred when the RecyclerView
had a small number of items. **TODO: show an example video/illustration.**

Version 23.2 of the support library release brought an exciting new feature to the 
LayoutManager API: auto-measurement! This allows a RecyclerView to size itself
based on the size of its contents. This means that previously unavailable scenarios, 
such as using `WRAP_CONTENT` for a dimension of the RecyclerView, are now possible. 
You’ll find all built in LayoutManagers now support auto-measurement.

The new built-in auto-measurement API allowed me to replace my inner `RecyclerView`
with a custom, subclassed `MaxHeightRecyclerView` that supports the ability to 
specify a maximum height:

```java
/**
 * A {@link RecyclerView} with an optional maximum height.
 */
class MaxHeightRecyclerView extends RecyclerView {
  private int mMaxHeight = -1;

  public MaxHeightRecyclerView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    if (mMaxHeight >= 0) {
      switch (MeasureSpec.getMode(heightMeasureSpec)) {
        case MeasureSpec.AT_MOST:
          heightMeasureSpec = MeasureSpec.makeMeasureSpec(
              Math.min(MeasureSpec.getSize(heightMeasureSpec), mMaxHeight),
              MeasureSpec.AT_MOST);
          break;
        case MeasureSpec.EXACTLY:
          heightMeasureSpec = MeasureSpec.makeMeasureSpec(
              Math.min(MeasureSpec.getSize(heightMeasureSpec), mMaxHeight),
              MeasureSpec.EXACTLY);
          break;
        case MeasureSpec.UNSPECIFIED:
          heightMeasureSpec = MeasureSpec.makeMeasureSpec(mMaxHeight,
              MeasureSpec.AT_MOST);
          break;
      }
    }
    super.onMeasure(widthMeasureSpec, heightMeasureSpec);
  }

  public void setMaxHeight(int minHeight) {
    if (mMaxHeight != minHeight) {
      mMaxHeight = minHeight;
      requestLayout();
    }
  }
}
```

### Touch blocking behavior

The second issue I encountered was that I only wanted the user to be able to scroll
the visible part of the card. To do this I created a custom `CoordinatorLayout.Behavior`,
which allowed me to intercept and ignore all touch events that originated on top of the
undesired areas:

```java
/**
 * A custom {@link Behavior} used to block touch events that do not originate on
 * top of the {@link MainActivity}'s card view or FAB.
 */
class TouchBlockingBehavior extends CoordinatorLayout.Behavior<NestedScrollView> {

  public TouchBlockingBehavior(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public boolean onInterceptTouchEvent(
      CoordinatorLayout parent, NestedScrollView child, MotionEvent ev) {
    if (ev.getActionMasked() == MotionEvent.ACTION_DOWN) {
      // Block all touch events that originate within the bounds of our
      // NestedScrollView but are *not* within the bounds of its inner
      // CardView and FloatingActionButton views.
      final boolean shouldBlockTouch = isTouchInChildBounds(parent, child, ev)
          && !isTouchInChildBounds(parent, child.findViewById(R.id.cardview), ev)
          && !isTouchInChildBounds(parent, child.findViewById(R.id.fab), ev);
      if (shouldBlockTouch) {
        // Intercept the touch event. All future events associated with the
        // current gesture will be sent to this behavior's onTouchEvent() method
        // and will be immediately ignored.
        return true;
      }
    }
    return super.onInterceptTouchEvent(parent, child, ev);
  }

  private static boolean isTouchInChildBounds(
      ViewGroup parent, View child, MotionEvent ev) {
    return ViewGroupUtils.isPointInChildBounds(
        parent, child, (int) ev.getX(), (int) ev.getY());
  }
}
```

For more information on `CoordinatorLayout` behaviors, check out Ian Lake's 
[great blog post][IanLakeCoordinatorLayoutBlogPost] on the topic.

### Nested scrolling

Blah blah blah.

```java
/**
 * An extended {@link NestedScrollView} that customizes our sample app's
 * nested scrolling behavior.
 */
class ExtendedNestedScrollView extends NestedScrollView {

  public ExtendedNestedScrollView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public void onNestedPreScroll(View target, int dx, int dy, int[] consumed) {
    final RecyclerView recyclerView = (RecyclerView) target;
    if ((dy < 0 && isScrolledToTop(recyclerView))
        || (dy > 0 && !isScrolledToBottom(this))) {
      // The NestedScrollView should steal the scroll event away from the
      // RecyclerView in one of two cases: (1) if the user is scrolling down
      // and the RecyclerView is scrolled to the top, or (2) if the user is
      // scrolling up and the NestedScrollView is not scrolled to the bottom.
      scrollBy(0, dy);
      consumed[1] = dy;
      return;
    }
    super.onNestedPreScroll(target, dx, dy, consumed);
  }

  @Override
  public boolean onNestedPreFling(View target, float velX, float velY) {
    final RecyclerView recyclerView = (RecyclerView) target;
    if ((velY < 0 && isScrolledToTop(recyclerView))
        || (velY > 0 && !isScrolledToBottom(this))) {
      // The NestedScrollView should steal the fling event away from the
      // RecyclerView in one of two cases: (1) if the user is flinging down
      // and the RecyclerView is scrolled to the top, or (2) if the user is
      // flinging up and the NestedScrollView is not scrolled to the bottom.
      fling((int) velY);
      return true;
    }
    return super.onNestedPreFling(target, velX, velY);
  }

  /**
   * Returns true iff the {@link NestedScrollView} is scrolled to the bottom
   * of its viewport.
   */
  private static boolean isScrolledToBottom(NestedScrollView nsv) {
    return !nsv.canScrollVertically(1);
  }

  /**
   * Returns true iff the vertical {@link RecyclerView} is scrolled to the
   * top (i.e. its first item is completely visible).
   */
  private static boolean isScrolledToTop(RecyclerView rv) {
    final LinearLayoutManager lm = (LinearLayoutManager) rv.getLayoutManager();
    return lm.findFirstVisibleItemPosition() == 0
        && lm.findViewByPosition(0).getTop() == 0;
  }
}
```

  [IanLakeCoordinatorLayoutBlogPost]: https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26#.qcr10khph
