---
layout: post
title: 'Introduction to Activity & Fragment Transitions in Android Lollipop (part 1)'
date: 2014-11-01
permalink: /2014/11/activity-fragment-transitions-android-lollipop-part1.html
---

Introduction paragraph.

Before we dive into the new Activity Transition APIs, it helps to have a high-level understanding of the Transitions framework on which they depend.

<!--more-->

### The Transition Framework

Activity Transitions are built on top of a relatively new feature in Android called _transitions_. Introduced in KitKat, the transition framework provides a convenient, easy-to-use API for animating between different UI states in an application. The framework is built around two key entities: _scenes_ and _transitions_. A scene defines a given state of an application's UI, whereas a transition defines the animated change from one scene to another. When a scene change occurs, a transition has two main responsibilities: (1) capturing the start and end state of each view in the scene and (2) creating an `Animator` based on the differences that will animate the views between the two scenes.

Perhaps the best way to understand how the Transition Framework works is through an example. Consider the short code snippet below:

```java
public class MainActivity extends Activity implements View.OnClickListener {
    private ViewGroup mRootView;
    private View mRedBox, mGreenBox, mBlueBox;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mRootView = (ViewGroup) findViewById(R.id.layout_root_view);
        mRootView.setOnClickListener(this);

        mRedBox = findViewById(R.id.red_box);
        mGreenBox = findViewById(R.id.green_box);
        mBlueBox = findViewById(R.id.blue_box);
    }

    @Override
    public void onClick(View v) {
        TransitionManager.beginDelayedTransition(mRootView, new Fade());
        toggleVisibility(mRedBox, mGreenBox, mBlueBox);
    }

    private static void toggleVisibility(View... views) {
        for (View view : views) {
            boolean isVisible = view.getVisibility() == View.VISIBLE;
            view.setVisibility(isVisible ? View.INVISIBLE : View.VISIBLE);
        }
    }
}
```

Let's walk through the steps involved when the `Fade` transition is run for the first time, assuming each view initially starts out as `VISIBLE` (**TODO: explode transition more exciting example? include video?**):

1. The developer calls `TransitionManager.beginDelayedTransition(ViewGroup, Transition)`, passing the scene root and a `Fade` transition as the arguments. The framework immediately calls the transition's `captureStartValues(TransitionValues)` method for each `view` in the scene and the transition responds by recording each `view`'s visibility in the `TransitionValues` argument.
2. After `beginDelayedTransition()` returns, the developer sets each view in the scene from `VISIBLE` to `INVISIBLE`.
3. On the next display frame, the framework calls the transition's `captureEndValues(TransitionValues)` method for each `view` in the scene and the transition records each `view`'s (recently updated) visibility in the `TransitionValues` argument.
4. The framework calls the transition's `createAnimator(ViewGroup, TransitionValues, TransitionValues)` method. The transition analyzes the start and end values of each view and notices a difference: the views are `VISIBLE` in the start scene but `INVISIBLE` in the end scene. As a result, the `Fade` transition creates an `Animator` that will fade each view's `alpha` property to `0` and returns it back to the framework.
5. The framework runs the `Animator` and all views gradually fade out of the screen.

Using `Transition`s to animate between different UI states in your application offers two main advantages. First, _`Transition`s abstract the idea of `Animator`s from the developer_. All the developer must do is ensure the start and end values for each view are properly set and the `Transition` will do the rest. Second, _animations between scenes can be easily changed simply by using a different `Transition` object_. For example, in the example above we could easily replace the `Fade` with a `Slide` and `Explode` to achieve dramatically different effects. As we will see in the rest of the post, these two advantages will make it relatively easy to implement our own custom Activity Transitions, which we discuss in the next section.

### Introducing Activity Transitions

Beginning with Lollipop, `Transition`s can be used to orchestrate more elaborate animations between `Activity`s. Before we start getting into the code, however, it will be helpful to discuss some basic definitions and common terminology that are used in the rest of this post:

> Let `A` and `B` be activities and assume activity `A` starts activity `B`. We refer to `A` as the _calling Activity_ (the activity that "calls" `startActivity()`) and `B` as the _called Activity_.

The Activity Transition APIs are built around the idea of _exit, enter, return, and reenter transitions_. In the context of activities `A` and `B` defined above, we describe the role of each as follows:

> Activity `A`'s _exit transition_ determines how views in `A` are animated when `A` starts `B`.
>
> Activity `B`'s _enter transition_ determines how views in `B` are animated when `A` starts `B`.
>
> Activity `B`'s _return transition_ determines how views in `B` are animated when `B` returns to `A`.
>
> Activity `A`'s _reenter transition_ determines how views in `A` are animated when `B` returns to `A`.

