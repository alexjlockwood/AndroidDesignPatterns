---
layout: post
title: 'Postponed Shared Element Transitions (part 3b)'
date: 2015-03-09
permalink: /2015/03/activity-postponed-shared-element-transitions-part3b.html
related: ['/2012/08/implementing-loaders.html',
    '/2013/08/fragment-transaction-commit-state-loss.html',
    '/2012/06/app-force-close-honeycomb-ics.html']
style: |
    .framed-nexus6-port {
      background: transparent url(/assets/images/nexus6_frame.png) no-repeat
      scroll top left;
      padding-top: 71px;
      padding-right: 33px;
      padding-bottom: 50px;
      padding-left: 48px;
      overflow: hidden;
    }

    .framed-nexus6-port,
    .framed-nexus6-port video,
    .framed-nexus6-port img {
      width: 216px;
      height: 384px;
    }

    .nexus6-figure {
      width: 290px;
      margin-right: 35px;
      float: right;
    }
script: |
    function playPause(figureName) {
      var myVideo = document.getElementById(figureName);
      myVideo.load();
      myVideo.play();
    }
---

This post continues our in-depth analysis of _shared element transitions_ by discussing an important feature of the Lollipop Transition API: postponed shared element transitions. It is the fourth of a series of posts I will be writing on the topic:

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3a:** [Shared Element Transitions In-Depth][part3a]
* **Part 3b:** [Postponed Shared Element Transitions][part3b]
* **Part 3c:** Implementing Shared Element Callbacks (_coming soon!_)
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

