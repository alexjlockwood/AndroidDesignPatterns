---
layout: post
title: 'Postponed Transitions & Shared Element Callbacks (part 3b)'
date: 2015-01-13
permalink: /2015/03/activity-fragment-postponed-transitions-shared-element-callbacks-part3b.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
---

This post continues our in-depth analysis of _shared element transitions_ by discussing two key features of Lollipop's transition API: postponed shared element transitions and the `SharedElementCallback` interface. It is the fourth of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3a:** [Shared Element Transitions In-Depth][part3a]
* **Part 3b:** [Postponed Transitions & Shared Element Callbacks][part3b]
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

We begin by discussing the need to postpone certain shared element transitions through some specific examples.

### Understanding Postponed Shared Element Transitions

<!--morestart-->

A common source of problems when dealing with shared element transitions stems from the fact that they are initiated by the framework very early in the Activity lifecycle. Recall that `Transition`s require both the start and end state of its target views in order to function properly. Thus, if a shared element transition starts before its shared element views are assigned their final size and position and size within the called Activity, the transition will capture incorrect end values for its shared elements and the behavior of the resulting animation will fail completely.

Whether or not the shared elements' end values will be calculated before the transition begins depends mostly on two factors: the complexity/depth of the called activity's layout and the amount of time it takes for the called activity to load the required data. The more complex the layout, the longer it will take to determine the shared elements position and size on the screen. Similarly, if the shared elements' appearance within the UI depends on data loaded asynchronously on a background thread, the greater the chance that the framework will start the transition without it. Listed below are some of the common scenarios in which you might encounter these issues:

<!--more-->

* **The shared element lives in a `Fragment` hosted by the called activity.** [`FragmentTransaction`s are not executed immediately after they are committed][FragmentTransaction#commit]; they are scheduled as work on the main thread to be done at a later time. Thus, if the shared element lives inside the `Fragment`'s view hierarchy and the `FragmentTransaction` is not executed quickly enough, it is possible that the framework will start the shared element transition before the shared element is properly measured and laid out within the called Activity.<sup><a href="#footnote?" id="ref?">?</a></sup>

* **The shared element is a high-resolution image.** Setting a high resolution image that exceeds the `ImageView`'s initial bounds might end up triggering [an additional layout pass][ImageViewRequestLayout] on the view hierarchy, making it more likely that the transition will begin before the shared element is ready. The asynchronous nature of popular bitmap loading/scaling libraries, such as [Volley][Volley] and [Picasso][Picasso], will not reliably fix this problem: the framework has no prior knowledge that the images are being downloaded, scaled, or fetched from disk on a background thread.

* **The shared element depends on asynchronously loaded data.** If the shared element views depends on data loaded by an `AsyncTask`, an `AsyncQueryHandler`, a `Loader`, or something similar, it is possible that the framework will start the transition before those results are delivered back to the activity.

At this point you might be thinking, _"If only there was a way to temporarily pause the transition until we know for sure that the shared elements have been properly measured and laid out."_ Well, you're in luck! The Activity Transitions API<sup><a href="#footnote?" id="ref?">?</a></sup> gives us a way to do just that. To temporarily pause the shared element transition from beginning, call [`postponeEnterTransition()`][postponeEnterTransition] in your activity's `onCreate()` method. Later, when you know for certain that all of your shared elements have been properly positioned and sized, call [`startPostponedEnterTransition()`][startPostponedEnterTransition] to let the framework know that it should resume the transition. A common pattern you'll find useful is to start the postponed transition in an [`OnPreDrawListener`][OnPreDrawListener], which is guaranteed to be called after your shared element has finished its measurement and layout phases:

```java
private View mSharedElement;

@Override
protected void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  setContentView(R.layout.activity_main);
  mSharedElement = findViewById(R.id.shared_element);

  // Postpone the shared element enter transition.
  postponeEnterTransition();

  // Start the shared element enter transition when we know
  // the shared element is ready.
  scheduleStartPostponedTransition();
}

/**
 * Schedules the shared element transition to be resumed immediately
 * after the shared element has been measured and laid out within the
 * activity's view hierarchy.
 */
private void scheduleStartPostponedTransition() {  
  mSharedElement.getViewTreeObserver().addOnPreDrawListener(
      new ViewTreeObserver.OnPreDrawListener() {
        @Override
        public boolean onPreDraw() {
          mSharedElement.getViewTreeObserver().removeOnPreDrawListener(this);
          startPostponedEnterTransition();
          return true;
        }
      });
}
```

Despite their names, these two methods can be used to postpone return transitions as well. Simply postpone the return transition within the calling Activity's [onActivityReenter()][Activity#onActivityReenter] method instead:

```java
@Override
public void onActivityReenter(int resultCode, Intent data) {
  super.onActivityReenter(resultCode, data);

  // Postpone the shared element return transition.
  postponeEnterTransition();

  // Start the shared element return transition when we know
  // the shared element is ready.
  scheduleStartPostponedTransition();
}
```

### Creating Advanced Transitions Using `SharedElementCallback`s

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
<sup id="footnote?">?</sup> Of course, most applications can usually workaround this issue by calling [`FragmentManager#executePendingTransactions()`][FragmentManager#executePendingTransactions], which will force any pending `FragmentTransaction` to execute immediately instead of asynchronously. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>
<sup id="footnote?">?</sup> Note that `postponeEnterTransition()` and `startPostponedEnterTransition()` methods only work for Activity Transitions and not for Fragment Transitions. For an explanation and possible workaround, see [this StackOverflow answer][PostponeEnterTransitionForFragments] and [this Google+ post][PostponeEnterTransitionForFragmentsG+]. <a href="#ref?" title="Jump to footnote ?.">&#8617;</a>

  [postponeEnterTransition]: https://developer.android.com/reference/android/app/Activity.html#postponeEnterTransition()
  [startPostponedEnterTransition]: https://developer.android.com/reference/android/app/Activity.html#startPostponedEnterTransition()
  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html

  [FragmentTransaction#commit]: https://developer.android.com/reference/android/app/FragmentTransaction.html#commit()
  [FragmentManager#executePendingTransactions]: https://developer.android.com/reference/android/app/FragmentManager.html#executePendingTransactions()
  [GooglePlusPostponeEnterTransition]: https://plus.google.com/+AlexLockwood/posts/FJsp1N9XNLS
  [GooglePlusSystemUI]: https://plus.google.com/+AlexLockwood/posts/RPtwZ5nNebb
  [PostponeEnterTransitionForFragments]: http://stackoverflow.com/q/26977303/844882
  [PostponeEnterTransitionForFragmentsG+]: https://plus.google.com/+AlexLockwood/posts/3DxHT42rmmY
  [Activity#onActivityReenter]: https://developer.android.com/reference/android/app/Activity.html#onActivityReenter(int,%20android.content.Intent)
  [OnPreDrawListener]: http://developer.android.com/reference/android/view/ViewTreeObserver.OnPreDrawListener.html

  [ImageViewRequestLayout]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/widget/ImageView.java#L453-L455
  [Volley]: https://android.googlesource.com/platform/frameworks/volley
  [Picasso]: http://square.github.io/picasso/

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2015/03/activity-fragment-postponed-transitions-shared-element-callbacks-part3b.html

