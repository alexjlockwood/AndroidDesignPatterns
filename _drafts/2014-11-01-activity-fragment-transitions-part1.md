---
layout: post
title: 'Getting Started with Activity Transitions (part 1)'
date: 2014-11-01
permalink: /2014/11/activity-transitions-getting-started-part1.html
---

This post gives a brief overview of the new Activity Transition APIs added in Android 5.0 Lollipop. This is the first of a series of posts I will be writing on the topic:

* **Part 1:** <a href="/2014/11/activity-transitions-getting-started-part1.html">Getting Started with Activity Transitions</a>
* **Part 2:** _Window Content Transitions In-Depth (coming soon!)_
* **Part 3:** _Shared Element Transitions In-Depth (coming soon!)_

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't fret: I'll point out the significant differences between the two as they are encountered in the post!

**TODO: write sentence transitioning into next section...**

### The Transition Framework

<!--morestart-->

Activity Transitions are built on top of a relatively new feature in Android called _transitions_. Introduced in KitKat, the transition framework provides a convenient API for animating between different UI states in an application. The framework is built around two key concepts: _scenes_ and _transitions_. A scene defines a given state of an application's UI, whereas a transition defines the animated change between two scenes. When a scene change occurs, a transition has two main responsibilities: (1) capturing the start and end state of the views in each scene and (2) creating an `Animator` based on the differences that will animate the views from one scene to another.

<!--more-->

As we will soon see in the next couple of posts, understanding how the transitions framework works will give us a much greater understanding of how the Activity Transition APIs behave under-the-hood, so let's walk through a simple example. Consider an `Activity` that wants to fade its views either in or out whenever the user taps the screen. We can achieve this effect with only a few lines using Android's transition framework:

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

Let's walk through the steps involved when the user taps the screen for the first time. We will assume each view is initially `VISIBLE` on screen when the `Fade` transition is run&mdash;that is, in the starting scene all of the views start out `VISIBLE` and in the ending scene all of the views end up `INVISIBLE`:

<div style="width:290px;margin-left:35px;float:right">
  <div class="framed-nexus6-port">
  <video id="figure1" onclick="playPause1()">
    <source src="/assets/videos/posts/2014/11/01/figure1-opt.mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 1</strong> - Running the example transition above using a <code>Fade</code>, <code>Slide</code>, and <code>Explode</code>. Click to replay.</p>
  </div>
</div>

1. The developer calls `beginDelayedTransition()`, passing the scene root and a `Fade` transition as the arguments. The framework immediately calls the transition's `captureStartValues()` method for each `view` in the scene and the transition records each `view`'s visibility in the `TransitionValues` argument.
2. After `beginDelayedTransition()` returns, the developer sets each view in the scene from `VISIBLE` to `INVISIBLE`.
3. On the next animation frame, the framework calls the transition's `captureEndValues()` method for each `view` in the scene and the transition records each `view`'s (recently updated) visibility in the `TransitionValues` argument.
4. The framework calls the transition's `createAnimator()` method. The transition analyzes the start and end values of each view and notices a difference: the views are `VISIBLE` in the start scene but `INVISIBLE` in the end scene. The `Fade` transition uses this information to create an `Animator` that will fade each view's `alpha` property to `0f`.
5. The framework runs the `Animator` and all views gradually fade out of the screen.

Overall, the transitions framework offers two main advantages. First, `Transition`s abstract the idea of `Animator`s from the developer, and as a result significantly reduces the amount of code you will need to write in your activities and fragments. All the developer must do is ensure the start and end values for each view are properly set and the `Transition` will do the rest. Second, animations between scenes can be easily changed simply by using a different `Transition` object. For example, **Figure 1** illustrates the dramatically different effects we can achieve by simply replacing our `Fade` transition with a `Slide` or `Explode`. As we will see in the rest of this post, these two advantages make it relatively easy to implement custom Activity Transitions in Android Lollipop.

### Introducing Activity Transitions

Beginning with Lollipop, `Transition`s can be used to orchestrate elaborate animations between `Activity`s. Before we start getting into the code, however, it will be helpful to discuss the terminology that is used in the rest of this post:

> Let `A` and `B` be activities and assume activity `A` starts activity `B`. We refer to `A` as the "_calling Activity_" (the activity that "calls" `startActivity()`) and `B` as the "_called Activity_".

