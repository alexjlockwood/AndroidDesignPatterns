---
layout: post
title: Implementing Activity Transitions in Android Lollipop
---

### `android.transition`

Before we dive into the new Activity Transition APIs, it helps to have a high-level understanding of the Transitions framework on which they depend. The Transition framework makes it possible to animate between different UI states in your application in a more declarative manner. The framework is built around three core entities: Scene root, scenes, and Transitions. A scene defines a given layout state of an application's UI, whereas a transition defines a change from one scene to another.

When a scene change occurs, a `Transition` has two main jobs: capturing the differences between the two scenes and generating an `Animator` that will perform an animation between the two scenes. Specifically, the following steps occur when a scene change is triggered:

1. The TransitionManager capture the current start values in the scene root and then posts a request to run a transition on the next frame. Specifically, the `Transition#captureStartValues` method is called and the starting scene's properties are recorded inside the Transition object. 
2. The views in the current scene have their properties modified.
3. The `Transition#captureEndValues` method is called and the ending scene's properties are recorded inside the Transition object.
4. `Transition#createAnimator` is called. Using the start and end values recorded in steps 1 and 3, an `Animator` is created that will animate between the two start and end states.

**TODO: Give concrete example/video here? Explain what a "scene" is in the context of a Activity Transition. Also explain that that "scene root" is the window's decor view?**

### Activity Transitions Terminology

Starting with Lollipop, `Transition`s can be used to animate animate `Activity`s. Before we get into the details of these new APIs, it will be helpful to discuss some of the common terminology used in the rest of this post. Let `A` and `B` be activities. If activity `A` starts activity `B`, then we refer to `A` as the _calling Activity_ (the activity transition that initiated the transition by "calling" `startActivity()`) and `B` as the _called Activity_.

* An _exit transition_ is a transition that animates the views in `A` when `A` starts `B`.

* An _enter transition_ is a transition that animates the views in `B` when `A` starts `B`.

* A _return transition_ is a transition that animates the views in `B` when the user finishes `B` and returns to `A`. If a return transition is not explicitly set, the current enter transition is used instead.

* A _reenter transition_ is a transition that animates the views in `A` when the user finishes `B` and returns to `A`. If a reenter transition is not explicitly set, the current exit transition is used instead.

There are two types of `Activity` transitions: _window content transitions_ and _shared element transitions_.

#### Window Content Transitions

Window content transitions operate on the non-shared views in the activity's view hierarchy. We refer to these views as _transitioning views_. Whereas shared elements are the central focus of an activity transition, transitioning views animate in the background to provide a subtle side effect.

As with shared element transitions, the framework allows us to specify [exit][0], [enter][1], [return][2], and [reenter][3] window content transitions. The default values for a window's exit and enter transition is `Fade`. How though should we select our transitions? To answer this question, we need to understand what happens under-the-hood. When activity `A` starts activity `B`, the following events occur:

1. `A`'s exit transition captures start values for all of the leaf views in `A`.
2. All of the leaf views in `A` are made `INVISIBLE`.
3. On the next animation frame, `A`'s exit transition captures end values for all of the leaf views in `A`.
4. `A`'s exit transition creates its `Animator` and is run.

Shortly after, `B` goes through a similar sequence of events:

1. All of the leaf views in `B` are made `INVISIBLE`.
2. `B`'s enter transition captures start values for all of the leaf views in `B`.
3. All of the leaf views in `B` are made `VISIBLE`.
4. On the next animation frame, `B`'s enter transition captures end values for all of the leaf views in `B`.
5. `B`'s enter transition creates its `Animator` and is run.

Thus, since window transitions are governed by changes to a view's visibility, most transitions will extend `Visibility` (i.e. `Fade`, `Slide`, `Explode`, etc.).

#### Shared Element Transitions

Shared element transitions operate on the shared views in the activity's view hierarchy. We refer to these views as shared elements_ or _hero views. 

The framework allows us to specify [exit][4], [enter][5], [return][6], and [reenter][7] shared element transitions. The default values for a shared element exit and enter transition is `@android:transition/move`:

```xml
<transitionSet xmlns:android="http://schemas.android.com/apk/res/android">
    <changeBounds/>
    <changeTransform/>
    <changeClipBounds/>
    <changeImageTransform/>
</transitionSet>
```

How though should we select our transitions? To answer this question, we need to understand what happens under-the-hood. When activity `A` starts activity `B`, the following events occur:

1. TODO: figure out what actually happens here during the exit transition...

Shortly after, `B` goes through a similar sequence of events:

1. TODO: figure out what actually happens here during the enter transition...

Since shared element transitions are governed by changes to a view’s size and position, transitions are usually a mix of `ChangeBounds`, `ChangeTransform`, `ChangeClipBounds`, `ChangeImageTransform`, or a combination of all of them inside a single `TransitionSet`.

### Getting Started with Activity Transitions

asdf

  [0]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [1]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [2]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [3]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)
  [4]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [5]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [6]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [7]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)

