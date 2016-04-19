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
class is used in a bit). The full source code is located [here][activity_main.xml]:

```xml
<CoordinatorLayout>

  <ImageView/>

  <FrameLayout android:id="@+id/toolbar_container">
    <Toolbar/>
  </FrameLayout>

  <NestedScrollView
    app:layout_behavior="com.alexjlockwood.example.CustomBehavior">

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

There were three things that needed to get done: (1) adjusting the initial
layout, (2) blocking touch events that don't originate on top of the card,
and (3) polishing the nested scrolling between the outer `NestedScrollView`
and its inner `RecyclerView`.

### Intercepting layout using a `CustomBehavior`

My first task was to dynamically setup the activity's layout so that it appeared
properly to the user. A few things would have to be adjusted after the activity's
initial layout:

1. Give the `CardView` a top margin so that the `FloatingActionButton` appears
   vertically centered with the card's top edge.

2. Give the card container `FrameLayout` top padding so that only the card's
   `FloatingActionButton` and two `TextView`s are initially visible at the
   bottom of the screen.

3. Give the inner `RecyclerView` a maximum height to ensure that the outer
   `NestedScrollView` will stop scrolling once the top edge of the card's 
   `FloatingActionButton` reaches the toolbar's bottom edge.

To achieve this, I decided to implement a custom `CoordinatorLayout.Behavior`.
In this case, my `CoordinatorLayout` has three direct children views but 
only the `NestedScrollView` will use my `CustomBehavior`.
`CoordinatorLayout` provides a powerful framework for intercepting events
and reacting to them before they are propogated to its children views.
For example, `Behavior`s get the first shot at layout via the `onLayoutChild()`
callback, which gives us an opportunity to adjust the layout if needed:

```java
class CustomBehavior extends CoordinatorLayout.Behavior<NestedScrollView> {

