---
layout: post
title: 'Getting Started with Activity & Fragment Transitions (part 1)'
date: 2014-12-04
permalink: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2012/07/loaders-and-loadermanager-background.html']
updated: '2014-12-11'
---

This post gives a brief overview of `Transition`s and introduces the new [Activity & Fragment transition APIs][customizeActivityTransitions] that were added in Android 5.0 Lollipop. This is the first of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3:** [Shared Element Transitions In-Depth][part3]
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

We begin by answering the following question: what is a `Transition`?

### What is a `Transition`?

<!--morestart-->

Activity and Fragment transitions in Lollipop are built on top of a relatively new feature in Android called `Transition`s. Introduced in KitKat, the transition framework provides a convenient API for animating between different UI states in an application. The framework is built around two key concepts: _scenes_ and _transitions_. A scene defines a given state of an application's UI, whereas a transition defines the animated change between two scenes.

When a scene changes, a [`Transition`][Transition] has two main responsibilities:

1. Capture the state of each view in both the start and end scenes, and
2. Create an `Animator` based on the differences that will animate the views from one scene to the other.

<!--more-->

As an example, consider an `Activity` which fades its views in or out when the user taps the screen. We can achieve this effect with only a few lines using Android's transition framework, as shown in the code<sup><a href="#footnote1" id="ref1">1</a></sup> below:

```java
public class ExampleActivity extends Activity implements View.OnClickListener {
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

To better understand what happens under-the-hood in this example, let's analyze the process step-by-step assuming that each view is initially `VISIBLE` on screen:

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure11" onclick="playPause('figure11')" poster="/assets/videos/posts/2014/12/04/trivial-opt.png" preload="none">
    <source src="/assets/videos/posts/2014/12/04/trivial-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2014/12/04/trivial-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2014/12/04/trivial-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 1.1</strong> - Running the example transition above using a <code>Fade</code>, <code>Slide</code>, and <code>Explode</code>. Click to play.</p>
  </div>
</div>

1. A click is detected and the developer calls [`beginDelayedTransition()`][beginDelayedTransition], passing the scene root and a `Fade` transition as the arguments. The framework immediately calls the transition's [`captureStartValues()`][captureStartValues] method for each view in the scene and the transition records each view's visibility.
2. When the call returns, the developer sets each view in the scene to `INVISIBLE`.
3. On the next display frame, the framework calls the transition's [`captureEndValues()`][captureEndValues] method for each view in the scene and the transition records each view's (recently updated) visibility.
4. The framework calls the transition's [`createAnimator()`][createAnimator] method. The transition analyzes the start and end values of each view and notices a difference: _the views are `VISIBLE` in the start scene but `INVISIBLE` in the end scene._ The `Fade` transition uses this information to create and return an `AnimatorSet` that will fade each view's `alpha` property to `0f`.
5. The framework runs the returned `Animator`, causing all views to gradually fade out of the screen.

This simple example highlights two main advantages that the transition framework has to offer. First, `Transition`s abstract the idea of `Animator`s from the developer. As a result, `Transition`s can significantly reduce the amount of code you write in your activities and fragments: all the developer must do is set the views' start and end values and the `Transition` will automatically construct an animation based on the differences. Second, animations between scenes can be easily changed by using different `Transition` objects. **Video 1.1**, for example, illustrates the dramatically different effects we can achieve by replacing the `Fade` transition with a `Slide` or `Explode`. As we will see moving forward, these advantages will allow us to build complex Activity and Fragment transition animations with a relatively small amount of code. In the next few sections, we will see for ourselves how this can be done using Lollipop's new Activity and Fragment transition APIs.

### Activity & Fragment Transitions in Android Lollipop

As of Android 5.0, `Transition`s can now be used to perform elaborate animations when switching between different `Activity`s or `Fragment`s. Although Activity and Fragment animations could already be specified in previous platform versions using the [`Activity#overridePendingTransition()`][Activity#overridePendingTransition] and [`FragmentTransaction#setCustomAnimation()`][FragmentTransaction#setCustomAnimations] methods, they were limited in that they could only animate the entire Activity/Fragment container as a whole. The new Lollipop APIs take this a step further, making it possible to animate individual views as they enter or exit their containers and even allowing us to animate shared views from one Activity/Fragment container to the other.

