---
layout: post
title: Introduction to Activity Transitions in Android Lollipop
---

Introduction paragraph.

Before we dive into the new Activity Transition APIs, it helps to have a high-level understanding of the Transitions framework on which they depend.

<!--more-->

### The Transition Framework

Activity Transitions are built on top of a relatively new feature in Android called _transitions_. Introduced in KitKat, the transition framework provides a convenient, easy-to-use API for animating between different UI states in an application. The framework is built around two key entities: _scenes_ and _transitions_. A scene defines a given state of an application's UI, whereas a transition defines the animated change from one scene to another.

When a scene change occurs, a `Transition` has three main responsibilities: (1) capturing the start and end state of each view in the scene and (2) creating an `Animator` based on the differences that will perform an animation between the two scenes. Consider as an example the steps involved in running a typical `Fade` transition:

1. The framework calls `Fade#captureStartValues(TransitionValues)` for each target `view` in the scene. The `Fade` transition implements this method by calling `view.getVisibility()` and recording its value in the `TransitionValues` object passed as an argument.
2. The developer modifies the visibility of one or more target views to match the desired visibility in the end scene.
3. On the next display frame, the framework calls `Fade#captureEndValues(TransitionValues)` for each target view in the scene. The `Fade` transition implements this method by calling `view.getVisibility()` and recording its value in the `TransitionValues` object passed as an argument.
4. The framework calls `Fade#createAnimator(ViewGroup, TransitionValues, TransitionValues)`. The `Fade` transition implements this method by creating an `ObjectAnimator` for each target view in the scene that either fades the view in or out. After iterating over all of the views, the resulting `ObjectAnimator`s are added to a `TransitionSet` which is finally returned to the framework.
5. The framework runs the `Animator` returned in step 4, causing all of the target views to gradually fade either in or out.

**TODO: in the fade example above, make the scenario more concrete... describe the start/end scenes and maybe even add a video so there isn't any confusion**

### Introducing Activity Transitions

Beginning with Lollipop, `Transition`s can now be used to orchestrate more elaborate animations between `Activity`s. Before we start getting into the code, however, it will be helpful to discuss some basic definitions and common terminology that are used in the rest of this post:

> Let `A` and `B` be activities and assume activity `A` starts activity `B`. We refer to `A` as the _calling Activity_ (the activity that "calls" `startActivity()`) and `B` as the _called Activity_.

The Activity Transition APIs are built around the idea of _exit, enter, return, and reenter transitions_. In the context of activities `A` and `B` defined above, we describe the role of each as follows:

> Activity `A`'s _exit transition_ determines how views in `A` are animated when `A` starts `B`.
>
> Activity `B`'s _enter transition_ determines how views in `B` are animated when `A` starts `B`.
>
> Activity `B`'s _return transition_ determines how views in `B` are animated when `B` returns to `A`.
>
> Activity `A`'s _reenter transition_ determines how views in `A` are animated when `B` returns to `A`.

Lastly, the framework provides APIs for two types of Activity Transitions&mdash;_window transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between activities in unique ways. We discuss each in greater detail in the below two sections.

#### Window Transitions

Window transitions determine how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the scene when an Activity Transition occurs. **TODO: for example, in the example on the right the calling activity is using an `Explode` exit transition, which causes its views to fly off the screen away from the center.** The default value for a window's exit and enter transitions is a simple [`Fade`][Fade]. However, the framework also allows us to set our own [exit][setExitTransition], [enter][setEnterTransition], [return][setReturnTransition], and [reenter][setReenterTransition] window transitions if necessary, either programatically or in XML as part of the activity's theme. **TODO: mention the `ActivityOptions#makeSceneTransitionAnimation` method?**

Window transitions should almost always (**TODO: write footnote explaining why "almost always"?**) extend [`Visibility`][Visibility]. To understand why, let's see what happens under-the-hood when activity `A` starts activity `B` (**TODO: write footnote saying a similar process occurs in the opposite direction when `B` returns to `A`**):

1. `A`'s exit transition captures start values for the target views in `A`.
2. The framework sets all target views in `A` to `INVISIBLE`.
3. On the next display frame, `A`'s exit transition captures end values for the target views in `A`.
4. `A`'s exit transition compares the start and end values of its target views and creates an `Animator` based on the differences.
5. Activity `B` is started and all of its target views are made `INVISIBLE`.
6. `B`'s enter transition captures start values for the target views in `B`.
7. The framework sets all target views in `B` to `VISIBLE`.
8. On the next display frame, `B`'s enter transition captures end values for the target views in `B`.
9. `B`'s enter transition compares the start and end values of its target views and creates an `Animator` based on the differences.

As we can see, window transitions are primarily governed by changes made to a view's visibility. Fortunately, capturing these values is exactly what the abstract `Visibility` class is designed to do! In many cases, using a `Fade`, `Slide`, `Explode`&mdash;all of which extend `Visibility`&mdash;as our window transitions will suffice. However, if you ever find yourself implementing a custom window transition, remember that extending `Visibility` will likely save you a lot of work!

#### Shared Element Transitions

Shared element transitions determine how an activity's _shared elements_ (or _hero views_) are animated from one activity to another when an Activity Transition occurs. **TODO: for example, in the example on the right the called activity is using a `ChangeBounds` enter transition, which causes the shared view to reposition itself within its new activity's layout.** The default value for a shared element exit and enter transitions is [`@android:transition/move`][Move]. However, the framework also allows us to set our own [exit][setSharedElementExitTransition], [enter][setSharedElementEnterTransition], [return][setSharedElementReturnTransition], and [reenter][setSharedElementReenterTransition] shared element transitions if necessary, either programatically or in XML as part of the activity's theme. **TODO: mention the `ActivityOptions#makeSceneTransitionAnimation` method?**

