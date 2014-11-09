---
layout: post
title: Introduction to Activity Transitions
---

## The `android.transition` Framework

Before we dive into the new Activity Transition APIs, it helps to have a high-level understanding of the Transitions framework on which they depend. The Transition framework makes it possible to animate between different UI states in your application in a more declarative manner. The framework is built around three core entities: Scene root, scenes, and Transitions. A scene defines a given layout state of an application's UI, whereas a transition defines a change from one scene to another.

When a scene change occurs, a `Transition` has two main jobs: capturing the differences between the two scenes and generating an `Animator` that will perform an animation between the two scenes. Specifically, the following steps occur when a scene change is triggered:

1. The TransitionManager capture the current start values in the scene root and then posts a request to run a transition on the next frame. Specifically, the `Transition#captureStartValues` method is called and the starting scene's properties are recorded inside the Transition object. 
2. The views in the current scene have their properties modified.
3. The `Transition#captureEndValues` method is called and the ending scene's properties are recorded inside the Transition object.
4. `Transition#createAnimator` is called. Using the start and end values recorded in steps 1 and 3, an `Animator` is created that will animate between the two start and end states.

**TODO: Give concrete example/video here? Explain what a "scene" is in the context of a Activity Transition. Also explain that that "scene root" is the window's decor view?**

## Activity Transitions

Starting with Lollipop, `Transition`s can be used to animate animate `Activity`s. Before we get into the details of these new APIs, it will be helpful to discuss some of the common terminology used in the rest of this post. Let `A` and `B` be activities. If activity `A` starts activity `B`, then we refer to `A` as the _calling Activity_ (the activity transition that initiated the transition by "calling" `startActivity()`) and `B` as the _called Activity_.

* An _exit transition_ is a transition that animates the views in `A` when `A` starts `B`.

* An _enter transition_ is a transition that animates the views in `B` when `A` starts `B`.

* A _return transition_ is a transition that animates the views in `B` when the user finishes `B` and returns to `A`. If a return transition is not explicitly set, the current enter transition is used instead.

* A _reenter transition_ is a transition that animates the views in `A` when the user finishes `B` and returns to `A`. If a reenter transition is not explicitly set, the current exit transition is used instead.

There are two types of `Activity` transitions: _shared element transitions_ and _window content transitions_.

### Shared Element Transitions

asdf

### Window Content Transitions

Window content transitions operate on the non-shared views in the activity's view hierarchy. We refer to these views as _transitioning views_. Whereas shared elements are the central focus of an activity transition, transitioning views animate in the background to provide a subtle side effect.
