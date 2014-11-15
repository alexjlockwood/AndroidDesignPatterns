---
layout: post
title: 'Activity Transitions in Android Lollipop (part 1)'
date: 2014-11-01
permalink: /2014/11/activity-transitions-android-lollipop-part1.html
---

(**TODO: write better intro... this is a multi-part blog post**) Before we dive into the new Activity Transition APIs, it helps to have a high-level understanding of the Transitions framework on which they depend.

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

Let's walk through the steps involved when the `Fade` transition is run for the first time, assuming each view initially starts out as `VISIBLE`:

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
<script>
var myVideo1 = document.getElementById("figure1");
function playPause1() {
    myVideo1.load();
    myVideo1.play();
}
</script>

1. The developer calls `beginDelayedTransition(ViewGroup, Transition)`, passing the scene root and a `Fade` transition as the arguments. The framework immediately calls the transition's `captureStartValues(TransitionValues)` method for each `view` in the scene and the transition records each `view`'s visibility in the `TransitionValues` argument.
2. After `beginDelayedTransition()` returns, the developer sets each view in the scene from `VISIBLE` to `INVISIBLE`.
3. On the next animation frame, the framework calls the transition's `captureEndValues(TransitionValues)` method for each `view` in the scene and the transition records each `view`'s (recently updated) visibility in the `TransitionValues` argument.
4. The framework calls the transition's `createAnimator(ViewGroup, TransitionValues, TransitionValues)` method. The transition analyzes the start and end values of each view and notices a difference: the views are `VISIBLE` in the start scene but `INVISIBLE` in the end scene. As a result, the `Fade` transition creates an `Animator` that will fade each view's `alpha` property to `0` and returns it back to the framework.
5. The framework runs the `Animator` and all views gradually fade out of the screen.

Overall, using `Transition`s to animate between different UI states in your application offers two main advantages. First, `Transition`s abstract the idea of `Animator`s from the developer. All the developer must do is ensure the start and end values for each view are properly set and the `Transition` will do the rest. Second, animations between scenes can be easily changed simply by using a different `Transition` object. For example, **Figure 1** illustrates the dramatically different effects we can achieve by simply replacing our `Fade` transition with a `Slide` or `Explode`. As we will see in the rest of the post, these two advantages will make it relatively easy to implement our own custom Activity Transitions, which we discuss in the next section.

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

<div style="width:290px;margin-right:35px;float:left">
  <div class="framed-nexus6-port">
  <video id="figure2" onclick="playPause2()">
    <source src="/assets/videos/posts/2014/11/01/figure2-opt.mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 2</strong> - An example illustrating window content transitions and shared element transitions in action. Click to replay.</p>
  </div>
  <div style="clear:both;"></div>
</div>
<script>
var myVideo2 = document.getElementById("figure2");
function playPause2() {
    myVideo2.load();
    myVideo2.play();
}
</script>

Lastly, the framework provides APIs for two types of Activity Transitions&mdash;_window content transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between activities in unique ways:

> A _window content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.
>
> A _shared element transition_ determines how an activity's _shared elements_ (also called _hero views_) are animated between two activities.

**Figure 2** gives a nice illustration of window content transitions and shared element transitions in action. In the example, activity `A` displays a grid of Radiohead album covers and activity `B` displays a background image and some details about the selected album.

The exit and reenter window content transitions for `A` are both `null`, and the enter and return window content transitions for `B` are assigned a `TransitionSet` containing a `Slide(Gravity.TOP)` transition (targeting the `ImageView` at the top of the activity) and a `Slide(Gravity.BOTTOM)` transition (targeting the `TextView` at the bottom of the activity).

On the other hand, the exit and reenter shared element transitions for `A` are both `null` and the enter and return shared element transitions for `B` are a `ChangeImageTransform`.

Finally, `B`'s enter window content transition has a `TransitionListener` that will gradually fade-in the background image when the transition completes. A future post will give some more advanced tips and tricks on how this can be done in code. However, first we must familiarize ourselves with the Activity Transitions API.

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

In the next post, we will explore Activity Transitions in depth and will discuss a number of important concepts to understand while working with Activity Transitions.

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
