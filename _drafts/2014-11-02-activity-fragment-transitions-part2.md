---
layout: post
title: 'Window Content Transitions In-Depth (part 2)'
date: 2014-11-02
permalink: /2014/11/window-content-transitions-in-depth-part2.html
---

This post will give an in-depth analysis of _window content transitions_ and their role in the Activity Transitions API. This is the second of a series of posts I will be writing on the topic:

* **Part 1:** <a href="/2014/11/activity-transitions-getting-started-part1.html">Getting Started with Activity Transitions</a>
* **Part 2:** Window Content Transitions In-Depth (_coming soon!_)
* **Part 3:** Shared Element Transitions In-Depth (_coming soon!_)

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't fret: I'll point out the significant differences between the two as they are encountered in the post!

<!--morestart-->

In the previous post, window content transitions were briefly summarized as follows:

> A _window content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.

However, a few questions still remain. When does the transition start? How does the framework decide which views should be transitioned? And most importantly, which `Transition` types can and cannot be used? We'll begin tackling these questions by taking a deeper look at how the framework initiates and executes window content transitions under-the-hood.

<!--more-->

### Which `Transition` types can be used?

The most important thing to understand when it comes to choosing (or even implementing) a window content transition to use is that their behavior is dependent on view visibility changes made by the framework. To understand what this means, let's see what happens under-the-hood when activity `A` starts activity `B`:

1. `A` calls `startActivity()`.
2. `A`'s exit transition captures start values for the transitioning views in `A`.
3. The framework sets all transitioning views in `A` to `INVISIBLE`.
4. On the next animation frame, `A`'s exit transition captures end values for the transitioning views in `A`.
5. `A`'s exit transition compares the start and end values of its transitioning views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views exit the scene.
6. Activity `B` is initialized with all of its transitioning views initially set as `INVISIBLE`.
7. `B`'s enter transition captures start values for the transitioning views in `B`.
8. The framework sets all transitioning views in `B` to `VISIBLE`.
9. On the next animation frame, `B`'s enter transition captures end values for the transitioning views in `B`.
10. `B`'s enter transition compares the start and end values of its target views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views enter the scene.

In other words, a window content transition will have two main responsibilities: (1) capturing the visibility of each transitioning view in both its start and end state and (2) creating an `Animator` based on the visibility differences that will cause the views to either exit or enter the activity scene.

Fortunately, the framework provides an abstract [`Visibility`][Visibility] class that already does the first half of this work for you. Subclasses of `Visibility` must only react to each view's visibility change by implementing the abstract `Visibility#onAppear()` and `Visibility#onDisappear()` template methods. As of API 21, three concrete `Visibility` implementations exist that can be used as window content transitions: `Fade`, `Slide`, and `Explode`.

### Which views will be transitioned?

As defined above, window content transitions operate on a set of views called _transitioning views_. Up until now we have stated that the transitioning views are the set of _non-shared_ views that enter or exit the activity scene. How though does the framework determine this set of views that should be transitioned? For example, what if you only wanted to transition a fraction of the views on screen? Or what if you wanted to animate an entire `ViewGroup` as a group instead of animating each individual child view?

In order to determine the set of views that will be transitioned during an Activity Transition, the framework performs a recursive search on the entire activity's view hierarchy, beginning with the window's root decor view.

The recursive case of the search is defined in the [`ViewGroup#captureTransitioningViews()`][ViewGroup#captureTransitioningViews] method:

```java
/** @hide */
@Override
public void captureTransitioningViews(List<View> transitioningViews) {
    if (getVisibility() != View.VISIBLE) {
        return;
    }
    if (isTransitionGroup()) {
        transitioningViews.add(this);
    } else {
        int count = getChildCount();
        for (int i = 0; i < count; i++) {
            View child = getChildAt(i);
            child.captureTransitioningViews(transitioningViews);
        }
    }
}
```

The base cases are are defined in the [`View#isTransitionGroup()`][View#isTransitionGroup] and [`View#captureTransitioningViews`][View#captureTransitioningViews]

```java
/**
 * Returns true if this ViewGroup should be considered as a single entity for removal
 * when executing an Activity transition. If this is false, child elements will move
 * individually during the transition.
 * @return True if the ViewGroup should be acted on together during an Activity transition.
 * The default value is false when the background is null and true when the background
 * is not null or if {@link #getTransitionName()} is not null.
 */
public boolean isTransitionGroup() {
    if ((mGroupFlags & FLAG_IS_TRANSITION_GROUP_SET) != 0) {
        return ((mGroupFlags & FLAG_IS_TRANSITION_GROUP) != 0);
    } else {
        return getBackground() != null || getTransitionName() != null;
    }
}

/**
 * Gets the Views in the hierarchy affected by entering and exiting Activity Scene transitions.
 * @param transitioningViews This View will be added to transitioningViews if it is VISIBLE and
 *                           a normal View or a ViewGroup with ViewGroup#isTransitionGroup() true.
 * @hide
 */
public void captureTransitioningViews(List<View> transitioningViews) {
    if (getVisibility() == View.VISIBLE) {
        transitioningViews.add(this);
    }
}
```

In other words, we must remember to call `setTransitionGroup(true)` on any view groups we want to animate as a whole during a transition (unless they have non-null transition names or background drawables).

### How do window content transitions overlap?

By default window content enter and exit transitions overlap. We can disable this if we want though using the API.

You can also set the amount of time it takes for the window's background to fade in/out.

  [Visibility]: https://developer.android.com/reference/android/transition/Visibility.html
  [View#captureTransitioningViews]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/View.java#L19351-L19362
  [ViewGroup#captureTransitioningViews]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L6243-L6258
  [View#isTransitionGroup]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L2494-L2508