The Activity Transition APIs are built around the idea of _exit, enter, return, and reenter transitions_. In the context of activities `A` and `B` defined above, we describe the role of each as follows:

> Activity `A`'s _exit transition_ determines how views in `A` are animated when `A` starts `B`.
>
> Activity `B`'s _enter transition_ determines how views in `B` are animated when `A` starts `B`.
>
> Activity `B`'s _return transition_ determines how views in `B` are animated when `B` returns to `A`.
>
> Activity `A`'s _reenter transition_ determines how views in `A` are animated when `B` returns to `A`.

<div style="width:290px;margin-right:35px;float:left">
  <div class="framed-nexus6-port">
  <video id="figure2" onclick="playPause2()">
    <source src="/assets/videos/posts/2014/11/01/figure2-opt.mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 2</strong> - An example illustrating window content transitions and shared element transitions in action. Click to replay.</p>
  </div>
</div>

Lastly, the framework provides APIs for two types of Activity Transitions&mdash;_window content transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between activities in unique ways:

> A _window content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.
>
> A _shared element transition_ determines how an activity's _shared elements_ (also called _hero views_) are animated between two activities.

**Figure 2** gives a nice illustration of window content transitions and shared element transitions in action. In the example, activity `A` displays a grid of Radiohead album covers and activity `B` displays a background image and some details about the selected album.

The exit and reenter window content transitions for `A` are both `null`, meaning that no animation will take place on the views in `A` when the user exits or reenters the activity. The enter and return window content transitions for `B` on the other hand are a `TransitionSet` that plays two child transitions in parallel: a `Slide(Gravity.TOP)` transition targeting the top half of the activity and a `Slide(Gravity.BOTTOM)` transition targeting the bottom half of the activity. As for the shared element transitions, the enter and return transitions both use a simple `ChangeImageTransform`.

Finally, note that the alpha animation performed on the background image is not actually part of the enter window content transition. Instead, `B`'s enter window content transition is assigned a `TransitionListener` that will gradually fade-in the background image once the transition completes. We'll learn more about how to customize our transitions like this in a future post. For now, let's keep things simple and first familiarize ourselves with the Activity Transitions API.

### Getting Started with the Activity Transitions API

Summarized below are the simple steps required to use Activity Transitions in your application:

* Enable window content transitions for both the calling and called activities by requesting the [`Window.FEATURE_CONTENT_TRANSITIONS`][FEATURE_CONTENT_TRANSITIONS] window feature, either programatically or in your theme's XML.
* Specify [exit][setExitTransition] and [enter][setEnterTransition] window content transitions for your calling and called activities respectively. Material-themed applications have their window content exit and enter transitions set to `null` and [`Fade`][Fade] respectively by default. [Reenter][setReenterTransition] and [return][setReturnTransition] transitions default to the activity's exit and enter window content transitions respectively if they are not explicitly set.
* Specify [exit][setSharedElementExitTransition] and [enter][setSharedElementEnterTransition] shared element transitions for your calling and called activities respectively. Material-themed applications have their shared element exit and enter transitions set to [`@android:transition/move`][Move] by default. [Reenter][setSharedElementReenterTransition] and [return][setSharedElementReturnTransition] transitions default to the activity's exit and enter shared element transitions respectively if they are not explicitly set.
* To start an Activity Transition with no window content transitions and no shared elements, call the `startActivity(Context, Bundle)` method, passing `null` as the second argument.
* To start an Activity Transition with window content transitions but no shared elements, call the `startActivity(Context, Bundle)` method, passing the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity).toBundle();
    ```
* To start an Activity Transition with window content transitions and shared elements, call the `startActivity(Context, Bundle)` method, passing the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity, pairs).toBundle();
    ```
where `pairs` is an array of `Pair<View, String>` objects listing the shared element views and names that you'd like to share between activities. Don't forget to give your shared elements unique transition names either [programatically][setTransitionName] or in [XML][transitionName]. Otherwise, the transition will likely break!

**TODO: discuss the Fragment Transition API briefly**

(**TODO: better last sentence...**) In the next two posts, we will explore both window content transitions and shared element transitions in depth.

<hr class="footnote-divider"/>

<sup id="footnote1">1</sup> Foot note #1. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

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
