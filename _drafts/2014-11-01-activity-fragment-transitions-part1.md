---
layout: post
title: 'Activity & Fragment Transitions in Android Lollipop (part 1)'
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
    private View mRedBox, mGreenBox, mBlueBox, mBlackBox;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mRootView = (ViewGroup) findViewById(R.id.layout_root_view);
        mRootView.setOnClickListener(this);

        mRedBox = findViewById(R.id.red_box);
        mGreenBox = findViewById(R.id.green_box);
        mBlueBox = findViewById(R.id.blue_box);
        mBlackBox = findViewById(R.id.black_box);
    }

    @Override
    public void onClick(View v) {
        TransitionManager.beginDelayedTransition(mRootView, new Fade());
        toggleVisibility(mRedBox, mGreenBox, mBlueBox, mBlackBox);
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

1. The developer calls `TransitionManager.beginDelayedTransition(ViewGroup, Transition)`, passing the scene root and a `Fade` transition as the arguments. The framework immediately calls the transition's `captureStartValues(TransitionValues)` method for each `view` in the scene and the transition records each `view`'s visibility in the `TransitionValues` argument.
2. After `beginDelayedTransition()` returns, the developer sets each view in the scene from `VISIBLE` to `INVISIBLE`.
3. On the next animation frame, the framework calls the transition's `captureEndValues(TransitionValues)` method for each `view` in the scene and the transition records each `view`'s (recently updated) visibility in the `TransitionValues` argument.
4. The framework calls the transition's `createAnimator(ViewGroup, TransitionValues, TransitionValues)` method. The transition analyzes the start and end values of each view and notices a difference: the views are `VISIBLE` in the start scene but `INVISIBLE` in the end scene. As a result, the `Fade` transition creates an `Animator` that will fade each view's `alpha` property to `0` and returns it back to the framework.
5. The framework runs the `Animator` and all views gradually fade out of the screen.

Overall, using `Transition`s to animate between different UI states in your application offers two main advantages. First, `Transition`s abstract the idea of `Animator`s from the developer. All the developer must do is ensure the start and end values for each view are properly set and the `Transition` will do the rest. Second, animations between scenes can be easily changed simply by using a different `Transition` object. For example, in the example above we could easily replace the `Fade` with a `Slide` and `Explode` to achieve dramatically different effects. As we will see in the rest of the post, these two advantages will make it relatively easy to implement our own custom Activity Transitions, which we discuss in the next section.

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

Lastly, the framework provides APIs for two types of Activity Transitions&mdash;_window content transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between activities in unique ways:

> A _window content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.
>
> A _shared element transition_ determines how an activity's _shared elements_ (also called _hero views_) are animated between two activities.

We will discuss these two types of transitions in greater detail in a future post. First, let's look at some code.

### Getting Started with the Activity Transitions API

In this section, we'll summarize the simple steps required to enable Activity Transitions in your application.

* Enable window content transitions for both the calling and called activities by requesting the [`Window.FEATURE_CONTENT_TRANSITIONS`][FEATURE_CONTENT_TRANSITIONS] window feature, either programatically or in your theme's XML.
* Specify [exit][setExitTransition] and [enter][setEnterTransition] window content transitions for your calling and called activities respectively. Material-themed applications have their window content exit and enter transitions set to `null` and [`Fade`][Fade] respectively by default. [Reenter][setReenterTransition] and [return][setReturnTransition] transitions default to the activity's exit and enter window content transitions respectively if not explicitly set.
* Specify [exit][setSharedElementExitTransition] and [enter][setSharedElementEnterTransition] shared element transitions for your calling and called activities respectively. Material-themed applications have their shared element exit and enter transitions set to [`@android:transition/move`][Move] by default. [Reenter][setSharedElementReenterTransition] and [return][setSharedElementReturnTransition] transitions default to the activity's exit and enter shared element transitions respectively if not explicitly set.
* To start an Activity Transition with no window content transitions and no shared elemens, call the `startActivity(Context, Bundle)` method, passing `null` as the second argument.
* To start an Activity Transition with window content transitions but no shared elements, call the `startActivity(Context, Bundle)` method, passing the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity).toBundle();
    ```
* To start an Activity Transition with shared elements, call the `startActivity(Context, Bundle)` method, passing the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity, pairs).toBundle();
    ```
where `pairs` is an array of `Pair<View, String>` objects listing the shared element views and names that you'd like to share between activities. Don't forget to give your shared elements unique transition names either [programatically][setTransitionName] or in [XML][transitionName]. Otherwise, the transition will likely break!

**TODO: give a detailed example/video so that the reader understands what a window content transition and shared element transition looks like on screen?**

In the next post, we will explore Activity Transitions in depth and will discuss a number of important concepts to understand while working with Activity Transitions.

### TODO list:

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
  [FEATURE_CONTENT_TRANSITIONS]: http://developer.android.com/reference/android/view/Window.html#FEATURE_CONTENT_TRANSITIONS
  [transitionName]: https://developer.android.com/reference/android/view/View.html#attr_android:transitionName
  [setTransitionName]: https://developer.android.com/reference/android/view/View.html#setTransitionName(java.lang.String)