Lastly, the framework provides APIs for two types of Activity Transitions&mdash;_window content transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between activities in unique ways. We discuss each in greater detail below.

#### Window Content Transitions

Window content transitions determine how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the Activity scene. (**TODO: for example...**) Material-themed applications have their window content exit and enter transitions set to `null` and `Fade` respectively by default. If necessary, we can specify our own [exit][setExitTransition], [enter][setEnterTransition], [return][setReturnTransition], and [reenter][setReenterTransition] window content transitions as well, either programatically or in XML as part of the activity's theme.

Window content transitions are initiated by altering each view's visibility. To understand what this means, let's see what happens under-the-hood when activity `A` starts activity `B`:

1. `A` calls `startActivity()`.
2. `A`'s exit transition captures start values for the transitioning views in `A`.
3. The framework sets all transitioning views in `A` to `INVISIBLE`.
4. On the next display frame, `A`'s exit transition captures end values for the transitioning views in `A`.
5. `A`'s exit transition compares the start and end values of its transitioning views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views exit the scene.
6. Activity `B` is initialized with all of its transitioning views initially set as `INVISIBLE`.
7. `B`'s enter transition captures start values for the transitioning views in `B`.
8. The framework sets all transitioning views in `B` to `VISIBLE`.
9. On the next display frame, `B`'s enter transition captures end values for the transitioning views in `B`.
10. `B`'s enter transition compares the start and end values of its target views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views enter the scene.

Because entering and exiting is governed by toggling visibility between `INVISIBLE` and `VISIBLE`, most window content transitions will extend the abstract `Visibility` class, which is designed to react to such changes.

As we can see, window transitions are primarily governed by changes made to a view's visibility. Fortunately, capturing these values is exactly what the abstract `Visibility` class is designed to do! In many cases, using a `Fade`, `Slide`, `Explode`&mdash;all of which extend `Visibility`&mdash;as our window transitions will suffice. However, if you ever find yourself implementing a custom window transition, remember that extending `Visibility` will likely save you a lot of work! (**TODO: write footnote saying a similar process occurs in the opposite direction when `B` returns to `A`?**)

#### Shared Element Transitions

Shared element transitions determine how an activity's _shared elements_ (or _hero views_) are animated from one activity to another when an Activity Transition occurs. The default value for a shared element exit and enter transitions is [`@android:transition/move`][Move]. However, the framework also allows us to set our own [exit][setSharedElementExitTransition], [enter][setSharedElementEnterTransition], [return][setSharedElementReturnTransition], and [reenter][setSharedElementReenterTransition] shared element transitions if necessary, either programatically or in XML as part of the activity's theme. **TODO: for example, in the example on the right the called activity is using a `ChangeBounds` enter transition, which causes the shared view to reposition itself within its new activity's layout.**

When selecting a shared element transition to use, it is important that the transition is able to record start and end values such as size and location. To understand why, let's see what happens under-the-hood when activity `A` starts activity `B` (**TODO: write footnote saying a similar process occurs in the opposite direction when `B` returns to `A`**):

1. `A`'s shared element exit transition captures start values for the shared elements in `A`.
2. The shared elements in `A` are modified to match their final resting position in `A`.
3. On the next display frame, `A`'s exit transition captures end values for all of the shared elements in `A`.
4. `A`'s shared element exit transition compares the start and end values of its shared element views and creates an `Animator` based on the differences.
5. The shared elements are positioned in `B` to match their end values in `A`.
6. `B`'s shared element enter transition captures start values for all of the shared elements in `B`.
7. All of the shared elements in `B` are repositioned to match their end values.
8. On the next display frame, `B`'s shared element enter transition captures end values for all of the shared elements in `B`.
9. `B`'s shared element enter transition compares the start and end values of its shared element views and creates an `Animator` based on the differences.

**TODO: explain why exit/reenter transitions are usually not necessary when animating shared elements.**

Whereas window content transitions are concerned with changes made to its transitioning views' visibility, shared element transitions must listen for changes made to its views' position and size on the screen. As a result, `ChangeBounds`, `ChangeTransform`, `ChangeClipBounds`, `ChangeImageTransform`, or some combination of each are usually good candidates to use as shared element transitions.

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

  [Fade]: https://developer.android.com/reference/android/transition/Fade.html
  [Move]: https://android.googlesource.com/platform/frameworks/base/+/lollipop-release/core/res/res/transition/move.xml
  [Visibility]: https://developer.android.com/reference/android/transition/Visibility.html

  [Theme_Material]: https://developer.android.com/reference/android/R.style.html#Theme_Material
