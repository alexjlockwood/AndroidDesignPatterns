---
layout: post
title: 'Shared Element Transitions In-Depth (part 3a)'
date: 2015-01-12
permalink: /2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

This post will give an in-depth analysis of _shared element transitions_ and their role in the Activity and Fragment Transitions API. This is the third of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3a:** [Shared Element Transitions In-Depth][part3a]
* **Part 3b:** [Postponed Transitions & Shared Element Callbacks][part3b]
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

Part 3 of this series will be broken up into two parts: part 3a will focus on how shared elements operate under-the-hood and part 3b will focus more on the implementation-specific details of the API, such as the importance of postponing certain shared element transitions and implementing `SharedElementCallback`s.

We begin by summarizing what we learned about shared element transitions in [part 1][part1] and illustrating how they can be used to achieve smooth, seamless animations in Android Lollipop.

### What is a Shared Element Transition?

<!--morestart-->

A _shared element transition_ determines how shared element views&mdash;also called _hero views_&mdash;are animated from one Activity/Fragment to another during a scene transition. Shared elements are animated by the called Activity/Fragment's enter and return shared element transitions,<sup><a href="#footnote1" id="ref1">1</a></sup> each of which can be specified using the following [`Window`][Window] and [`Fragment`][Fragment] methods:

* `setSharedElementEnterTransition()` - `B`'s enter shared element transition animates shared element views from their starting positions in `A` to their final positions in `B`.
* `setSharedElementReturnTransition()` - `B`'s return shared element transition animates shared element views from their starting positions in `B` to their final positions in `A`.

<!--more-->

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure31" onclick="playPause('figure31')" poster="/assets/videos/posts/2015/01/12/music-opt.png" preload="none">
    <source src="/assets/videos/posts/2015/01/12/music-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2015/01/12/music-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2015/01/12/music-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 3.1</strong> - Shared element transitions in action in the Google Play Music app (as of v5.6). Click to play.</p>
  </div>
</div>

**Video 3.1** illustrates how shared element transitions are used in the Google Play Music app. The transition consists of two shared elements: an `ImageView` and its parent `CardView`. During the transition, the `ImageView` seamlessly animates between the two activities while the `CardView` gradually expands/contracts into place.

Whereas [part 1][part1] only briefly introduced the subject, this blog post aims to give a much more in-depth analysis of shared element transitions. How are shared element transitions triggered under-the-hood? Which types of `Transition` objects can be used? How and where are shared element views drawn during the transition? In the next couple sections, we'll tackle these questions one-by-one.

### Shared Element Transitions Under-The-Hood

Recall from the previous two posts that a `Transition` has two main responsibilities: capturing the start and end state of its target views and creating an `Animator` that will animate the views between the two states. Shared element transitions operate no differently: before a shared element transition can create its animation, it must first capture each shared element's start and end state&mdash;namely its position, size, and appearance in both the calling and called Activities/Fragments. With this information, the transition can determine how each shared element view should animate into place.

Similar to how [content transitions operate under-the-hood][part2], the framework feeds the shared element transition this state information by directly modifying each shared element's view properties at runtime. More specifically, when Activity `A` starts Activity `B` the following sequence of events occurs:<sup><a href="#footnote2" id="ref2">2</a></sup>

1. Activity `A` calls `startActivity()` and Activity `B` is created, measured, and laid out with an initially translucent window and transparent window background color.
2. The framework repositions each shared element view in `B` to match its exact size and location in `A`. Shortly after, `B`'s enter transition captures the start state of all the shared elements in `B`.
3. The framework repositions each shared element view in `B` to match its final size and location in `B`. Shortly after, `B`'s enter transition captures the end state of all the shared elements in `B`.
4. `B`'s enter transition compares the start and end state of its shared element views and creates an `Animator` based on the differences.
5. The framework instructs `A` to hide its shared element views from sight and the resulting `Animator` is run. As `B`'s shared element views animate into place, `B`'s window background gradually fades in on top `A` until `B` is entirely opaque and the transition completes.

