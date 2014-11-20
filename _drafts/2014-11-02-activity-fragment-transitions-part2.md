---
layout: post
title: 'Window Content Transitions In-Depth (part 2)'
date: 2014-11-02
permalink: /2014/11/window-content-transitions-in-depth-part2.html
---

This post will give an in-depth analysis of _window content transitions_ and their role in the Activity Transitions API. This is the second of a series of posts I will be writing on the topic:

* **Part 1:** <a href="/2014/11/activity-transitions-getting-started-part1.html">Getting Started with Activity Transitions</a>
* **Part 2:** {% comment %}<a href="/2014/11/window-content-transitions-in-depth-part2.html">{% endcomment %}
              Window Content Transitions In-Depth (_coming soon!_)
              {% comment %}</a>{% endcomment %}
* **Part 3:** {% comment %}<a href="/2014/11/shared-element-transitions-in-depth-part3.html">{% endcomment %}
              Shared Element Transitions In-Depth (_coming soon!_)
              {% comment %}</a>{% endcomment %}

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't fret: I'll point out the significant differences between the two as they are encountered in the post!

### What are Window Content Transitions?

<!--morestart-->

Put simply, window content transitions allow us to perform custom animations on the entering or exiting views during an Activity transition. They are often used in conjunction with shared element transitions to provide a smooth, effortless background effect. For example, as a shared element is transitioned from activity `A` to activity `B`, we could use a window content enter transition to slide activity `B`'s non-shared views into the scene, as illustrated in [Figure 1.1][Figure1.1]. Coordinating the entrance and exit of the activity's transitioning views can have a powerful effect on the user, as they create visual connections between the different UI states of your application, while not taking the focus away from the shared element as it transitions into place. (**TODO: video example?**)

<!--more-->

In the previous post, we briefly mentioned that window content [exit][setExitTransition], [enter][setEnterTransition], [reenter][setReenterTransition], and [return][setReturnTransition] transitions may be specified either programatically or in XML as part of the activity's theme.<sup><a href="#footnote1" id="ref1">1</a></sup> However, a few questions still remain. Which types of `Transition`s can be used? How does the framework determine which views will be animated during the transition? Is there a way to override the default behavior and, for example, animate a `ViewGroup` and all of its children together as a single element? In the next couple of sections, we'll begin tackling these questions one-by-one, and in doing so we'll obtain a much deeper understanding of the inner-workings of the Activity Transitions framework.

### Which types of `Transition`s can be used?

Window content transitions should almost always extend the abstract [`Visibility`][Visibility] class. To understand why, let's investigate what happens under-the-hood when an Activity Transition is occurs and a window content transition is about to be run:

1. `A` calls `startActivity()`.
    * `A`'s exit transition captures start values for the transitioning views in `A`.
    * The framework sets all transitioning views in `A` to `INVISIBLE`.
    * On the next animation frame, `A`'s exit transition captures end values for the transitioning views in `A`.
    * `A`'s exit transition compares the start and end values of its transitioning views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views exit the scene.
2. Activity `B` is started with all of its transitioning views initially set as `INVISIBLE`.
    * `B`'s enter transition captures start values for the transitioning views in `B`.
    * The framework sets all transitioning views in `B` to `VISIBLE`.
    * On the next animation frame, `B`'s enter transition captures end values for the transitioning views in `B`.
    * `B`'s enter transition compares the start and end values of its target views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views enter the scene.

Because window content transitions are triggered by view visibility changes made by the framework, the `Transition` must at the very least be able to record each view's visibility in its start and end states and create an `Animator` that will animate the views as they enter or exit the scene. Fortunately, the abstract [`Visibility`][Visibility] class already does the first half of this work for you: subclasses of `Visibility` must only implement the [`onAppear()`][onAppear] and [`onDisappear()`][onDisappear] factory methods, in which they must create and return an `Animator` that will either animate the views into or out of the scene. 

As of API 21, only three concrete `Visibility` implementations exist: `Fade`, `Slide`, and `Explode`. However, custom `Visibility` transitions can always be implemented as well. We will see an example of how this can be done in a future blog post.

### How are transitioning views selected?

Up until now, we have assumed that window content transitions operate on a set of non-shared views called _transitioning views_. In this section, we will discuss how the framework determines the set of views to be transitioned and how it can be further customized.

Before a window content transition is run, the framework must determine the set of views that will be transitioned by performing a recursive search on the activity's entire view hierarchy. The search begins by calling the window decor view's hidden [`ViewGroup#captureTransitioningViews`][ViewGroup#captureTransitioningViews] method, which recurses down the view hierarchy tree until it finds either a visible leaf view or a _transition group_. The result is the set of all views in the view hierarchy that wil be affected during the window content transition:

<div class="scrollable">
{% highlight java linenos=table %}
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
{% endhighlight %}
</div>

**TODO: quickly summarize the recursion above**

Before we move on, we should discuss the role that transition groups play during window content transitions. Transition groups allow us to animate `ViewGroup`s as single entities during an Activity Transition. If `isTransitionGroup()` returns `true`, then the `ViewGroup` and all of its children views will be acted upon as a single element during the transition, and if `false`, the `ViewGroup`'s children will be animated separately as individual elements. Note that the default value returned by [`isTransitionGroup()`][ViewGroup#isTransitionGroup] is `true` if and only if the `ViewGroup`'s background drawable and transition name are both non-`null`. (**TODO: video example?**)

### Recap

**TODO: recap**

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> For Fragment Transitions, window content [exit][Fragment#setExitTransition], [enter][Fragment#setEnterTransition], [reenter][Fragment#setReenterTransition], and [return][Fragment#setReturnTransition] transitions may also be set either programatically or as attributes in your `Fragment`' XML. <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

  [Visibility]: https://developer.android.com/reference/android/transition/Visibility.html
  [onAppear]: https://developer.android.com/reference/android/transition/Visibility.html#onAppear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
  [onDisappear]: https://developer.android.com/reference/android/transition/Visibility.html#onDisappear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)

  [View#captureTransitioningViews]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/View.java#L19351-L19362
  [ViewGroup#captureTransitioningViews]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L6243-L6258
  [ViewGroup#isTransitionGroup]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L2494-L2508
  [setExitTransition]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [setEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [setReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [setReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)
  [Fragment#setExitTransition]: https://developer.android.com/reference/android/app/Fragment.html#setExitTransition(android.transition.Transition)
  [Fragment#setEnterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setEnterTransition(android.transition.Transition)
  [Fragment#setReturnTransition]: https://developer.android.com/reference/android/app/Fragment.html#setReturnTransition(android.transition.Transition)
  [Fragment#setReenterTransition]: https://developer.android.com/reference/android/app/Fragment.html#setReenterTransition(android.transition.Transition)
  [Figure1.1]: /2014/11/activity-transitions-getting-started-part1.html#anchorfigure1

