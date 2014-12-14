---
layout: post
title: 'Content Transitions In-Depth (part 2)'
date: 2014-12-05
permalink: /2014/12/activity-fragment-content-transitions-in-depth-part2.html
---

This post will give an in-depth analysis of _content transitions_ and their role in the Activity and Fragment Transitions API. This is the second of a series of posts I will be writing on the topic.

* **Part 1:** [Getting Started with Activity & Fragment Transitions][part1]
* **Part 2:** [Content Transitions In-Depth][part2]
* **Part 3:** Shared Element Transitions In-Depth (_coming soon!_)
* **Part 4:** Activity & Fragment Transition Examples (_coming soon!_)

We begin by summarizing what we learned about content transitions in [part 1][part1] and illustrating how they can be used in real-world applications to achieve smooth, seamless animations in Android Lollipop.

### What is a Content Transition?

<!--morestart-->

A _content transition_ determines how the non-shared views&mdash;called _transitioning views_&mdash;enter or exit the scene during an Activity or Fragment transition. Motivated by Google's new [Material Design][MaterialDesignMeaningfulTransitions] language, content transitions allow us to coordinate the entrance and exit of each Activity/Fragment's views, making the act of switching between screens smooth and effortless. Beginning with Android Lollipop, content transitions can be set programatically by calling the following [`Window`][Window] and [`Fragment`][Fragment] methods:

* `setExitTransition()` - `A`'s exit transition animates transitioning views **out** of the scene when `A` **starts** `B`.
* `setEnterTransition()` - `B`'s enter transition animates transitioning views **into** the scene when `A` **starts** `B`.
* `setReturnTransition()` - `B`'s return transition animates transitioning views **out** of the scene when `B` **returns** to `A`.
* `setReenterTransition()` - `A`'s reenter transition animates transitioning views **into** the scene when `B` **returns** to `A`.

<!--more-->

<div style="width:290px;margin-right:35px;float:right" poster="/assets/videos/posts/2014/12/05/games-opt.png" preload="none">
  <div class="framed-nexus6-port">
  <video id="figure21" onclick="playPause('figure21')">
    <source src="/assets/videos/posts/2014/12/05/games-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2014/12/05/games-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2014/12/05/games-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 2.1</strong> - Content transitions in the Google Play Games app (as of v2.2). Click to play.</p>
  </div>
</div>

As an example, **Video 2.1** illustrates how content transitions are used in the Google Play Games app to achieve smooth animations between activities. When the second activity starts, its enter content transition gently shuffles the user avatars into the scene from the bottom edge of the screen. When the back button is pressed, the second activity's return content transition splits the view hierarchy into two and animates each half off the top and bottom of the screen.

So far our analysis of content transitions has only scratched the surface; several important questions still remain. How are content transitions triggered under-the-hood? Which types of `Transition` objects does it make sense to use? How does the framework determine the set of transitioning views? Can a `ViewGroup` and its children be animated together as a single entity during a content transition? In the next couple sections, we'll tackle these questions one-by-one.

### Content Transitions Under-The-Hood

Recall from the [previous post][part1] that a `Transition` has two main responsibilities: capturing the start and end state of its views and creating an `Animator` that will animate the views between the two states. Content transitions are no different: before a content transition's animation can be created, the framework must give it the state information it needs by altering each transitioning view's _visibility_. More specifically, when Activity `A` starts Activity `B` the following sequence of events occurs:<sup><a href="#footnote1" id="ref1">1</a></sup>

<ol>
<li>Activity <code>A</code> calls <code>startActivity()</code>.
<ol style="list-style-type: lower-alpha;">
<li>The framework traverses <code>A</code>'s view hierarchy and determines the set of transitioning views that will exit the scene when <code>A</code>'s exit transition is run.</li>
<li><code>A</code>'s exit transition captures the start state for the transitioning views in <code>A</code>.</li>
<li>The framework sets all transitioning views in <code>A</code> to <code>INVISIBLE</code>.</li>
<li>On the next display frame, <code>A</code>'s exit transition captures the end state for the transitioning views in <code>A</code>.</li>
<li><code>A</code>'s exit transition compares the start and end state of its transitioning views and creates an <code>Animator</code> based on the differences. The <code>Animator</code> is run and the transitioning views exit the scene.</li>
</ol>
</li>
<li>Activity <code>B</code> is started.
<ol style="list-style-type: lower-alpha;">
<li>The framework traverses <code>B</code>'s view hierarchy and determines the set of transitioning views that will enter the scene when <code>B</code>'s enter transition is run and sets them all to <code>INVISIBLE</code>.</li>
<li><code>B</code>'s enter transition captures the start state for the transitioning views in <code>B</code>.</li>
<li>The framework sets all transitioning views in <code>B</code> to <code>VISIBLE</code>.</li>
<li>On the next display frame, <code>B</code>'s enter transition captures the end state for the transitioning views in <code>B</code>.</li>
<li><code>B</code>'s enter transition compares the start and end state of its transitioning views and creates an <code>Animator</code> based on the differences. The <code>Animator</code> is run and the transitioning views enter the scene.</li>
</ol>
</li>
</ol>