Let's begin by discussing the terminology that will be used in this series of posts. Note that although the terminology below is defined in terms of Activity transitions, the exact same terminology will be used for Fragment transitions as well:

> Let `A` and `B` be activities and assume activity `A` starts activity `B`. We refer to `A` as the "_calling Activity_" (the activity that "calls" `startActivity()`) and `B` as the "_called Activity_".

The Activity transition APIs are built around the idea of _exit, enter, return, and reenter transitions_. In the context of activities `A` and `B` defined above, we can describe each as follows:

> Activity `A`'s _exit transition_ determines how views in `A` are animated when `A` starts `B`.
>
> Activity `B`'s _enter transition_ determines how views in `B` are animated when `A` starts `B`.
>
> Activity `B`'s _return transition_ determines how views in `B` are animated when `B` returns to `A`.
>
> Activity `A`'s _reenter transition_ determines how views in `A` are animated when `B` returns to `A`.

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure12" onclick="playPause('figure12')" poster="/assets/videos/posts/2014/12/04/news-opt.png" preload="none">
    <source src="/assets/videos/posts/2014/12/04/news-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2014/12/04/news-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2014/12/04/news-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 1.2</strong> - Content transitions and shared element transitions in action in the Google Play Newsstand app (as of v3.3). Click to play.</p>
  </div>
</div>

Lastly, the framework provides APIs for two types of Activity transitions&mdash;_content transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between Activities in unique ways:

> A _content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.
>
> A _shared element transition_ determines how an activity's _shared elements_ (also called _hero views_) are animated between two activities.

**Video 1.2** gives a nice illustration of content transitions and shared element transitions used in the Google Play Newsstand app. Although we can't be sure without looking at the Newsstand source code, my best guess is that the following transitions are used:

* The exit and reenter content transitions for activity `A` (the calling activity) are both `null`. We can tell because the non-shared views in `A` are not animated when the user exits and reenters the activity.<sup><a href="#footnote2" id="ref2">2</a></sup>
* The enter content transition for activity `B` (the called activity) uses a custom slide-in transition that shuffles the list items into place from the bottom of the screen.
* The return content transition for activity `B` is a `TransitionSet` that plays two child transitions in parallel: a `Slide(Gravity.TOP)` transition targeting the views in the top half of the activity and a `Slide(Gravity.BOTTOM)` transition targeting the views in the bottom half of the activity. The result is that the activity appears to "break in half" when the user clicks the back button and returns to activity `A`.
* The enter and return shared element transitions both use a `ChangeImageTransform`, causing the `ImageView` to be animated seamlessly between the two activities.

You've probably also noticed the cool circular reveal animation that plays under the shared element during the transition. We will cover how this can be done in a future blog post. For now, let's keep things simple and familiarize ourselves with the Activity and Fragment transition APIs.

### Introducing the Activity Transition API

Creating a basic Activity transition is relatively easy using the new Lollipop APIs. Summarized below are the steps you must take in order to implement one in your application. In the posts that follow, we will go through much more advanced use-cases and examples, but for now the next two sections will serve as a good introduction:

