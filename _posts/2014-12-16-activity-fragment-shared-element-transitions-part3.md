---
layout: post
title: 'Shared Element Transitions In-Depth (part 3)'
date: 2014-12-16
permalink: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

This post will give an in-depth analysis of _shared element transitions_ and their role in the Activity and Fragment Transitions API. This is the third of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3:** [Shared Element Transitions In-Depth][part3]
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

We begin by summarizing what we learned about content transitions in [part 1][part1] and illustrating how they can be used to achieve smooth, seamless animations in Android Lollipop.

### What is a Shared Element Transition?

<!--morestart-->

A _shared element transition_ determines how the shared views&mdash;also called _hero views_&mdash;are animated between scenes during an Activity or Fragment transition. In accordance with Google's new [Material Design][MaterialDesignMeaningfulTransitions] language, shared elements add visual continuity as the user switches between application screens, allowing the user to clearly understand where their attention should be focuseda throughout the duration of the transition. Beginning with Android Lollipop, shared element transitions can be set programatically by calling the following [`Window`][Window] and [`Fragment`][Fragment] methods:<sup><a href="#footnote1" id="ref1">1</a></sup>

* `setSharedElementEnterTransition()` - `B`'s shared element transition animates shared views from their starting positions in `A` to their resting positions in `B`.
* `setSharedElementReturnTransition()` - `B`'s shared element transition animates shared views from their starting positions in `B` to their resting positions in `A`.

<!--more-->

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure31" onclick="playPause('figure31')" poster="/assets/videos/posts/2014/12/16/music-opt.png" preload="none">
    <source src="/assets/videos/posts/2014/12/16/music-opt.mp4" type="video/mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 3.1</strong> - Shared element transitions in action in the Google Play Music app (as of v5.6). Click to play.</p>
  </div>
</div>

As an example, **Video 3.1** illustrates how shared element transitions are used in the Google Play Music app. The transition consists of two shared elements: an `ImageView` and its parent `CardView`. During the transition, the `ImageView` seamlessly animates between its two positions while its parent `CardView` expands and gradually fills the called activity's white background.

So far our analysis of shared element transitions has only scratched the surface; several important questions still remain. How are shared element transitions triggered under-the-hood? Which types of `Transition` objects can be used? (**TODO: more questions**) In the next couple sections, we'll tackle these questions one-by-one.

### Which types of `Transition`s can be used?

There is no definitive rule about which `Transition` types can be used, as long as they are able to properly capture and animate the values that will be changed during the course of the transition. For example, if the shared element has a different size or position in either activity, then a `ChangeBounds` transition could be used. If that view is also an `ImageView`, then a `ChangeImageTransform` transition should be used. If both (or more) of these apply, a `TransitionSet` running all of the chosen transitions in parallel could be used to ensure that all of the properties are animated as the shared element moves into place.
As we did with content transitions, let's investigate what happens under-the-hood when an Activity Transition is occurs and a shared element transition is about to be run:

1. `A` calls `startActivity()`.
    * `A`'s shared element exit transition captures start values for the shared elements in `A`.
    * The shared elements in `A` are modified to match their final resting position in `A`.
    * On the next animation frame, `A`'s exit transition captures end values for all of the shared elements in `A`.
    * `A`'s shared element exit transition compares the start and end values of its shared element views and creates an `Animator` based on the differences. The `Animator` is run and the shared elements animate into place.
2. Activity `B` is started and the shared elements are positioned in `B` to match their end values in `A`.
    * `B`'s shared element enter transition captures start values for all of the shared elements in `B`.
    * All of the shared elements in `B` are repositioned to match their end values.
    * On the next animation frame, `B`'s shared element enter transition captures end values for all of the shared elements in `B`.
    * `B`'s shared element enter transition compares the start and end values of its shared element views and creates an `Animator` based on the differences. The `Animator` is run and the shared elements animate into place.

As we can see, whereas content transitions are governed by changes to view visibility, shared element transitions reacts to changes made to a view's location and size. As a result, the `ChangeBounds`, `ChangeTransform`, `ChangeClipBounds`, and `ChangeImageTransform` transitions are usually good options to use; in fact, you will probably find that sticking with the default [`@android:transition/move`][Move] transition will work fine in most cases.

### How do shared element transitions work? Are `View` instances actually "shared" across activities?

