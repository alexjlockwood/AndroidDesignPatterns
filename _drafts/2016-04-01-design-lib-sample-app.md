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

I began with an XML layout for my activity roughly as follows 
(we will see how the custom [`MaxHeightRecyclerView`][MaxHeightRecyclerView]
class is used in a bit):

```xml
<CoordinatorLayout>

  <ImageView/>

  <FrameLayout android:id="@+id/toolbar_container">
    <Toolbar/>
  </FrameLayout>

  <NestedScrollView>
    <FrameLayout android:id="@+id/card_container">
      
      <CardView>
        <LinearLayout>
          <TextView android:id="@+id/card_title"/>
          <TextView android:id="@+id/card_subtitle"/>
          <MaxHeightRecyclerView android:id="@+id/card_recyclerview"/>
        </LinearLayout>
      </CardView>
      
      <FloatingActionButton android:id="@+id/card_fab"/>

    </FrameLayout>
  </NestedScrollView>

</CoordinatorLayout>
```

### Custom behavior

The second issue I encountered was that I only wanted the user to be able to scroll
the visible part of the card. To do this I created a custom `CoordinatorLayout.Behavior`,
which allowed me to intercept and ignore all touch events that originated on top of the
undesired areas:

```java
/**
 * A custom {@link Behavior} used to block touch events that do not originate on
 * top of the {@link MainActivity}'s card view or FAB. It also is used to
 * adjust the layout so that the UI is displayed properly.
 */
class CustomBehavior extends CoordinatorLayout.Behavior<View> {

  public CustomBehavior(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public boolean layoutDependsOn(
      CoordinatorLayout parent, View child, View dependency) {
    // List the toolbar container as a dependency to ensure that it will
    // always be laid out before the child (which depends on the toolbar
    // container's height in onLayoutChild() below).
    return dependency.getId() == R.id.toolbar_container;
  }

  @Override
  public boolean onLayoutChild(
      CoordinatorLayout parent, View child, int layoutDirection) {
    // First layout the child as normal.
    parent.onLayoutChild(child, layoutDirection);

    // Center the FAB vertically along the top edge of the card.
    final int cardViewTopMargin =
        child.findViewById(R.id.card_fab).getHeight() / 2;
    setMarginTop(child.findViewById(R.id.cardview), cardViewTopMargin);

    // Give the card container top padding so that the tip of the card
    // initially appears at the bottom of the screen. The total padding will
    // be the distance from the top of the screen to the FAB's top edge.
    final int cardContainerTopPadding = child.getHeight() - cardViewTopMargin
        - child.findViewById(R.id.card_title).getHeight()
        - child.findViewById(R.id.card_subtitle).getHeight();
    setPaddingTop(child.findViewById(R.id.card_container), cardContainerTopPadding);

    // Give the RecyclerView a maximum height to ensure the card will never
    // overlap the toolbar as it scrolls.
    final View toolbarContainer = parent.getDependencies(child).get(0);
    ((MaxHeightRecyclerView) child.findViewById(R.id.card_recyclerview))
        .setMaxHeight(cardContainerTopPadding - toolbarContainer.getHeight());

    // Return true so that the parent doesn't waste time laying out the
    // child again (any modifications made above will have triggered a second
    // layout pass anyway).
    return true;
  }

  private static void setMarginTop(View view, int topMargin) {
    final MarginLayoutParams lp = (MarginLayoutParams) view.getLayoutParams();
    if (lp.topMargin != topMargin) {
      lp.topMargin = topMargin;
      view.setLayoutParams(lp);
    }
  }

  private static void setPaddingTop(View view, int paddingTop) {
    if (view.getPaddingTop() != paddingTop) {
      view.setPadding(0, paddingTop, 0, 0);
    }
  }

  @Override
  public boolean onInterceptTouchEvent(
      CoordinatorLayout parent, View child, MotionEvent ev) {
    // Block all touch events that originate within the bounds of our
    // NestedScrollView but do *not* originate within the bounds of its
    // inner CardView and FloatingActionButton views.
    return ev.getActionMasked() == MotionEvent.ACTION_DOWN
        && isTouchInChildBounds(parent, child, ev)
        && !isTouchInChildBounds(parent, child.findViewById(R.id.cardview), ev)
        && !isTouchInChildBounds(parent, child.findViewById(R.id.card_fab), ev);
  }

  private static boolean isTouchInChildBounds(
      ViewGroup parent, View child, MotionEvent ev) {
    return ViewGroupUtils.isPointInChildBounds(
        parent, child, (int) ev.getX(), (int) ev.getY());
  }
}
```

For more information on `CoordinatorLayout` behaviors, check out Ian Lake's 
[great blog post][IanLakeBlogPost] on the topic.

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

  @Override
  public boolean onNestedPreFling(View target, float velX, float velY) {
    final RecyclerView recyclerView = (RecyclerView) target;
    if ((velY < 0 && isScrolledToTop(recyclerView))
        || (velY > 0 && !isScrolledToBottom(this))) {
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

  [IanLakeBlogPost]: https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26#.qcr10khph
  [SampleAppSourceCode]: https://github.com/alexjlockwood/sample-design-lib-app
  [MaxHeightRecyclerView]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/java/com/alexjlockwood/example/designlib/MaxHeightRecyclerView.java
  [CustomBehavior]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/java/com/alexjlockwood/example/designlib/CustomBehavior.java