* Enable the new transition APIs by requesting the [`Window.FEATURE_ACTIVITY_TRANSITIONS`][FEATURE_ACTIVITY_TRANSITIONS] [`Window.FEATURE_CONTENT_TRANSITIONS`][FEATURE_CONTENT_TRANSITIONS] window features in your called and calling Activities, either programatically or in your theme's XML.
* Set [exit][setExitTransition] and [enter][setEnterTransition] content transitions for your calling and called activities respectively. Material-themed applications have their exit and enter content transitions set to `null` and [`Fade`][Fade] respectively by default. If the [reenter][setReenterTransition] or [return][setReturnTransition] transitions are not explicitly set, the activity's exit and enter content transitions respectively will be used in their place instead.
* Set [exit][setSharedElementExitTransition] and [enter][setSharedElementEnterTransition] shared element transitions for your calling and called activities respectively. Material-themed applications have their shared element exit and enter transitions set to [`@android:transition/move`][Move] by default. If the [reenter][setSharedElementReenterTransition] or [return][setSharedElementReturnTransition] transitions are not explicitly set, the activity's exit and enter shared element transitions respectively will be used in their place instead.
* To start an Activity transition with content transitions and shared elements, call the [`startActivity(Context, Bundle)`][startActivity] method and pass the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity, pairs).toBundle();
    ```

    where `pairs` is an array of `Pair<View, String>` objects listing the shared element views and names that you'd like to share between activities.<sup><a href="#footnote3" id="ref3">3</a></sup> Don't forget to give your shared elements unique transition names, either [programatically][setTransitionName] or in [XML][transitionName]. Otherwise, the transition will not work properly!
* To programatically trigger a return transition, call [`finishAfterTransition()`][finishAfterTransition] instead of `finish()`.
* By default, material-themed applications have their enter/return content transitions started a tiny bit before their exit/reenter content transitions complete, creating a small overlap that makes the overall effect more seamless and dramatic. If you wish to explicitly disable this behavior, you can do so by calling the [`setWindowAllowEnterTransitionOverlap()`][setWindowAllowEnterTransitionOverlap] and [`setWindowAllowReturnTransitionOverlap()`][setWindowAllowReturnTransitionOverlap] methods or by setting the corresponding attributes in your theme's XML.

### Introducing the Fragment Transition API

If you are working with Fragment transitions, the API is similar with a few small differences:

* Content [exit][Fragment#setExitTransition], [enter][Fragment#setEnterTransition], [reenter][Fragment#setReenterTransition], and [return][Fragment#setReturnTransition] transitions should be set by calling the corresponding methods in the `Fragment` class or as attributes in your Fragment's XML tag.
* Shared element [enter][Fragment#setSharedElementEnterTransition] and [return][Fragment#setSharedElementReturnTransition] transitions should be set by calling the corresponding methods in the `Fragment` class or as attributes in your Fragment's XML.
* Whereas Activity transitions are triggered by explicit calls to `startActivity()` and `finishAfterTransition()`, Fragment transitions are triggered automatically when a fragment is added, removed, attached, detached, shown, or hidden by a `FragmentTransaction`.
* Shared elements should be specified as part of the `FragmentTransaction` by calling the [`addSharedElement(View, String)`][addSharedElement] method before the transaction is committed.

### Conclusion

In this post, we have only given a brief introduction to the new Activitiy and Fragment transition APIs. However, as we will see in the next few posts having a solid understanding of the basics will significantly speed up the development process in the long-run, especially when it comes to writing custom `Transition`s. In the posts that follow, we will cover content transitions and shared element transitions in even more depth and will obtain an even greater understanding of how Activity and Fragment transitions work under-the-hood.

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> If you want to try the example out yourself, the XML layout code can be found [here][exampleXmlLayoutGist]. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> It might look like the views in `A` are fading in/out of the screen at first, but what you are really seeing is activity `B` fading in/out of the screen _on top of activity `A`_. The views in activity `A` are not actually animating during this time. You can adjust the duration of the background fade by calling [`setTransitionBackgroundFadeDuration()`][setTransitionBackgroundFadeDuration] on the called activity's `Window`. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>

<sup id="footnote3">3</sup> To start an Activity transition with content transitions _but no shared elements_, you can create the `Bundle` by calling `ActivityOptions.makeSceneTransitionAnimation(activity).toBundle()`. To disable content transitions and shared element transitions entirely, don't create a `Bundle` object at all&mdash;just pass `null` instead. <a href="#ref3" title="Jump to footnote 3.">&#8617;</a>

  [exampleXmlLayoutGist]: https://gist.github.com/alexjlockwood/a96781b876138c37e88e
  [setExitTransition]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [setEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [setReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [setReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)
  [setSharedElementExitTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [setSharedElementEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [setSharedElementReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [setSharedElementReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)
  [Fragment#setExitTransition]: https://developer.android.com/reference/android/app/Fragment.html#setExitTransition(android.transition.Transition)
  [Fragment#setEnterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setEnterTransition(android.transition.Transition)
  [Fragment#setReturnTransition]: https://developer.android.com/reference/android/app/Fragment.html#setReturnTransition(android.transition.Transition)
  [Fragment#setReenterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setReenterTransition(android.transition.Transition)
  [Fragment#setSharedElementExitTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementExitTransition(android.transition.Transition)
  [Fragment#setSharedElementEnterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementEnterTransition(android.transition.Transition)
  [Fragment#setSharedElementReturnTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementReturnTransition(android.transition.Transition)
  [Fragment#setSharedElementReenterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementReenterTransition(android.transition.Transition)
  [addSharedElement]: https://developer.android.com/reference/android/app/FragmentTransaction.html#addSharedElement(android.view.View,%20java.lang.String)
  [Transition]: https://developer.android.com/reference/android/transition/Transition.html
  [Fade]: https://developer.android.com/reference/android/transition/Fade.html
  [Move]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/res/res/transition/move.xml
  [FEATURE_ACTIVITY_TRANSITIONS]: http://developer.android.com/reference/android/view/Window.html#FEATURE_ACTIVITY_TRANSITIONS
  [FEATURE_CONTENT_TRANSITIONS]: http://developer.android.com/reference/android/view/Window.html#FEATURE_CONTENT_TRANSITIONS
  [transitionName]: https://developer.android.com/reference/android/view/View.html#attr_android:transitionName
  [setTransitionName]: https://developer.android.com/reference/android/view/View.html#setTransitionName(java.lang.String)

  [Activity#overridePendingTransition]: http://developer.android.com/reference/android/app/Activity.html#overridePendingTransition(int,%20int)
  [FragmentTransaction#setCustomAnimations]: http://developer.android.com/reference/android/app/FragmentTransaction.html#setCustomAnimations(int,%20int,%20int,%20int)

  [setWindowAllowEnterTransitionOverlap]: http://developer.android.com/reference/android/view/Window.html#setAllowEnterTransitionOverlap(boolean)
  [setWindowAllowReturnTransitionOverlap]: http://developer.android.com/reference/android/view/Window.html#setAllowReturnTransitionOverlap(boolean)

  [beginDelayedTransition]: https://developer.android.com/reference/android/transition/TransitionManager.html#beginDelayedTransition(android.view.ViewGroup,%20android.transition.Transition)
  [captureStartValues]: https://developer.android.com/reference/android/transition/Transition.html#captureStartValues(android.transition.TransitionValues)
  [captureEndValues]: https://developer.android.com/reference/android/transition/Transition.html#captureEndValues(android.transition.TransitionValues)
  [createAnimator]: https://developer.android.com/reference/android/transition/Transition.html#createAnimator(android.view.ViewGroup,%20android.transition.TransitionValues,%20android.transition.TransitionValues)
  [finishAfterTransition]: https://developer.android.com/reference/android/app/Activity.html#finishAfterTransition()

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3]: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3.html

  [customizeActivityTransitions]: https://developer.android.com/training/material/animations.html#Transitions
  [startActivity]: http://developer.android.com/reference/android/app/Activity.html#startActivity%28android.content.Intent,%20android.os.Bundle%29

  [setTransitionBackgroundFadeDuration]: http://developer.android.com/reference/android/view/Window.html#setTransitionBackgroundFadeDuration(long)
