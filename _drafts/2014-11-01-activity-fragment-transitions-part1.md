---
layout: post
title: 'Getting Started with Activity Transitions (part 1)'
date: 2014-11-01
permalink: /2014/11/activity-transitions-getting-started-part1.html
---

This post gives a brief overview of the new Activity Transition APIs added in Android 5.0 Lollipop. This is the first of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity Transitions][part1]
* **Part 2:** {% comment %}[{% endcomment %}
              Window Content Transitions In-Depth (_coming soon!_)
              {% comment %}][part2]{% endcomment %}
* **Part 3:** {% comment %}[{% endcomment %}
              Shared Element Transitions In-Depth (_coming soon!_)
              {% comment %}][part3]{% endcomment %}

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't worry: I'll point out the significant differences between the two as they are encountered in the posts!

Before we get ahead of ourselves, let's start out by answering the following basic question: what is a `Transition`?

### What is a `Transition`?

<!--morestart-->

Activity and Fragment transitions in Lollipop are built on top of a relatively new feature in Android called `Transition`s. Introduced in KitKat, the transition framework provides a convenient API for animating between different UI states in an application. The framework is built around two key concepts: _scenes_ and _transitions_. A scene defines a given state of an application's UI, whereas a transition defines the animated change between two scenes.

When a scene change occurs, a `Transition` has two main responsibilities:

1. Capturing the start and end state of the views in each scene, and
2. Creating an `Animator` based on the differences that will animate the views from one scene to another.

<!--more-->

As an example, consider an `Activity` which wants to fade its views either in or out whenever the user taps the screen.<sup><a href="#footnote1" id="ref1">1</a></sup> We can achieve this effect with only a few lines using Android's transition framework:

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

Let's walk through the steps involved when the user taps the screen for the first time. We will assume each view is initially `VISIBLE` on screen&mdash;that is, in the starting scene all of the views start out `VISIBLE` and in the ending scene all of the views end up `INVISIBLE`:

<div style="width:290px;margin-left:35px;float:right">
  <div class="framed-nexus6-port">
  <video id="figure11" onclick="playPause('figure11')">
    <source src="/assets/videos/posts/2014/11/01/trivial-opt.mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 1.1</strong> - Running the example transition above using a <code>Fade</code>, <code>Slide</code>, and <code>Explode</code>. Click to play.</p>
  </div>
</div>

1. A click is detected and the developer calls `beginDelayedTransition()`, passing the scene root and a `Fade` transition as the arguments. The framework immediately calls the transition's `captureStartValues()` method for each view in the scene and the transition records each view's visibility in the `TransitionValues` argument.
2. After `beginDelayedTransition()` returns, the developer sets each view in the scene from `VISIBLE` to `INVISIBLE`.
3. On the next animation frame, the framework calls the transition's `captureEndValues()` method for each view in the scene and the transition records each view's (recently updated) visibility in the `TransitionValues` argument.
4. The framework calls the transition's `createAnimator()` method. The transition analyzes the start and end values of each view and notices a difference: the views are `VISIBLE` in the start scene but `INVISIBLE` in the end scene. The `Fade` transition uses this information to create an `Animator` that will fade each view's `alpha` property to `0f`.
5. The framework runs the `Animator` and all views gradually fade out of the screen.

Overall, the transitions framework offers two main advantages. First, `Transition`s abstract the idea of `Animator`s from the developer, and as a result significantly reduces the amount of code you will need to write in your activities and fragments. All the developer must do is ensure the start and end values for each view are properly set and the `Transition` will do the rest. Second, animations between scenes can be easily changed simply by using a different `Transition` object. For example, **Figure 1.1** illustrates the dramatically different effects we can achieve by simply replacing our `Fade` transition with a `Slide` or `Explode`. As we will see in the rest of this post, these two advantages make it relatively easy to implement custom Activity Transitions in Android Lollipop (**TODO: better concluding sentence... i.e. these two advantages make transitions prime candidates for powering the activity transition APIs**).

### Introducing Activity Transitions in Android 5.0