Shared elements are not actually "shared". When you look at a shared element transition, you might think that what you are seeing is a single `View` object animating out of its activity and into its resting location within the new activity. _This is not the case._ What actually happens is the called Activity starts out translucent. One of the first things the framework does is it adds the shared elements to the translucent Activity and repositions them to match the view’s initial position inside the calling Activity and sets the view inside the calling Activity to `INVISIBLE`. When the transition begins, the shared element will appear to transition seamlessly from one Activity to another (but really what happens is the shared element is simply animating inside the called Activity, which gradually animates from translucent to fully opaque).

By default, shared elements are drawn on top of the view hierarchy in a `ViewOverlay`. This default behavior ensures that the shared elements will always be the central focus of the Activity transition, as it makes it impossible for non-shared elements&mdash;in both the called and calling Activity's view hierarchies&mdash;to accidentally draw on top of the views that are being shared across Activities. This default behavior can be disabled in your theme's XML or programatically by calling [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay]. **TODO: also discuss the potential side-effects of disabling the overlay? Link to G+ post about covering up the system UI?**


### My shared elements jump or disappear when the transition starts. What do I do?

While there are several reasons why a transition might glitch, the most common reason is that your transition started before the shared element's start values were properly set. The activity's view hierarchy must finish its layout before the transition begins. If the transition begins before then, the transition will not have all of the information it needs to perform the animation (i.e. the start and/or end values will be missing), and the transition will appear to break. To get around this, a common pattern will be to postpone the activity’s transition by calling [`postponeEnterTransition()`][postponeEnterTransition]. When you know for certain that the activity has finished its layout, simply call [`startPostponedEnterTransition()`][startPostponedEnterTransition]. A good place to call this method is in an `onPreDraw` listener. For example,

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

**TODO: talk about how postponed transitions are helpful when waiting for data from a `Loader`, `AsyncTask`, etc.?**

**TODO: talk about how fragment transitions can be postponed?**

### How can I further customize shared element transitions?

You can further customize your shared element transitions by setting a [`SharedElementCallback`][SharedElementCallback]. Understanding the SharedElementCallback class will be important if you want to implement custom Transitions that are more complicated than simply moving an image from one location to another. In particular, the following three callback methods are very important to understand when writing more complex shared element transitions:

* `onMapSharedElements()` lets you adjust the mapping of shared element names to Views. **TODO: more detail.**
* `onSharedElementStart()` and `onSharedElementEnd()` let you adjust view properties in your layout immediately before the transitions capture their start and end values respectively. **TODO: more detail.**

### Recap

**TODO: recap**

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> For Activity Transitions, additional animations may also be specified using the `setSharedElementExitTransition()` and `setSharedElementReenterTransition()` methods. An example illustrating when it might make sense to specify an exit or reenter shared element transition is given in [this blog post][SharedElementExitReenterBlogPost]. For an explanation of why these two methods are not available for Fragment transitions, see the comments on George Mount's StackOverflow answer [here][StackOverflowExitReenterTransitions]. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

  [setSharedElementExitTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [setSharedElementEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [setSharedElementReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [setSharedElementReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)
  [Fragment#setSharedElementExitTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementExitTransition(android.transition.Transition)
  [Fragment#setSharedElementEnterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementEnterTransition(android.transition.Transition)
  [Fragment#setSharedElementReturnTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementReturnTransition(android.transition.Transition)
  [Fragment#setSharedElementReenterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementReenterTransition(android.transition.Transition)
  [Move]: https://android.googlesource.com/platform/frameworks/base/+/lollipop-release/core/res/res/transition/move.xml
  [postponeEnterTransition]: https://developer.android.com/reference/android/app/Activity.html#postponeEnterTransition()
  [startPostponedEnterTransition]: https://developer.android.com/reference/android/app/Activity.html#startPostponedEnterTransition()
  [setSharedElementsUseOverlay]: https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)
  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html

  [Window]: http://developer.android.com/reference/android/view/Window.html
  [Fragment]: http://developer.android.com/reference/android/app/Fragment.html
  [MaterialDesignMeaningfulTransitions]: http://www.google.com/design/spec/animation/meaningful-transitions.html
  [SharedElementExitReenterBlogPost]: https://halfthought.wordpress.com/2014/12/08/what-are-all-these-dang-transitions/
  [StackOverflowExitReenterTransitions]: http://stackoverflow.com/q/27346020/844882


  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3]: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3.html

