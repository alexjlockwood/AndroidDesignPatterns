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

As an example, **Video 3.1** illustrates how shared element transitions are used in the Google Play Music app. The transition consists of two shared elements: an `ImageView` and its parent `CardView`. During the transition, the `ImageView` seamlessly animates between the two activities, while the `CardView` gradually expands/contracts into place.

Whereas [part 1][part1] only briefly introduced the subject, this blog post aims to give a much more in-depth analysis of shared element transitions. How are shared element transitions triggered under-the-hood? Which types of `Transition` objects can be used? (**TODO: other questions?**) In the next couple sections, we'll tackle these questions one-by-one.

### Shared Element Transitions Under-The-Hood

Recall from the previous two posts that a `Transition` has two main responsibilities: capturing the start and end state of its target views and creating an `Animator` that will animate the views between the two states. Shared element transitions operate no differently: before a shared element transition can create its animation, it must first capture each shared element's start and end state&mdash;namely its position, size, and appearance. To ensure the shared element transition captures this state, the framework directly modifies each shared element's view properties so that at the beginning of the transition it appears exactly as it did in `A` and at the end of the transition it appears exactly as it should in `B`.

As an example, let's walk through the sequence of events that occurs when Activity `A` starts Activity `B`, causing `B`'s enter shared element transition to be performed:<sup><a href="#footnote?" id="ref?">?</a></sup>

1. Activity `B` is started with a translucent window and transparent background, completely invisible to the user.
2. The framework repositons each shared element in `B` to match its exact size and location in `A`.
3. `B`'s shared element enter transition captures the start state of all the shared elements in `B`.
4. The framework repositons each shared element in `B` to match its desired final size and location in `B`.
5. On the next display frame, `B`'s shared element enter transition captures the end state of all the shared elements in `B`.
6. `B`'s shared element enter transition compares the start and end state of its shared element views and creates an `Animator` based on the differences. The `Animator` is run and the shared elements animate into place. As the animation takes place, the window's background gradually fades in and when the transition completes the window is made opaque.
7. **TODO:** The framework sends a message to `A` instructing it to hide its shared elements before the transition begins. This is necessary in order to make it look like the views are being physically removed from `A` and transferred to `B` (while in reality, the shared elements are simply drawing in `B`s window the entire time). (Should this be a footnote? We need to incorporate this information somehow into the step-by-step...)

As you can see, whereas content transitions are governed by changes made to each transitioning view's visibility, **shared element transitions analyze and depend on changes made to each shared element view's position and size**. As of API 21, the framework provides support for several different transition types that can be used to animate shared elements: `ChangeBounds`, `ChangeTransform`, `ChangeClipBounds`, and `ChangeImageTransform`. For many shared element transitions, the default [`@android:transition/move`][Move] transition should work just fine.

Another observation that is worth pointing out is that **shared element views are not actually "shared" across Activity instances**. Instead, the framework relies on a trick that only makes it look that way. When activity `A` starts Activity `B`, the framework collects all of the relevant state about the shared elements in `A` and passes that information along to Activity `B`. Activity `B` then takes this information and initializes its shared element views to match their exact position and size in `A`. Immediately before the shared element transition begins, the shared element views in `A` are hidden, and the setup is complete. The transition begins and the user sees the shared elements animate in `B` from their starting position in `A` to their resting position in `B`. Meanwhile, `B` gradually animates its window background from transparent to fully opaque.

Finally, we should note that **shared elements are drawn on top of the view hierarchy in the window's `ViewOverlay`**. This default behavior ensures that the shared elements will always be the central focus of the Activity transition, as it makes it impossible for non-shared elements&mdash;in both the called and calling Activity's view hierarchies&mdash;to accidentally draw on top of the views that are being shared across Activities. This default behavior can be disabled in your theme's XML or programatically by calling [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay]. Doing so may have unintended side effects, however, as is discussed in [this Google+ post][GooglePlusSystemUI].

### Postponing Shared Element Transitions

A common source of problems when dealing with shared element transitions stems from the fact that they are initiated by the framework early in the Activity lifecycle. Recall that `Transition`s require both the start and end state of its target views in order to function properly. Thus, if the shared element transition is started before its final position and size has been determined, the transition will fail to create an `Animator` that will animate the shared views between the two states. Unfortunately, it is not uncommon that one of your shared elements will not have finished its final layout by the time the shared element transition begins. Some common examples are,