Beginning with Lollipop, `Transition`s can be used to orchestrate elaborate animations between `Activity`s. (**TODO: one more sentence explaining what Activity Transitions allow us to do that wasn't possible in earlier platforms**) Before we start getting into the code, however, it will be helpful to discuss the terminology that is used in the rest of this post:

> Let `A` and `B` be activities and assume activity `A` starts activity `B`. We refer to `A` as the "_calling Activity_" (the activity that "calls" `startActivity()`) and `B` as the "_called Activity_".

The Activity Transition APIs are built around the idea of _exit, enter, return, and reenter transitions_. In the context of activities `A` and `B` defined above, we describe the role of each as follows:

> Activity `A`'s _exit transition_ determines how views in `A` are animated when `A` starts `B`.
>
> Activity `B`'s _enter transition_ determines how views in `B` are animated when `A` starts `B`.
>
> Activity `B`'s _return transition_ determines how views in `B` are animated when `B` returns to `A`.
>
> Activity `A`'s _reenter transition_ determines how views in `A` are animated when `B` returns to `A`.

<div style="width:290px;margin-right:35px;float:right">
  <div class="framed-nexus6-port">
  <video id="figure12" onclick="playPause('figure12')">
    <source src="/assets/videos/posts/2014/11/01/news-opt.mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 1.2</strong> - Content transitions and shared element transitions in action in the Google Play Newsstand app (as of v3.3). Click to play.</p>
  </div>
</div>

Lastly, the framework provides APIs for two types of Activity Transitions&mdash;_content transitions_ and _shared element transitions_&mdash;each of which allow us to customize the animations between activities in unique ways:

> A _content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.
>
> A _shared element transition_ determines how an activity's _shared elements_ (also called _hero views_) are animated between two activities.

**Figure 1.2** gives a nice illustration of content transitions and shared element transitions used in the Google Play Newsstand app. Although we can't be sure without looking at the Newsstand source code, my best guess is that the transitions are set as follows:

* The exit and reenter content transitions for activity `A` (the calling activity) are both `null`. We can tell because the views in `A` are not animated when the user exits or reenters the activity. 
* The enter content transition for activity `B` (the called activity) uses a custom slide-in transition that shuffles the list items into view from the bottom of the screen.
* The return content transition for activity `B` is a `TransitionSet` that plays two child transitions that play in parallel: a `Slide(Gravity.TOP)` transition targeting the top half of the activity and a `Slide(Gravity.BOTTOM)` transition targeting the bottom half of the activity. The result is that the activity appears to "break in half" when the user clicks the back button and returns to activity `A`.
* The enter and return shared element transitions both use a simple `ChangeImageTransform`, causing the magazine's cover `ImageView` to be animated seamlessly across the two activities.

You've also probably noticed the cool circular reveal animation that plays under the shared element during the transition. We will cover how this can be done in a future blog post. For now, let's keep things simple and first familiarize ourselves with the Activity Transitions API.

### Getting Started with the Activity Transitions API

Summarized below are the simple steps required to use Activity Transitions in your application:

* Enable content transitions for both the calling and called activities by requesting the [`Window.FEATURE_CONTENT_TRANSITIONS`][FEATURE_CONTENT_TRANSITIONS] window feature, either programatically or in your theme's XML.
* Specify [exit][setExitTransition] and [enter][setEnterTransition] content transitions for your calling and called activities respectively. Material-themed applications have their content exit and enter transitions set to `null` and [`Fade`][Fade] respectively by default. [Reenter][setReenterTransition] and [return][setReturnTransition] transitions default to the activity's exit and enter content transitions respectively if they are not explicitly set.
* Specify [exit][setSharedElementExitTransition] and [enter][setSharedElementEnterTransition] shared element transitions for your calling and called activities respectively. Material-themed applications have their shared element exit and enter transitions set to [`@android:transition/move`][Move] by default. [Reenter][setSharedElementReenterTransition] and [return][setSharedElementReturnTransition] transitions default to the activity's exit and enter shared element transitions respectively if they are not explicitly set.
* To start an Activity Transition with no content transitions and no shared elements, call the `startActivity(Context, Bundle)` method, passing `null` as the second argument.
* To start an Activity Transition with content transitions but no shared elements, call the `startActivity(Context, Bundle)` method, passing the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity).toBundle();
    ```
* To start an Activity Transition with content transitions and shared elements, call the `startActivity(Context, Bundle)` method, passing the following `Bundle` as the second argument:

    ```java
    ActivityOptions.makeSceneTransitionAnimation(activity, pairs).toBundle();
    ```
where `pairs` is an array of `Pair<View, String>` objects listing the shared element views and names that you'd like to share between activities. Don't forget to give your shared elements unique transition names either [programatically][setTransitionName] or in [XML][transitionName]. Otherwise, the transition will likely break!
* **TODO: briefly talk about enter/exit transition overlap and the default values**

### Getting Started with the Fragment Transitions API

If you are working with Fragment Transitions instead, the API is similar with a couple of differences:

* Content [exit][Fragment#setExitTransition], [enter][Fragment#setEnterTransition], [reenter][Fragment#setReenterTransition], and [return][Fragment#setReturnTransition] transitions should be set by calling the corresponding methods in the `Fragment` class or as attributes in your Fragment's XML.
* Shared element [exit][Fragment#setSharedElementExitTransition], [enter][Fragment#setSharedElementEnterTransition], [reenter][Fragment#setSharedElementReenterTransition], and [return][Fragment#setSharedElementReturnTransition] transitions should also be set by calling the corresponding methods in the `Fragment` class or as attributes in your Fragment's XML.
* Whereas Activity Transitions are triggered by a call to `startActivity()`, Fragment Transitions are run automatically when a fragment is added, removed, attached, detached, shown, or hidden with similar effect.
* Shared elements should be specified as part of the `FragmentTransaction` by calling the [`addSharedElement(View, String)`][addSharedElement] method.

### Conclusion

**TODO: recap** In the next two posts, we will take a look at content transitions and shared element transitions in-depth. Don't forget to +1 this post blah blah blah.

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> The layout XML code that was used for this example can be found [here][exampleXmlLayoutGist]. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

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
  [Fade]: https://developer.android.com/reference/android/transition/Fade.html
  [Move]: https://android.googlesource.com/platform/frameworks/base/+/lollipop-release/core/res/res/transition/move.xml
  [FEATURE_CONTENT_TRANSITIONS]: http://developer.android.com/reference/android/view/Window.html#FEATURE_CONTENT_TRANSITIONS
  [transitionName]: https://developer.android.com/reference/android/view/View.html#attr_android:transitionName
  [setTransitionName]: https://developer.android.com/reference/android/view/View.html#setTransitionName(java.lang.String)

  [part1]: /2014/11/activity-transitions-getting-started-part1.html
  [part2]: /2014/11/content-transitions-in-depth-part2.html
  [part3]: /2014/11/shared-element-transitions-in-depth-part3.html