  public CustomBehavior(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  @Override
  public boolean onLayoutChild(
      CoordinatorLayout parent, NestedScrollView child, int layoutDirection) {
    // First layout the child as normal.
    parent.onLayoutChild(child, layoutDirection);

    // Center the FAB vertically along the top edge of the card.
    final int fabHalfHeight = child.findViewById(R.id.fab).getHeight() / 2;
    setMarginTop(child.findViewById(R.id.cardview), fabHalfHeight);

    // Give the RecyclerView a maximum height to ensure the card will never
    // overlap the toolbar as it scrolls.
    final int recyclerViewMaxHeight = child.getHeight() - fabHalfHeight
        - child.findViewById(R.id.card_title).getHeight()
        - child.findViewById(R.id.card_subtitle).getHeight();
    ((MaxHeightRecyclerView) child.findViewById(R.id.card_recyclerview))
        .setMaxHeight(recyclerViewMaxHeight);

    // Give the card container top padding so that only the top edge of the card
    // initially appears at the bottom of the screen. The total padding will
    // be the distance from the top of the screen to the FAB's top edge.
    final int toolbarContainerHeight = parent.getDependencies(child).get(0).getHeight();
    setPaddingTop(child.findViewById(R.id.card_container),
        recyclerViewMaxHeight - toolbarContainerHeight);

    // Offset the child's height so that its bounds don't overlap the toolbar container.
    ViewCompat.offsetTopAndBottom(child, toolbarContainerHeight);

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

  /* ... */
}
```

Note that in the above code, the `RecyclerView`'s maximum height is
calculated using the toolbar container's height. As a result, we must
list the toolbar container as a dependency to ensure that it is measured
and laid out before the `CustonBehavior`'s `onLayoutChild()` method is called:

```java
class CustomBehavior extends CoordinatorLayout.Behavior<NestedScrollView> {

  /* ... */

  @Override
  public boolean layoutDependsOn(
      CoordinatorLayout parent, NestedScrollView child, View dependency) {
    // List the toolbar container as a dependency to ensure that it will
    // always be laid out before the child (which depends on the toolbar
    // container's height in onLayoutChild() above).
    return dependency.getId() == R.id.toolbar_container;
  }

  /* ... */
}
```

### Intercepting touch events using a `CustomBehavior`

`CoordinatorLayout` also provides a framework for intercepting and reacting
to touch events before they are dispatched to children views. When
`CoordinatorLayout` receives a touch event, it goes through its list of
children views and passes the event to their `Behavior`s. If the `Behavior`
chooses to intercept the touch event, all future touch events will be sent
directly to that `Behavior`'s `onTouchEvent()` method. Otherwise,
`CoordinatorLayout` will process the touch events as normal via the
traditional dispatch method.

In my case, I want `CoordinatorLayout` to simply ignore any touch events
that originate on top of the `NestedScrollView` bounds but do _not_ originate
within the bounds of its inner `CardView` and `FloatingActionButton`:

```java
class CustomBehavior extends CoordinatorLayout.Behavior<NestedScrollView> {

  /* ... */

  @Override
  public boolean onInterceptTouchEvent(
      CoordinatorLayout parent, NestedScrollView child, MotionEvent ev) {
    // Block all touch events that originate within the bounds of our
    // NestedScrollView but do *not* originate within the bounds of its
    // inner CardView and FloatingActionButton.
    return ev.getActionMasked() == MotionEvent.ACTION_DOWN
        && isTouchInChildBounds(parent, child, ev)
        && !isTouchInChildBounds(parent, child.findViewById(R.id.cardview), ev)
        && !isTouchInChildBounds(parent, child.findViewById(R.id.fab), ev);
  }

  private static boolean isTouchInChildBounds(
      ViewGroup parent, View child, MotionEvent ev) {
    return ViewGroupUtils.isPointInChildBounds(
        parent, child, (int) ev.getX(), (int) ev.getY());
  }
}
```

Note that the [ViewGroupUtils][ViewGroupUtils] class contains code that I copied
from the design support library [source code][ViewGroupUtilsSource] itself.

### Polishing up nested scrolling using an `ExtendedNestedScrollView`

The last bit of polish has nothing to do with `CoordinatorLayout`s 
or `Behavior`s but has to do with the nested scrolling APIs that were
introduced in API 21 (with backwards compatibile APIs provided in the
v4 support library).

Nested scrolling takes place between a [`NestedScrollingParent`][NestedScrollingParent]
and a [`NestedScrollingChild`][NestedScrollingChild]. In this case, the outer
`NestedScrollView` is the parent and the inner `RecyclerView` is the child.

* `NestedScrollingChild#dispatchNestedPre{Scroll,Fling}()` - Child 
  dispatches one step of a nested scroll/fling
  to the parent (before the child consumes any portion of it).

* `NestedScrollingParent#onNestedPre{Scroll,Fling}()` - Parent 
  is given opportunity to react to a nested
  scroll/fling before the child consumes it.

* `NestedScrollingChild#dispatchNested{Scroll,Fling}()` - Child 
  dispatches one step of a nested scroll/fling
  to the parent (after the child has consumed it).

* `NestedScrollingParent#onNested{Scroll,Fling}()` - Parent 
  is given opportunity to consume the remainder
  of a nested scroll/fling that has not been consumed.

When the user scrolls the `RecyclerView`, the following sequence of events
takes place:

1. The `RecyclerView` receives an `ACTION_MOVE` touch event.

2. `RecyclerView#dispatchNestedPreScroll()` is called.

3. `NestedScrollView#onNestedPreScroll()` is called. 

4. `RecyclerView#dispatchNestedScroll()` is called.

5. `NestedScrollView#onNestedScroll()` is called.

Similarly, when the user flings the `RecyclerView`, the following sequence
of events takes place:

1. The `RecyclerView` receives an `ACTION_UP` touch event and
   a fling is detected.

2. `RecyclerView#dispatchNestedPreFling()` is called.

3. `NestedScrollView#onNestedPreFling()` is called. 

4. `RecyclerView#dispatchNestedFling()` is called.

5. `NestedScrollView#onNestedFling()` is called.

The two methods we care about here are the `NestedScrollingParent`'s
`onNestedPreScroll()` and `onNestedPreFling()` methods, which give
the parent the opportunity to react to a nested scroll and/or fling
before the child. As a result, we override these two methods as follows: 

```java
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

### Closing remarks

For more information on 
`CoordinatorLayout` behaviors, check out Ian Lake's 
[great blog post][IanLakeBlogPost] on the topic.

  [IanLakeBlogPost]: https://medium.com/google-developers/intercepting-everything-with-coordinatorlayout-behaviors-8c6adc140c26#.qcr10khph
  [SampleAppSourceCode]: https://github.com/alexjlockwood/sample-design-lib-app
  [MaxHeightRecyclerView]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/java/com/alexjlockwood/example/designlib/MaxHeightRecyclerView.java
  [CustomBehavior]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/java/com/alexjlockwood/example/designlib/CustomBehavior.java
  [ExtendedNestedScrollView]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/java/com/alexjlockwood/example/designlib/ExtendedNestedScrollView.java
  [ViewGroupUtils]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/java/com/alexjlockwood/example/designlib/ViewGroupUtils.java
  [ViewGroupUtilsSource]: https://android.googlesource.com/platform/frameworks/support/+/marshmallow-mr2-release/design/honeycomb/android/support/design/widget/ViewGroupUtilsHoneycomb.java
  [activity_main.xml]: https://github.com/alexjlockwood/sample-design-lib-app/blob/master/app/src/main/res/layout/activity_main.xml
  [NestedScrollingParent]: https://developer.android.com/reference/android/support/v4/view/NestedScrollingParent.html
  [NestedScrollingChild]: https://developer.android.com/reference/android/support/v4/view/NestedScrollingChild.html