Whereas content transitions are governed by changes to each transitioning view's visibility, **shared element transitions are governed by changes to each shared element view's position, size, and appearance**. As of API 21, the framework provides several different `Transition` implementations that can be used to customize how shared elements are animated during a scene change:

* [`ChangeBounds`][ChangeBounds] - Captures the _layout bounds_ of shared element views and animates the differences. `ChangeBounds` is frequently used in shared element transitions, as most shared elements will differ in size and/or location within either of the two Activities/Fragments.
* [`ChangeTransform`][ChangeTransform] - Captures the _scale and rotation_ of shared element views and animates the differences.<sup><a href="#footnote3" id="ref3">3</a></sup>
* [`ChangeClipBounds`][ChangeClipBounds] - Captures the [_clip bounds_][View#getClipBounds()] of shared element views and animates the differences.
* [`ChangeImageTransform`][ChangeImageTransform] - Captures the _transform matrices_ of shared element `ImageView`s and animates the differences. In combination with `ChangeBounds`, this transition allows `ImageView`s that change in size, shape, and/or [ImageView.ScaleType][ImageView.ScaleType] to animate smoothly and efficiently.
* [`@android:transition/move`][Move] - A `TransitionSet` that plays all four transition types above in parallel. As discussed in [part 1][part1], if an enter/return shared element transition is not explicitly specified, the framework will run this transition by default.

In the example above, we also can see that **shared element view instances are not actually "shared" across Activities/Fragments**. In fact, almost everything the user sees during both enter and return shared element transitions is drawn directly inside `B`'s content view. Instead of somehow transferring the shared element view instance from `A` to `B`, the framework uses a different means of achieving the same visual effect. When `A` starts `B`, the framework collects all of the relevant state information about the shared elements in `A` and passes it to `B`. `B` then uses this information to initialize the start state of its shared elements views, each of which will initially match the exact position, size, and appearance they had in `A`. When the transition begins, everything in `B` except the shared elements are initially invisible to the user. As the transition progresses, however, the framework gradually fades in `B`'s Activity window until the shared elements in `B` finish animating and `B`'s window background is opaque.

### Using the Shared Element Overlay<sup><a href="#footnote4" id="ref4">4</a></sup>

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure32" onclick="playPause('figure32')" poster="/assets/videos/posts/2015/01/12/overlay-opt.png" preload="none">
    <source src="/assets/videos/posts/2015/01/12/overlay-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2015/01/12/overlay-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2015/01/12/overlay-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 3.2</strong> - A simple app that illustrates a potential bug that can result when the shared element overlay is disabled. Click to play.</p>
  </div>
</div>

Finally, before we can gain a complete understanding of how shared element transitions are drawn by the framework, we must discuss the _shared element overlay_. Although not immediately obvious, **shared elements are drawn on top of the entire view hierarchy in the window's [`ViewOverlay`][ViewOverlay] by default**. In case you haven't heard of it before, the `ViewOverlay` class was introduced in API 18 as a way to easily draw on top of a `View`. Drawables and views that are added to a view's `ViewOverlay` are guaranteed to be drawn on top of everything else&mdash;even a `ViewGroup`'s children. With this in mind, it makes sense why the framework would choose to draw shared elements in the window's `ViewOverlay` on top of everything else in the view hierarchy by default. Shared elements views should be the focus throughout the entire transition; the possibility of transitioning views accidentally drawing on top of the shared elements would immediately ruin the effect.<sup><a href="#footnote5" id="ref5">5</a></sup>

Although shared elements are drawn in the shared element `ViewOverlay` by default, the framework does give us the ability to disable the overlay by calling the [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay] method, just in case you ever find it necessary. If you ever do choose to disable the overlay, be wary of the undesired side-effects it might cause. As an example, **Video 3.2** runs a simple shared element transition twice, with and without the shared element overlay enabled respectively. The first time the transition is run, the shared element `ImageView` animates as expected in the shared element overlay, on top of all other views in the hierarchy. The second time the transition is run, however, we can clearly see that disabling the overlay has introduced a problem. As the bottom transitioning view slides up into the called Activity's content view, the shared element `ImageView` is partially covered as and is drawn below the transitioning view for nearly the first half of the transition. Although there is a chance that this could be fixed by altering the order in which views are drawn in the layout and/or by setting `setClipChildren(false)` on the shared element's parent, these sort of "hacky" modifications can easily become unmanagable and more trouble than they are worth. In short, try not to disable the shared element overlay unless you find it absolutely necessary, and you'll likely benefit from simpler and more dramatic shared element transitions as a result.

### Conclusion

Overall, this post presented three important points:

1. A shared element transition determines how shared element views&mdash;also called hero views&mdash;are animated from one Activity/Fragment to another during a scene transition.
2. Shared element transitions are governed by changes to each shared element view's position, size, and appearance.
3. Shared elements are drawn on top of the entire view hierarchy in the window's `ViewOverlay` by default.

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> Note that the Activity Transition API gives you the ability to also specify exit and reenter shared element transitions using the `setSharedElementExitTransition()` and `setSharedElementReenterTransition()` methods, although doing so is usually not necessary. For an example illustrating one possible use case, check out [this blog post][SharedElementExitReenterBlogPost]. For an explanation why exit and reenter shared element transitions are not available for Fragment Transitions, see George Mount's answer and comments in [this StackOverflow post][StackOverflowExitReenterTransitions]. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> A similar sequence of events occurs during the exit/return/reenter transitions for both Activities and Fragments. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>

<sup id="footnote3">3</sup> One other subtle feature of `ChangeTransform` is that it can detect and handle changes made to a shared element view's parent during a transition. This comes in handy when, for example, the shared element's parent has an opaque background and is by default selected to be a transitioning view during the scene change. In this case, the `ChangeTransform` will detect that the shared element's parent is being actively modified by the content transition, pull out the shared element from its parent, and animate the shared element separately. See George Mount's [StackOverflow answer][ChangeTransformParentIssue] for more information. <a href="#ref3" title="Jump to footnote 3.">&#8617;</a>

<sup id="footnote4">4</sup> Note that this section only pertains to Activity Transitions. Unlike Activity Transitions, shared elements are **not** drawn in a `ViewOverlay` by default during Fragment Transitions. That said, you can achieve a similar effect by applying a `ChangeTransform` transition, which will have the shared element drawn on top of the hierarchy in a `ViewOverlay` if it detects that its parent has changed. See [this StackOverflow post][OverlayForFragments] for more information. <a href="#ref4" title="Jump to footnote 4.">&#8617;</a>

<sup id="footnote5">5</sup> Note that one negative side-effect of having shared elements drawn on top of the entire view hierarchy is that this means it will become possible for shared elements to draw on top of the System UI (such as the status bar, navigation bar, and action bar). For more information on how you can prevent this from happening, see [this Google+ post][GooglePlusSystemUI]. <a href="#ref5" title="Jump to footnote 5.">&#8617;</a>

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

  [View#getClipBounds()]: https://developer.android.com/reference/android/view/View.html#getClipBounds()
  [ImageView.ScaleType]: https://developer.android.com/reference/android/widget/ImageView.ScaleType.html

  [ChangeTransformParentIssue]: http://stackoverflow.com/q/26899779/844882

  [ViewOverlay]: https://developer.android.com/reference/android/view/ViewOverlay.html
  [ViewOverlayBlogPost]: http://graphics-geek.blogspot.com/2013/07/new-in-android-43-viewoverlay.html
  [OverlayForFragments]: http://stackoverflow.com/q/27892033/844882

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2015/03/activity-fragment-postponed-transitions-shared-element-callbacks-part3b.html