By toggling each transitioning view's visibility between `INVISIBLE` and `VISIBLE`, the framework ensures that the content transition will be given the state information it needs to create the desired animation. Clearly all content `Transition` objects then must at the very least be able to capture and record each transitioning view's visibility in both its start and end states. Fortunately, the abstract [`Visibility`][Visibility] class already does this work for you: subclasses of `Visibility` need only implement the [`onAppear()`][onAppear] and [`onDisappear()`][onDisappear] factory methods, in which they must create and return an `Animator` that will either animate the views into or out of the scene. As of API 21, three concrete `Visibility` implementations exist&mdash;[`Fade`][Fade], [`Slide`][Slide], and [`Explode`][Explode]&mdash;all of which can be used to create Activity and Fragment content transitions. If necessary, custom `Visibility` classes may be implemented and used as well (we will cover how this can be done in a future blog post).

### Transitioning Views & Transition Groups

Up until now, we have assumed that content transitions operate on a set of non-shared views called _transitioning views_. In this section, we will discuss how the framework determines this set of views and how it can be further customized using _transition groups_.

Before the transition starts, the framework constructs the set of transitioning views by performing a recursive search on the activity window's (or fragment's) entire view hierarchy. The search begins by calling the recursive [`ViewGroup#captureTransitioningViews`][ViewGroup#captureTransitioningViews] method on the hierarchy's root view:

```java
/** @hide */
@Override
public void captureTransitioningViews(List<View> transitioningViews) {
    if (getVisibility() != View.VISIBLE) {
        return;
    }
    if (isTransitionGroup()) {
        transitioningViews.add(this);
    } else {
        int count = getChildCount();
        for (int i = 0; i < count; i++) {
            View child = getChildAt(i);
            child.captureTransitioningViews(transitioningViews);
        }
    }
}
```

<div style="width:290px;margin-right:35px;float:right" poster="/assets/videos/posts/2014/12/05/webview-opt.png" preload="none">
  <div class="framed-nexus6-port">
  <video id="figure22" onclick="playPause('figure22')">
    <source src="/assets/videos/posts/2014/12/05/webview-opt.mp4" type="video/mp4">
    <source src="/assets/videos/posts/2014/12/05/webview-opt.webm" type="video/webm">
    <source src="/assets/videos/posts/2014/12/05/webview-opt.ogv" type="video/ogg">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Video 2.2</strong> - A simple Radiohead app that illustrates a potential bug involving transition groups and <code>WebView</code>s. Click to play.</p>
  </div>
</div>

The recursion is relatively straightforward: the framework traverses each level of the tree until it finds either a `VISIBLE` leaf view or _transition group_. By allowing us to exit the recursion early, transition groups give us a way to animate entire `ViewGroup`s as single entities during an Activity/Fragment transition. If a `ViewGroup`'s [`isTransitionGroup()`][isTransitionGroup]<sup><a href="#footnote2" id="ref2">2</a></sup> method returns `true`, then it and all of its children views will be animated together as a single element during the animation. Otherwise, the recursion will continue and the `ViewGroup`'s transitioning children views will be acted upon independently throughout the transition. The final result of the search is the complete set of transitioning views that will be animated when the content transition is run.<sup><a href="#footnote3" id="ref3">3</a></sup>

An example illustrating transition groups in action can be seen in **Video 2.1** above. During the enter transition, the user avatars shuffle into the screen independently of the others, whereas during the return transition the entire `ViewGroup` containing the user avatars is animated as one. The Google Play Games app likely uses a transition group to achieve this effect during the return transition, making it look as if the activity is splitting in half when the user navigates back.

Sometimes transition groups must also be used to fix mysterious bugs in your Activity/Fragment transitions as well. For example, consider the sample application in **Video 2.2**. The calling Activity displays a grid of Radiohead album covers and the called Activity shows a background header image, the shared album cover, and a `WebView`. During the return transition, we would like to split the view hierarchy in half similar to the Google Play Games app, sliding the header background image and `WebView` off the top and bottom of the screen respectively. However, as you can see in the video, a glitch occurs when the back button is clicked and the `WebView` fails to slide off the screen.

So why does the `WebView` stay put throughout the duration of the return animation only to abruptly disappear from the screen once the transition has finished? The problem stems from the fact that `WebView` is a `ViewGroup` and as a result is _not_ selected to be a transitioning view by default. We can easily fix this, however, by simply calling `webView.setTransitionGroup(true)` at some point before the return transition begins.

### Conclusion

This post covered three important points:

1. Content transitions determine how an Activity or Fragment's non-shared views—called transitioning views—enter or exit the scene during an Activity or Fragment transition.
2. Content transitions are triggered by changes made to its transitioning views' visibility and should almost always extend the abstract `Visibility` class as a result.
3. Transition groups allow us to animate `ViewGroup`s and custom views as a single entity during a content transition.

As always, thanks for reading! Feel free to leave a comment if you have any questions, and don't forget to +1 and/or share this blog post if you found it helpful!

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> A similar sequence of events occurs during return/reenter transitions as well, for both Activities and Fragments. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

<sup id="footnote2">2</sup> Beware of any `ViewGroup`'s in your view hierarchy with non-`null` background drawables and/or non-`null` transition names, as they will be treated as transition groups by default (as stated in the [`isTransitionGroup()`][isTransitionGroup] method's documentation). If any such views exist in your view hierarchy that you would not like to be animated as a single entity, make sure you call the view's [`setTransitionGroup(false)`][setTransitionGroup] method or else you will likely get some unexpected results. **You have been warned!** <a href="#ref2" title="Jump to footnote 2.">&#8617;</a>