Until I write part 4, an example application demonstrating some advanced activity transitions is available [here](https://github.com/alexjlockwood/activity-transitions).

We begin by discussing the need to postpone certain shared element transitions due to a common problem.

### Understanding the Problem

<!--morestart-->

A common source of problems when dealing with shared element transitions stems from the fact that they are started by the framework very early in the Activity lifecycle. Recall from [part 1][part1] that `Transition`s must capture both the start and end state of its target views in order to build a properly functioning animation. Thus, if the framework starts the shared element transition before its shared elements are given their final size and position and size within the called Activity, the transition will capture the incorrect end values for its shared elements and the resulting animation will fail completely (see **Video 3.3** for an example of what the failed enter transition might look like). 

<!--more-->

<div class="responsive-figure nexus6-figure">
  <div class="framed-nexus6-port">
  <video id="figure33" onclick="playPause('figure33')" poster="/assets/videos/posts/2015/03/09/postpone-bug-opt.png" preload="none">
    <source src="/assets/videos/posts/2015/03/09/postpone-bug-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2015/03/09/postpone-bug-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2015/03/09/postpone-bug-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 3.3</strong> - Fixing a broken shared element enter animation by postponing the transition. Click to play.</p>
  </div>
</div>

Whether or not the shared elements' end values will be calculated before the transition begins depends mainly on two factors: (1) the complexity and depth of the called activity's layout and (2) the amount of time it takes for the called activity to load its required data. The more complex the layout, the longer it will take to determine the shared elements' position and size on the screen. Similarly, if the shared elements' final appearance within the activity depends on asynchronously loaded data, there is a chance that the framework might automatically start the shared element transition before that data is delivered back to the main thread. Listed below are some of the common cases in which you might encounter these issues:

* **The shared element lives in a `Fragment` hosted by the called activity.** [`FragmentTransaction`s are not executed immediately after they are committed][FragmentTransaction#commit]; they are scheduled as work on the main thread to be done at a later time. Thus, if the shared element lives inside the `Fragment`'s view hierarchy and the `FragmentTransaction` is not executed quickly enough, it is possible that the framework will start the shared element transition before the shared element is properly measured and laid out on the screen.<sup><a href="#footnote1" id="ref1">1</a></sup>

* **The shared element is a high-resolution image.** Setting a high resolution image that exceeds the `ImageView`'s initial bounds might end up triggering [an additional layout pass][ImageViewRequestLayout] on the view hierarchy, therefore increasing the chances that the transition will begin before the shared element is ready. The asynchronous nature of popular bitmap loading/scaling libraries, such as [Volley][Volley] and [Picasso][Picasso], will not reliably fix this problem: the framework has no prior knowledge that images are being downloaded, scaled, and/or fetched from disk on a background thread and will start the shared element transition whether or not images are still being processed.

* **The shared element depends on asynchronously loaded data.** If the shared elements require data loaded by an `AsyncTask`, an `AsyncQueryHandler`, a `Loader`, or something similar before their final appearance within the called activity can be determined, the framework might start the transition before that data is delivered back to the main thread.

### `postponeEnterTransition()` and `startPostponedEnterTransition()`

At this point you might be thinking, _"If only there was a way to temporarily delay the transition until we know for sure that the shared elements have been properly measured and laid out."_ Well, you're in luck, because the Activity Transitions API<sup><a href="#footnote2" id="ref2">2</a></sup> gives us a way to do just that!

To temporarily prevent the shared element transition from starting, call [`postponeEnterTransition()`][postponeEnterTransition] in your called activity's `onCreate()` method. Later, when you know for certain that all of your shared elements have been properly positioned and sized, call [`startPostponedEnterTransition()`][startPostponedEnterTransition] to resume the transition. A common pattern you'll find useful is to start the postponed transition in an [`OnPreDrawListener`][OnPreDrawListener], which will be called after the shared element has been measured and laid out:<sup><a href="#footnote3" id="ref3">3</a></sup>

```java
@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);

    // Postpone the shared element enter transition.
    postponeEnterTransition();

    // TODO: Call the "scheduleStartPostponedTransition()" method
    // below when you know for certain that the shared element is
    // ready for the transition to begin.
}

/**
 * Schedules the shared element transition to be started immediately
 * after the shared element has been measured and laid out within the
 * activity's view hierarchy. Some common places where it might make
 * sense to call this method are:
 * 
 * (1) Inside a Fragment's onCreateView() method (if the shared element
 *     lives inside a Fragment hosted by the called Activity).
 *
 * (2) Inside a Picasso Callback object (if you need to wait for Picasso to
 *     asynchronously load/scale a bitmap before the transition can begin).
 *
 * (3) Inside a LoaderCallback's onLoadFinished() method (if the shared
 *     element depends on data queried by a Loader).
 */
private void scheduleStartPostponedTransition(final View sharedElement) {
    sharedElement.getViewTreeObserver().addOnPreDrawListener(
        new ViewTreeObserver.OnPreDrawListener() {
            @Override
            public boolean onPreDraw() {
                sharedElement.getViewTreeObserver().removeOnPreDrawListener(this);
                startPostponedEnterTransition();
                return true;
            }
        });
}
```

Despite their names, these two methods can also be used to postpone shared element return transitions as well. Simply postpone the return transition within the calling Activity's [onActivityReenter()][Activity#onActivityReenter] method instead:<sup><a href="#footnote4" id="ref4">4</a></sup>

```java
/**
 * Don't forget to call setResult(Activity.RESULT_OK) in the returning
 * activity or else this method won't be called!
 */
@Override
public void onActivityReenter(int resultCode, Intent data) {
    super.onActivityReenter(resultCode, data);

    // Postpone the shared element return transition.
    postponeEnterTransition();

    // TODO: Call the "scheduleStartPostponedTransition()" method
    // above when you know for certain that the shared element is
    // ready for the transition to begin.
}
```

Despite making your shared element transitions smoother and more reliable, it's important to also be aware that introducing postponed shared element transitions into your application could also have some potentially harmful side-effects:

* **Never forget to call `startPostponedEnterTransition()` after calling `postponeEnterTransition`.** Forgetting to do so will leave your application in a state of deadlock, preventing the user from ever being able to reach the next Activity screen.

* **Never postpone a transition for longer than a fraction of a second.** Postponing a transition for even a fraction of a second could introduce unwanted lag into your application, annoying the user and slowing down the user experience.

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> Of course, most applications can usually workaround this issue by calling [`FragmentManager#executePendingTransactions()`][FragmentManager#executePendingTransactions], which will force any pending `FragmentTransaction`s to execute immediately instead of asynchronously. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> Note that the `postponeEnterTransition()` and `startPostponedEnterTransition()` methods only work for Activity Transitions and not for Fragment Transitions. For an explanation and possible workaround, see [this StackOverflow answer][PostponeEnterTransitionForFragments] and [this Google+ post][PostponeEnterTransitionForFragmentsG+]. <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>

<sup id="footnote3">3</sup> Pro tip: you can verify whether or not allocating the `OnPreDrawListener` is needed by calling [`View#isLayoutRequested()`][View#isLayoutRequested] beforehand, if necessary. [`View#isLaidOut()`][View#isLaidOut] may come in handy in some cases as well. <a href="#ref3" title="Jump to footnote 3.">&#8617;</a>

<sup id="footnote3">4</sup> A good way to test the behavior of your shared element return/reenter transitions is by going into the Developer Options and enabling the "Don't keep activities" setting. This will help test the worst case scenario in which the calling activity will need to recreate its layout, requery any necessary data, etc. before the return transition begins. <a href="#ref4" title="Jump to footnote 4.">&#8617;</a>

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
  [View#isLayoutRequested]: http://developer.android.com/reference/android/view/View.html#isLayoutRequested()
  [View#isLaidOut]: http://developer.android.com/reference/android/view/View.html#isLaidOut()

  [ImageViewRequestLayout]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/widget/ImageView.java#L453-L455
  [Volley]: https://android.googlesource.com/platform/frameworks/volley
  [Picasso]: http://square.github.io/picasso/

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
  [part3a]: /2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html
  [part3b]: /2015/03/activity-postponed-shared-element-transitions-part3b.html

