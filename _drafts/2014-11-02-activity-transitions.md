---
layout: post
title: Custom Activity Transitions in Android Lollipop
---

### Terminology

Let `A` and `B` be Activities.

* An **exit transition** is performed on the target views in `A` when the user starts Activity `B` from `A`.

* An **enter transition** is performed on the target views in `B` after Activity `A`'s exit transition has finished.

* A **return transition** is performed on the target views in `B` when the user navigates back to `A` from `B`.

* A **reenter transition** is performed on the target views in `A` after Activity `B`'s return transition has finished.

* A **window transition** is a transition that is performed on an `Activity`'s non-shared views during an `Activity` transition. Views that are animated by an `Activity`'s window transition are called _transitioning views_.

* A **shared element transition** is a transition that animates views across `Activity`s. Views that are animated by an `Activity`'s shared element transition are called _shared elements_ or _hero elements_.

### Window Transitions

Window transitions can be explicitly set in your theme's XML or by calling the `Window`'s [`setExitTransition()`][0],
[`setEnterTransition()`][1], [setReturnTransition()][2], and [`setReenterTransition()`][3] methods. By default the window's
exit and enter transitions are `null` and `Fade` respectively. If the window's return and reenter transitions are not set, they will take the same value as the window's enter and exit transitions respectively.

Typical Transitions will extend `Visibility`, as entering/exiting is governed by toggling the window's views visibility (from INVISIBLE to VISIBLE for entering, and vice versa for exiting).

Note that if you don't want to share any elements but still want the window exit/enter transitions, then you can call
`ActivityOptions#makeSceneTransitionAnimation(Activity)` with only an `Activity` argument.

### Shared Element Transitions

Shared element transitions can be explicitly set in your theme's XML or by calling the `Window`'s [`setSharedElementExitTransition()`][4],
[`setSharedElementEnterTransition()`][5], [setSharedElementReturnTransition()][6], and [`setSharedElementReenterTransition()`][7] methods.

A window's default shared element enter and exit transitions are both `@android:transition/move`:

```xml
<transitionSet xmlns:android="http://schemas.android.com/apk/res/android">
    <changeBounds/>
    <changeTransform/>
    <changeClipBounds/>
    <changeImageTransform/>
</transitionSet>
```

If the window's shared element return and reenter transitions are not explicit set, they will take the same value as the window's shared element enter and exit transitions respectively.

Typical Transitions will affect size and location, such as `ChangeBounds`.

### Life of an Activity Transition

When the user starts `B` from `A`, the following events occur:

1. `A`'s window exit transition is started and all leaf Views and transition groups in `A` are set to `INVISIBLE`. The window's exit transition will detect the view visibility change and will animate the transitioning views accordingly.

2. `B`'s layout is performed and its window is made translucent.

3. All transitioning views in `B` as `INVISIBLE`, starts the enter transition, and then marks all of the views as `VISIBLE`. The enter transition will detect the view visibility change and will animate the transitioning views accordingly.



### Important facts about Activity Transitions

* If the Activity Transition begins before your activity's view hierarchy is ready, the transition will likely break.

* Shared elements are not actually _shared_ between Activities.

* By default, shared elements are drawn in the decor view's `ViewOverlay`, on top of the entire application window's view hierarchy.

[0]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
[1]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
[2]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
[3]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)
[4]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
[5]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
[6]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
[7]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)