When selecting a shared element transition to use, it is important that the transition is able to record start and end values such as size and location. To understand why, let's see what happens under-the-hood when activity `A` starts activity `B` (**TODO: write footnote saying a similar process occurs in the opposite direction when `B` returns to `A`**):

1. `A`'s shared element exit transition captures start values for the shared elements in `A`.
2. The shared elements in `A` are modified to match their final resting position in `A`. **TODO: explain why exit/reenter transitions are usually not necessary when animating shared elements.**
3. On the next display frame, `A`'s exit transition captures end values for all of the shared elements in `A`.
4. `A`'s shared element exit transition compares the start and end values of its shared element views and creates an `Animator` based on the differences.
5. The shared elements are positioned in `B` to match their end values in `A`.
6. `B`'s shared element enter transition captures start values for all of the shared elements in `B`.
7. All of the shared elements in `B` are repositioned to match their end values.
8. On the next display frame, `B`'s shared element enter transition captures end values for all of the shared elements in `B`.
9. `B`'s shared element enter transition compares the start and end values of its shared element views and creates an `Animator` based on the differences.

Whereas window content transitions are converned with changes made to its transitioning views' visibility, shared element transitions must listen for changes made to its views' position and size on the screen. As a result, `ChangeBounds`, `ChangeTransform`, `ChangeClipBounds`, `ChangeImageTransform`, or some combination of each are usually good candidates to use as shared element transitions.

**TODO: end this post with a brief code snippet illustrating how to initiate an Activity/Fragment transition?**

**TODO: break the rest of this post up into two parts? second part is about advanced topics discussed below?**

### Key Concepts to Understand about Activity Transitions

Now that we've seen what happens under-the-hood, there are a few key concepts that are important to understand before we begin writing the actual code.

* <b>The activity's view hierarchy must finish its layout before the transition begins.</b> If the transition begins before then, the transition will not have all of the information it needs to perform the animation (i.e. the start and/or end values will be missing), and the transition will appear to break. To get around this, a common pattern will be to postpone the activity’s transition by calling `postponeEnterTransition()`. When you know for certain that the activity has finished its layout, simply call `startPostponedEnterTransition()`. A good place to call `startPostponedEnterTransition()` is in an `onPreDraw` listener. For example,

    ```java
    view.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
        @Override
        public boolean onPreDraw() {
            view.getViewTreeObserver().removeOnPreDrawListener(this);
            startPostponedEnterTransition();
            return true;
        }
    });
    ```

    where `view` is a `View` that might take a couple extra layout passes before its final end values are set.

* <b>Shared elements are not actually "shared".</b> When you look at a shared element transition, you might think that what you are seeing is a single `View` object animating out of its activity and into its resting location within the new activity. _This is not the case._ What actually happens is the called Activity starts out translucent. One of the first things the framework does is it adds the shared elements to the translucent Activity and repositions them to match the view’s initial position inside the calling Activity and sets the view inside the calling Activity to `INVISIBLE`. When the transition begins, the shared element will appear to transition seamlessly from one Activity to another (but really what happens is the shared element is simply animating inside the called Activity, which gradually animates from translucent to fully opaque).

* <b>By default, shared elements are drawn on top of the view hierarchy in a `ViewOverlay`.</b> This default behavior ensures that the shared elements will always be the central focus of the Activity transition, as it makes it impossible for non-shared elements&mdash;in both the called and calling Activity's view hierarchies&mdash;to accidentally draw on top of the views that are being shared across Activities. This default behavior can be disabled in your theme's XML or programatically by calling [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay]. **TODO: also discuss the potential side-effects of disabling the overlay? Link to G+ post about covering up the system UI?**

* <b>You can further customize your shared element transitions by setting a [`SharedElementCallback`][SharedElementCallback].</b> Understanding the SharedElementCallback class will be important if you want to implement custom Transitions that are more complicated than simply moving an image from one location to another. In particular, the following three callback methods are very important to understand when writing more complex shared element transitions:

    - `onMapSharedElements()` lets you adjust the mapping of shared element names to Views. **TODO: more detail.**
    - `onSharedElementStart()` and `onSharedElementEnd()` let you adjust view properties in your layout immediately before the transitions capture their start and end values respectively. **TODO: more detail.**

* <b>Return and reenter transitions default to the enter and exit transitions respectively.</b> **TODO: keep this part?**

* <b>By default, the exit and enter transitions overlap.</b> **TODO: keep this part?**

* <b>Need to request window activity transition feature if not using material theme.</b> **TODO: keep this part?**

In the next few blog posts, I will give detailed examples of how transitions should and can be used to achieve some cool effects in your applications.

### TODO list:

* **TODO: explain the concept of "target views" as well?**
* **TODO: brief introduction to fragment transitions?**

  [setExitTransition]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [setEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [setReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [setReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)

  [setSharedElementExitTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [setSharedElementEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [setSharedElementReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [setSharedElementReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)

  [setSharedElementsUseOverlay]: https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)

  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html
  [Fade]: https://developer.android.com/reference/android/transition/Fade.html
  [Move]: https://android.googlesource.com/platform/frameworks/base/+/lollipop-release/core/res/res/transition/move.xml
  [Visibility]: https://developer.android.com/reference/android/transition/Visibility.html

