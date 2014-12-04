---
published: false
---

This post focuses on window content transitions. This is the second of a series of posts I will be writing about Activity Transitions:

* **Part 1:** <a href="/2014/11/activity-transitions-getting-started-part1.html">Getting Started with Activity Transitions</a>
* **Part 2:** Window Content Transitions In-Depth (_coming soon!_)
* **Part 3:** Shared Element Transitions In-Depth (_coming soon!_)

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't fret: I'll point out the significant differences between the two as they are encountered in the post!

In part 1 we briefly mentioned two types of transitions: window content transitions and shared element transitions. In this post we will focus on the former.

### Window Content Transitions

<!--morestart-->

Window content transitions determine how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the Activity scene. (**TODO: for example...**)

Window content transitions are initiated by altering each view's visibility. To understand what this means, let's see what happens under-the-hood when activity `A` starts activity `B`:

<!--more-->

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

Since entering and exiting is governed by toggling the views' visibility between `INVISIBLE` and `VISIBLE`, most window content transitions will extend the abstract `Visibility` class, which captures the relevant view visibility properties for you and provides a convenient API for reacting to the changes.

Material-themed applications have their window content exit and enter transitions set to `null` and `Fade` respectively by default. If necessary, you can specify our own [exit][setExitTransition], [enter][setEnterTransition], [return][setReturnTransition], and [reenter][setReenterTransition] window content transitions as well, either programatically or in XML as part of the activity's theme.

* <b>By default, the exit and enter transitions overlap.</b> **TODO: keep this part?**

* <b>Need to request window activity transition feature if not using material theme.</b> **TODO: keep this part?**

In the next few blog posts, I will give detailed examples of how transitions should and can be used to achieve some cool effects in your applications.

* **TODO: write footnote saying a similar under-the-hood process occurs in the opposite direction when `B` returns to `A`**
* **TODO: explain why exit/reenter transitions are usually not necessary when animating shared elements.**







As defined above, window content transitions operate on a set of views called _transitioning views_. Up until now we have stated that the transitioning views are the set of _non-shared_ views that enter or exit the activity scene. How though does the framework determine this set of views that should be transitioned? For example, what if you only wanted to transition a fraction of the views on screen? Or what if you wanted to animate an entire `ViewGroup` as a group instead of animating each individual child view?

In order to determine the set of views that will be transitioned during an Activity Transition, the framework performs a recursive search on the entire activity's view hierarchy, beginning with the window's root decor view.

The recursive case of the search is defined in the [`ViewGroup#captureTransitioningViews()`][ViewGroup#captureTransitioningViews] method:

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








  [setSharedElementsUseOverlay]: https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)
  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html

  [setExitTransition]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [setEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [setReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [setReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)

  [setSharedElementExitTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [setSharedElementEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [setSharedElementReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [setSharedElementReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)

