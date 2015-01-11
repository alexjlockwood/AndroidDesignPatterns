---
layout: post
title: 'Shared Element Transitions In Practice (part 3b)'
date: 2015-01-13
permalink: /2015/01/activity-fragment-shared-element-transitions-in-practice-part3b.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
published: false
---

This post will give an in-depth analysis of _shared element transitions_ and their role in the Activity and Fragment Transitions API. This is the fourth of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3a:** [Shared Element Transitions In-Depth][part3a]
* **Part 3b:** Shared Element Transitions In Practice (_coming soon!_)
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

**TODO: We begin by...**

### Postponing Shared Element Transitions

<!--morestart-->

A common source of problems when dealing with shared element transitions stems from the fact that they are initiated by the framework early in the Activity lifecycle. Recall that `Transition`s require both the start and end state of its target views in order to function properly. Thus, if the shared element transition is started before its final position and size has been determined, the transition will fail to create an `Animator` that will animate the shared views between the two states. Unfortunately, it is not uncommon that one of your shared elements will not have finished its final layout by the time the shared element transition begins. Some common examples are,

<!--more-->

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

  [ChangeBounds]: https://developer.android.com/reference/android/transition/ChangeBounds.html
  [ChangeTransform]: https://developer.android.com/reference/android/transition/ChangeTransform.html
  [ChangeClipBounds]: https://developer.android.com/reference/android/transition/ChangeClipBounds.html
  [ChangeImageTransform]: https://developer.android.com/reference/android/transition/ChangeImageTransform.html

  [ViewOverlay]: https://developer.android.com/reference/android/view/ViewOverlay.html
  [ViewOverlayBlogPost]: http://graphics-geek.blogspot.com/2013/07/new-in-android-43-viewoverlay.html

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2015/01/activity-fragment-shared-element-transitions-in-practice-part3b.html

