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
* **Part 3b:** Shared Element Transitions In Practice (_coming soon!_)
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

We begin by summarizing what we learned about shared element transitions in [part 1][part1] and illustrating how they can be used to achieve smooth, seamless animations in Android Lollipop.

### What is a Shared Element Transition?

<!--morestart-->

A _shared element transition_ determines how shared element views&mdash;also called _hero views_&mdash;are animated from one Activity/Fragment to another during a scene transition. Shared elements are animated by the called Activity or Fragment's enter and return shared element transitions,<sup><a href="#footnote?" id="ref?">?</a></sup> each of which can be specified using the following [`Window`][Window] and [`Fragment`][Fragment] methods:

* `setSharedElementEnterTransition()` - `B`'s enter shared element transition animates shared element views from their starting positions in `A` to their final positions in `B`.
* `setSharedElementReturnTransition()` - `B`'s return shared element transition animates shared element views from their starting positions in `B` to their final positions in `A`.

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

Whereas [part 1][part1] only briefly introduced the subject, this blog post aims to give a much more in-depth analysis of shared element transitions. How are shared element transitions triggered under-the-hood? Which types of `Transition` objects can be used? How and where are shared element views drawn when switching between Activities/Fragments? In the next couple sections, we'll tackle these questions one-by-one.

### Shared Element Transitions Under-The-Hood

Recall from the previous two posts that a `Transition` has two main responsibilities: capturing the start and end state of its target views and creating an `Animator` that will animate the views between the two states. Shared element transitions operate no differently: before a shared element transition can create its animation, it must first capture each shared element's start and end state&mdash;namely its position, size, and appearance in both the calling and called Activities/Fragments. With this information, the transition can determine how each shared element view should animate into place throughout the duration of the animation.

Similar to how [content transitions operate under-the-hood][part2], the framework feeds the shared element transition this state information by directly modifying each shared element's view properties at runtime. More specifically, when Activity `A` starts Activity `B` the following sequence of events occurs:<sup><a href="#footnote?" id="ref?">?</a></sup>

1. Activity `A` calls `startActivity()` and Activity `B` is created with an initially translucent window and transparent window background color.
2. The framework repositions each shared element view in `B` to match its exact size and location in `A`. Shortly after, `B`'s enter transition captures the start state of all the shared elements in `B`.
3. The framework repositions each shared element view in `B` to match its exact size and location in `B`. Shortly after, `B`'s enter transition captures the end state of all the shared elements in `B`.
4. `B`'s enter transition compares the start and end state of its shared element views and creates an `Animator` based on the differences.
5. The framework instructs `A` to hide its shared element views from sight and the resulting `Animator` is run. As `B`'s shared element views animate into place, `B`'s window background gradually fades in on top `A` until `B` is entirely opaque and the transition is complete.

Whereas content transitions are governed by changes to each transitioning view's visibility, **shared element transitions are governed by changes to each shared element view's position, size, and appearance**. As of API 21, the framework provides several different `Transition` types that can be used to customize how shared elements are animated:

* [`ChangeBounds`][ChangeBounds] - Captures the _layout bounds_ of shared element views and animates the differences. This transition is frequently used, as most shared elements will have different positions and/or sizes inside the called Activity/Fragment.
* [`ChangeTransform`][ChangeTransform] - Captures the _scale and rotation_ of shared element views and animates the differences.<sup><a href="#footnote?" id="ref?">?</a></sup>
* [`ChangeClipBounds`][ChangeClipBounds] - Captures the [_clip bounds_][View#setClipBounds()] of shared element views and animates the differences
* [`ChangeImageTransform`][ChangeImageTransform] - Captures the _transform matrices_ of shared element `ImageView`s and animates the differences. In combination with `ChangeBounds`, this transition allows `ImageView`s that change in size, shape, and/or [ImageView.ScaleType][ImageView.ScaleType] to animate smoothly and efficiently.
* [`@android:transition/move`][Move] - A `TransitionSet` that plays all four transition types above in parallel. As discussed in [part 1][part1], if an enter/return shared element transition is not explicitly specified, the framework will run this transition by default.

It is also important to understand that **shared element view instances are not actually "shared" across Activities/Fragments**: as we saw in the example above, almost everything the user sees during the transition is being drawn in Activity `B`. Instead of actually transferring the shared element instance from `A` to `B` (which would be difficult, if not impossible, to implement for Activity Transitions), the framework uses a different means of achieving the same visual effect. When `A` starts `B`, the framework collects all of the relevant state information about the shared elements in `A` and passes it to `B`. `B` takes this state information and uses it to initialize the start state of its shared elements views, each of which will initially match the exact position, size, and appearance they had in `A`. When the transition begins, everything in `B` (including its window decorations and background) is initially invisible to the user. As the transition progresses, however, the framework gradually fades in `B`'s Activity window until the shared elements finish their animation and `A` is no longer visible behind `B`.

### Using the Shared Element Overlay

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure32" onclick="playPause('figure32')" poster="/assets/videos/posts/2014/12/16/overlay-opt.png" preload="none">
    <source src="/assets/videos/posts/2014/12/16/overlay-opt.mp4" type="video/mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 3.2</strong> - A simple app that illustrates a potential bug that can result when the shared element overlay is disabled. Click to play.</p>
  </div>
</div>

Finally, although not immediately obvious, **shared elements are by default drawn on top of the view hierarchy in a [`ViewOverlay`][ViewOverlay]**. The `ViewOverlay` class was introduced in API 18 as a way to easily draw custom graphics on top of a `View`. Drawing in a `ViewOverlay` makes it impossible for non-shared element views to accidentally draw on top of the views that are being shared across Activities. This default behavior can be disabled in your theme's XML or programatically by calling [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay]. (**TODO: talk about the potential side effects of _using_ the view overlay too! For example, how can we avoid displaying shared elements on top of the System UI?**) Doing so may have unintended side effects, however, as is discussed in [this Google+ post][GooglePlusSystemUI]. (**TODO: integrate parts of Chet's [blog post][ViewOverlayBlogPost], especially the last paragraph about the parent view group clipping views, into this paragraph?**)

### Conclusion

Overall, this post presented **(three?)** important points:

1. asdf
2. asdf
3. asdf

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote?">?</sup> Exit and reenter shared element transitions can also be specified using the `setSharedElementExitTransition()` and `setSharedElementReenterTransition()` methods, although doing so is rarely necessary. For an example illustrating one possible use case, check out [this blog post][SharedElementExitReenterBlogPost]. Note that exit and reenter shared element transitions are only available in the Activity Transitions API. For an explanation why they are not available for Fragment Transitions, see George Mount's answer and comments in [this StackOverflow post][StackOverflowExitReenterTransitions]. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

<sup id="footnote?">?</sup> A similar sequence of events occurs during the exit/return/reenter transitions for both Activities and Fragments. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

<sup id="footnote?">?</sup> One other subtle feature of `ChangeTransform` is that it can detect and handle changes made to a shared element view's parent during a transition. This comes in handy when, for example, the shared element's parent has an opaque background and is therefore selected to be a transitioning view during the scene change. In this case, the `ChangeTransform` will detect that the shared element's parent is being modified by a content transition, will pull out the shared element from its parent, and will animate it separately. See George Mount's [StackOverflow answer][ChangeTransformParentIssue] for more information. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

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

  [View#setClipBounds()]: https://developer.android.com/reference/android/view/View.html#setClipBounds(android.graphics.Rect)
  [View#getClipBounds()]: https://developer.android.com/reference/android/view/View.html#getClipBounds()
  [ImageView.ScaleType]: https://developer.android.com/reference/android/widget/ImageView.ScaleType.html

  [ChangeTransformParentIssue]: http://stackoverflow.com/q/26899779/844882

  [ViewOverlay]: https://developer.android.com/reference/android/view/ViewOverlay.html
  [ViewOverlayBlogPost]: http://graphics-geek.blogspot.com/2013/07/new-in-android-43-viewoverlay.html

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2014/12/activity-fragment-shared-element-transitions-in-practice-part3b.html

