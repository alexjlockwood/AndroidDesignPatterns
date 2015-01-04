---
layout: post
title: 'Shared Element Transitions In-Depth (part 3a)'
date: 2014-12-16
permalink: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3a.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

This post will give an in-depth analysis of _shared element transitions_ and their role in the Activity and Fragment Transitions API. This is the third of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3a:** [Shared Element Transitions In-Depth][part3a]
* **Part 3b:** [Shared Element Transitions In-Depth (continued)][part3b]
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

We begin by summarizing what we learned about shared element transitions in [part 1][part1] and illustrating how they can be used to achieve smooth, seamless animations in Android Lollipop.

### What is a Shared Element Transition?

<!--morestart-->

A _shared element transition_ determines how the shared element views&mdash;also called _hero views_&mdash;are animated from one Activity/Fragment to another during a scene transition. For the most part, the resulting animation is determined by the called Activity or Fragment's enter and return shared element transitions,<sup><a href="#footnote?" id="ref?">?</a></sup> each of which can be specified using the following [`Window`][Window] and [`Fragment`][Fragment] methods:

* `setSharedElementEnterTransition()` - `B`'s enter shared element transition animates shared views from their starting positions in `A` to their final positions in `B`.
* `setSharedElementReturnTransition()` - `B`'s return shared element transition animates shared views from their starting positions in `B` to their final positions in `A`.

<!--more-->

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure31" onclick="playPause('figure31')" poster="/assets/videos/posts/2014/12/16/music-opt.png" preload="none">
    <source src="/assets/videos/posts/2014/12/16/music-opt.mp4" type="video/mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 3.1</strong> - Shared element transitions in action in the Google Play Music app (as of v5.6). Click to play.</p>
  </div>
</div>

**Video 3.1** illustrates how shared element transitions are used in the Google Play Music app. The transition consists of two shared elements: an `ImageView` and its parent `CardView`. During the transition, the `ImageView` seamlessly animates between the two activities, while the `CardView` gradually expands/contracts into place.

Whereas [part 1][part1] only briefly introduced the subject, this blog post aims to give a much more in-depth analysis of shared element transitions. How are shared element transitions triggered under-the-hood? Which types of `Transition` objects can be used? (**TODO: other questions?**) In the next couple sections, we'll tackle these questions one-by-one.

### Shared Element Transitions Under-The-Hood

Recall from the previous two posts that a `Transition` has two main responsibilities: capturing the start and end state of its target views and creating an `Animator` that will animate the views between the two states. Shared element transitions operate no differently: before a shared element transition can create its animation, it must first capture each shared element's start and end state&mdash;namely its position, size, and appearance. To ensure the shared element transition captures this state, the framework directly modifies each shared element's view properties so that at the beginning of the transition it appears exactly as it did in `A` and at the end of the transition it appears exactly as it should in `B`.

As an example, let's walk through the sequence of events that occurs when Activity `A` starts Activity `B`, causing `B`'s enter shared element transition to be performed:<sup><a href="#footnote?" id="ref?">?</a></sup>

1. Activity `B` is started with a translucent window and transparent background, on top of Activity `A` yet initially invisible to the user.
2. The framework repositions each shared element in `B` to match its exact size and location in `A`.
3. `B`'s shared element enter transition captures the start state of all the shared elements in `B`.
4. The framework repositions each shared element in `B` to match its desired final size and location in `B`.
5. On the next display frame, `B`'s shared element enter transition captures the end state of all the shared elements in `B`.
6. `B`'s shared element enter transition compares the start and end state of its shared element views and creates an `Animator` based on the differences.
7. Activity `A` hides the original shared elements in its view hierarchy and the transition begins. As the shared elements in `B`'s view hierarchy animate from their starting positions into place, `B`'s window background gradually fades in on top of `A` until the window is opaque.

Compared to our discussion of content transitions in [part 2][part2], the inner-workings of the shared element framework are a bit more complex. Before you get too overwhelmed with the onslaught of information presented above, let's discuss some of the major differences.

First, whereas content transitions are governed by changes to each transitioning view's visibility, **shared element transitions are governed by differences in each shared element view's position, size, and appearance**. There are many ways in which a shared element's start and end state could differ, so as of API 21 the framework supports several different transition types that can be used:

* [`ChangeBounds`][ChangeBounds] - Animates differences in a view's layout bounds. This transition is widely used since most shared elements have different positions and sizes in either the calling or called Activity/Fragment.
* [`ChangeTransform`][ChangeTransform] - Animates differences in a view's scale and/or rotation.
* [`ChangeClipBounds`][ChangeClipBounds] - Animates differences in a view's clip bounds.
* [`ChangeImageTransform`][ChangeImageTransform] - Similar to `ChangeBounds`, except able to efficiently animate an `ImageView`'s scale and size throughout the duration of the transition.

As discussed in [part 1][part1], the default shared element transition type set by the framework is [`@android:transition/move`][Move], a `TransitionSet` combining all four transitions above. Unless you plan on creating more complex, custom shared element transition, this default value will cover most cases and will work fine in most cases.