* **The shared element lives inside a `Fragment`.** `FragmentTransaction`s are not executed immediately by default, so if your shared element exists as part of the `Fragment`'s view hierarchy, there is a chance that the framework will accidentally start the shared element transition before the `Fragment`'s view hierarchy has been properly measured and laid out. Forcing the `FragmentTransaction`s to execute immediately by calling [`FragmentManager#executePendingTransactions()`][FragmentManager#executePendingTransactions] may help, but may also introduce unintended side effects depending on the situation.

* **The shared element is a high-resolution image.** If the high resolution image exceeds the `ImageView`s initial bounds, an additional layout pass on the `ImageView` will be triggered. Especially if you are using an image loading library such as Picasso or you are scaling bitmap images asynchronously yourself, the framework will likely begin the shared element transition before the `ImageView` has finished being properly laid out.

* **The shared element depends on asynchronously loaded data.** If the shared element views depend on asynchronously loaded data (from a `Loader`, for example), the framework will likely initiate the shared element transition before the data is delivered and applied to the views in the activity.

Fortunately, we can get around these issues by postponing the activity's shared element transition using the Activity's [`postponeEnterTransition()`][postponeEnterTransition] and [`startPostponedEnterTransition()`][startPostponedEnterTransition] methods.<sup><a href="#footnote?" id="ref?">?</a></sup> The first method tells the framework to pause the shared element transition until all data has been loaded and all views have been laid out. Since the framework cannot automatically know when this is, we must also call the second method to tell the framework that it is OK to start the transition. Clearly we must wait for the views to finish their layout before the shared element transition can begin. Thus, a common pattern is to start the postponed transition in an `onPreDraw` listener, which is guaranteed to be called after the view is properly measured and laid out:

```java
activity.postponeEnterTransition();
view.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
    @Override
    public boolean onPreDraw() {
        view.getViewTreeObserver().removeOnPreDrawListener(this);
        activity.startPostponedEnterTransition();
        return true;
    }
});
```

Despite their names, these two methods can be used to postpone both enter and return shared element transitions. If `A` starts `B` then the enter shared element transition can be postponed by calling `postponeEnterTransition()` in `B`'s `onCreate()` method. If `B` is returning to `A`, then the return shared element transition can be postponed by calling `postponeEnterTransition()` in `A`'s `onActivityReenter()` method.

### Creating Advanced Transitions Using a `SharedElementCallback`

You can further customize your shared element transitions by setting a [`SharedElementCallback`][SharedElementCallback]. Understanding the SharedElementCallback class will be important if you want to implement custom Transitions that are more complicated than simply moving an image from one location to another. In particular, the following three callback methods are very important to understand when writing more complex shared element transitions:

* `onMapSharedElements()` lets you adjust the mapping of shared element names to Views. **TODO: more detail.**
* `onSharedElementStart()` and `onSharedElementEnd()` let you adjust view properties in your layout immediately before the transitions capture their start and end values respectively. **TODO: more detail.**

### Conclusion

Overall, this post presented **(three?)** important points:

1. asdf
2. asdf
3. asdf

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote?">?</sup> Exit and reenter shared element transitions can also be specified using the `setSharedElementExitTransition()` and `setSharedElementReenterTransition()` methods, although doing so is rarely necessary. For an example illustrating one possible use case, check out [this blog post][SharedElementExitReenterBlogPost]. Note that exit and reenter shared element transitions are only available in the Activity Transitions API. For an explanation why they are not available for Fragment Transitions, see George Mount's comments in [this StackOverflow post][StackOverflowExitReenterTransitions]. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

<sup id="footnote?">?</sup> **TODO: footnote that talks about the shared element exit transition in-depth... i.e. in between step 1 and 2 the framework will run the exit shared element transition** <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

<sup id="footnote?">?</sup> Note that `postponeEnterTransition()` and `startPostponedEnterTransition()` methods only work for Activity Transitions and not for Fragment Transitions. For an explanation and possible workaround, see [this StackOverflow answer][PostponeEnterTransitionForFragments] and [this Google+ post][PostponeEnterTransitionForFragmentsG+]. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

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

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3]: /2014/12/activity-fragment-shared-element-transitions-in-depth-part3.html