<sup id="footnote3">3</sup> Note that if any views were explicitly [added][addTarget] or [excluded][excludeTarget] in the content `Transition` object, the framework will take this into account as well and will filter the set of transitioning views further if necessary. <a href="#ref3" title="Jump to footnote 3.">&#8617;</a>

  [Visibility]: https://developer.android.com/reference/android/transition/Visibility.html
  [onAppear]: https://developer.android.com/reference/android/transition/Visibility.html#onAppear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
  [onDisappear]: https://developer.android.com/reference/android/transition/Visibility.html#onDisappear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
  [Fade]: https://developer.android.com/reference/android/transition/Fade.html
  [Explode]: https://developer.android.com/reference/android/transition/Explode.html
  [Slide]: https://developer.android.com/reference/android/transition/Slide.html

  [ViewGroup#captureTransitioningViews]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L6243-L6258
  [isTransitionGroup]: https://developer.android.com/reference/android/view/ViewGroup.html#isTransitionGroup()
  [setTransitionGroup]: http://developer.android.com/reference/android/view/ViewGroup.html#setTransitionGroup(boolean)

  [setExitTransition]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [setEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [setReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [setReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)
  [Fragment#setExitTransition]: https://developer.android.com/reference/android/app/Fragment.html#setExitTransition(android.transition.Transition)
  [Fragment#setEnterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setEnterTransition(android.transition.Transition)
  [Fragment#setReturnTransition]: https://developer.android.com/reference/android/app/Fragment.html#setReturnTransition(android.transition.Transition)
  [Fragment#setReenterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setReenterTransition(android.transition.Transition)

  [addTarget]: https://developer.android.com/reference/android/transition/Transition.html#addTarget(android.view.View)
  [excludeTarget]: https://developer.android.com/reference/android/transition/Transition.html#excludeTarget(android.view.View,%20boolean)

  [Window]: http://developer.android.com/reference/android/view/Window.html
  [Fragment]: http://developer.android.com/reference/android/app/Fragment.html

  [MaterialDesignMeaningfulTransitions]: http://www.google.com/design/spec/animation/meaningful-transitions.html

  [part1]: /2014/12/activity-fragment-transitions-in-android-lollipop-part1.html
  [part2]: /2014/12/content-transitions-in-depth-part2.html
  [part3]: /2014/11/shared-element-transitions-in-depth-part3.html