Second, **shared element view instances are not actually "shared" across Activities/Fragments**. Although it might look like `A`'s original shared element view is being animated throughout the duration of the transition, most of what you see is a brand new view instance being animated in `B`. When activity `A` starts Activity `B`, the framework collects all of the relevant state about the shared elements in `A` and passes that information along to Activity `B`. Activity `B` then takes this information and uses it to initialize its shared elements views to match their exact position, size, and state in `A`. The framework utilizes a couple of tricks to get the transition to appear properly. First, it hides `A`'s shared elements so that the remnants of the old shared elements do not still show once the new shared elements in `B` begin to animate into place. Second, other than its animating shared elements, `B` is initially invisible to the user and is only gradually faded into sight throughout the duration of the transition.

Finally, although not immediately obvious, **shared elements are by default drawn on top of the view hierarchy in a [`ViewOverlay`][ViewOverlay]**. The `ViewOverlay` class was introduced in API 18 as a way to easily draw custom graphics on top of a `View`. Drawing in a `ViewOverlay` makes it impossible for non-shared element views to accidentally draw on top of the views that are being shared across Activities. This default behavior can be disabled in your theme's XML or programatically by calling [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay]. (**TODO: talk about the potential side effects of _using_ the view overlay too! For example, how can we avoid displaying shared elements on top of the System UI?**) Doing so may have unintended side effects, however, as is discussed in [this Google+ post][GooglePlusSystemUI]. (**TODO: integrate parts of Chet's [blog post][ViewOverlayBlogPost], especially the last paragraph about the parent view group clipping views, into this paragraph?**)

### Conclusion

Overall, this post presented **(three?)** important points:

1. asdf
2. asdf
3. asdf

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote?">?</sup> Exit and reenter shared element transitions can also be specified using the `setSharedElementExitTransition()` and `setSharedElementReenterTransition()` methods, although doing so is rarely necessary. For an example illustrating one possible use case, check out [this blog post][SharedElementExitReenterBlogPost]. Note that exit and reenter shared element transitions are only available in the Activity Transitions API. For an explanation why they are not available for Fragment Transitions, see George Mount's comments in [this StackOverflow post][StackOverflowExitReenterTransitions]. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

<sup id="footnote?">?</sup> **TODO: footnote that talks about the shared element exit transition in-depth... i.e. in between step 1 and 2 the framework will run the exit shared element transition. Also say that the example covers the enter shared element transition and that return shared element transitions behave similarly except in reverse.** <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

  [setSharedElementExitTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [setSharedElementEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [setSharedElementReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [setSharedElementReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)
  [Fragment#setSharedElementExitTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementExitTransition(android.transition.Transition)
  [Fragment#setSharedElementEnterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementEnterTransition(android.transition.Transition)
  [Fragment#setSharedElementReturnTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementReturnTransition(android.transition.Transition)
  [Fragment#setSharedElementReenterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setSharedElementReenterTransition(android.transition.Transition)
  [Move]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/res/res/transition/move.xml
  [postponeEnterTransition]: https://developer.android.com/reference/android/app/Activity.html#postponeEnterTransition()
  [startPostponedEnterTransition]: https://developer.android.com/reference/android/app/Activity.html#startPostponedEnterTransition()
  [setSharedElementsUseOverlay]: https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)
  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html

  [Window]: http://developer.android.com/reference/android/view/Window.html
  [Fragment]: http://developer.android.com/reference/android/app/Fragment.html
  [MaterialDesignMeaningfulTransitions]: http://www.google.com/design/spec/animation/meaningful-transitions.html
  [SharedElementExitReenterBlogPost]: https://halfthought.wordpress.com/2014/12/08/what-are-all-these-dang-transitions/
  [StackOverflowExitReenterTransitions]: http://stackoverflow.com/q/27346020/844882

  [FragmentManager#executePendingTransactions]: https://developer.android.com/reference/android/app/FragmentManager.html#executePendingTransactions()
  [GooglePlusPostponeEnterTransition]: https://plus.google.com/+AlexLockwood/posts/FJsp1N9XNLS
  [GooglePlusSystemUI]: https://plus.google.com/+AlexLockwood/posts/RPtwZ5nNebb
  [PostponeEnterTransitionForFragments]: http://stackoverflow.com/q/26977303/844882
  [PostponeEnterTransitionForFragmentsG+]: https://plus.google.com/+AlexLockwood/posts/3DxHT42rmmY

  [ChangeBounds]: https://developer.android.com/reference/android/transition/ChangeBounds.html
  [ChangeTransform]: https://developer.android.com/reference/android/transition/ChangeTransform.html
  [ChangeClipBounds]: https://developer.android.com/reference/android/transition/ChangeClipBounds.html
  [ChangeImageTransform]: https://developer.android.com/reference/android/transition/ChangeImageTransform.html

  [ViewOverlay]: https://developer.android.com/reference/android/view/ViewOverlay.html
  [ViewOverlayBlogPost]: http://graphics-geek.blogspot.com/2013/07/new-in-android-43-viewoverlay.html

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3b.html

