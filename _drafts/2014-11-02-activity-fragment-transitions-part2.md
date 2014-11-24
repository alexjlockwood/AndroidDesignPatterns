---
layout: post
title: 'Window Content Transitions In-Depth (part 2)'
date: 2014-11-02
permalink: /2014/11/window-content-transitions-in-depth-part2.html
---

This post will give an in-depth analysis of _window content transitions_ and their role in the Activity Transitions API. This is the second of a series of posts I will be writing on the topic. Make sure you have read [part 1][part1] before you start reading this post!

* **Part 1:** [Getting Started with Activity Transitions][part1]
* **Part 2:** {% comment %}[{% endcomment %}
              Window Content Transitions In-Depth (_coming soon!_)
              {% comment %}][part2]{% endcomment %}
* **Part 3:** {% comment %}[{% endcomment %}
              Shared Element Transitions In-Depth (_coming soon!_)
              {% comment %}][part3]{% endcomment %}

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't worry: I'll point out the significant differences between the two as they are encountered in the posts!

Let's start by defining the term and illustrating a real-world example.

### What are Window Content Transitions?

<!--morestart-->

In the [previous post][part1], recall that we briefly introduced _window content transitions_ as follows:

> A _window content transition_ determines how an activity's non-shared views&mdash;called _transitioning views_&mdash;enter or exit the activity scene.

In other words, window content transitions allow us to perform custom animations on the entering or exiting views during an Activity transition, making the act of switching between application screens a smooth and effortless process. Coordinating the entrance and exit of an activity's transitioning views can have a powerful impact on the user, especially when coupled with shared element transitions. Animating the entrance and exit of each activity's views helps us create visual connections between the different UI states, providing a seamless background effect as the activity's shared elements transition into place.

<!--more-->

<div style="width:290px;margin-right:35px;float:right">
  <div class="framed-nexus6-port">
  <video id="figure21" onclick="playPause('figure21')">
    <source src="/assets/videos/posts/2014/11/02/games-opt.mp4">
  </video>
  </div>
  <div style="font-size:10pt;margin-left:20px;margin-bottom:30px">
    <p class="img-caption" style="margin-top:3px;margin-bottom:10px;text-align: center;"><strong>Figure 2.1</strong> - Window content transitions in the Google Play Games app (as of v2.1.17). Click to play.</p>
  </div>
</div>

**Figure 2.1** illustrates how window content transitions are used in the Google Play Games app to achieve smooth, seamless transitions between activities. The first thing you'll probably notice when you play the video is the shared element transition, which animates the game's background image across activities while clipping it yellow with a beautiful circular reveal effect. Window content transitions, however, also play a role. For example, when the second activity starts, notice how its window content enter transition subtly animates the users into the scene from the bottom edge of the screen. When the back button is pressed, you'll also notice the window content return transition, which splits the view hierarchy into two and animates each half off the top and bottom of the screen respectively.

In [part 1][part1], we gave a quick summary of how window content transitions can be used in your own applications. However, several important questions still remain. How do window content transitions work under-the-hood? Which types of `Transition` objects does it make sense to use? How does the framework determine the set of transitioning views that will be animated? Is it possible animate a `ViewGroup` and its children as a single element during the transition? In the next section, we'll begin tackling these questions one-by-one.

### Window Content Transitions Under-The-Hood

Perhaps the most important thing to understand about window content transitions is that they are governed by `View`-visibility changes and should almost always extend the abstract [`Visibility`][Visibility] class as a result. To understand what this means, let's investigate the sequence of events that occurs under-the-hood when activity `A` starts activity `B`:

* `A` calls `startActivity()`.
    1. The framework determines the set of transitioning views that will exit the scene when `A`'s exit transition is run.
    2. `A`'s exit transition captures start values for the transitioning views in `A`.
    3. The framework sets all transitioning views in `A` to `INVISIBLE`.
    4. On the next animation frame, `A`'s exit transition captures end values for the transitioning views in `A`.
    5. `A`'s exit transition compares the start and end values of its transitioning views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views exit the scene.
* Activity `B` is started.
    1. The framework determines the set of transitioning views that will enter the scene when `B`'s enter transition is run and sets them all to `INVISIBLE`.
    2. `B`'s enter transition captures start values for the transitioning views in `B`.
    3. The framework sets all transitioning views in `B` to `VISIBLE`.
    4. On the next animation frame, `B`'s enter transition captures end values for the transitioning views in `B`.
    5. `B`'s enter transition compares the start and end values of its target views and creates an `Animator` based on the differences. The `Animator` is run and the transitioning views enter the scene.

Recall from the [previous post][part1] that a `Transition`'s two main responsibilities are to capturing the start and end state of its views and creating an `Animator` based on the differences. As can be seen above, with window content transitions the difference will always be that the view's visibility was toggled by the framework: either the view started out `INVISIBLE` and ended up `VISIBLE` or vice versa. As a result, a window content `Transition` object at the very least must be able to record each view's visibility in its start and end states and create an `Animator` that will animate the views as they enter or exit the scene.

Fortunately, the abstract [`Visibility`][Visibility] class already does the first half of this work for you: subclasses of `Visibility` must only implement the [`onAppear()`][onAppear] and [`onDisappear()`][onDisappear] factory methods, in which they must create and return an `Animator` that will either animate the views into or out of the scene. As of API 21, three concrete `Visibility` implementations exist: [`Fade`][Fade], [`Slide`][Slide], and [`Explode`][Explode]. Writing custom `Visibility` transitions will be covered in a future blog post.

### Transitioning Views & Transition Groups

Up until now, we have assumed that window content transitions operate on a set of non-shared views called _transitioning views_. In this section, we will discuss how the framework determines the set of views to be transitioned and this default selection can be further customized using _transition groups_.

The framework constructs the set of transitioning views early on in the process by performing a recursive search on the window's entire view hierarchy. The search is first initiated by calling the recursive [`ViewGroup#captureTransitioningViews`][ViewGroup#captureTransitioningViews] method on the window's decor view. The source code for the search (shown below) is fairly straightforward. The framework simply recurses down each level of the tree until it finds either a visible leaf view or a [transition group][isTransitionGroup] and adds them to a list. Finally, if any views were explicitly [added][addTarget] or [excluded][excludeTarget] in the `Transition` object, the framework takes them into account and filters the list accordingly. The final result is a collection of all views in the view hierarchy that will be animated during the window content transition.

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

At this point, you are probably wondering what specific role do transition groups provide in this case. Put simply, transition groups allow us to animate `ViewGroup`s as single entities during an Activity Transition. If a `ViewGroup`'s [`isTransitionGroup()`][isTransitionGroup] method returns `true`, then the `ViewGroup` will be added to the list of transitioning views and all of its children views will be animated together as a single element during the animation. Otherwise, the recursion will continue and the `ViewGroup`'s transitioning children views will be acted upon independently throughout the transition.<sup><a href="#footnote1" id="ref1">1</a></sup>

As an example, take a look once again at the window content transitions in **Figure 2.1** above. Notice how the user avatar elements animate into the screen individually during the enter transition, but exit the scene together with their parent `ViewGroup` during the return transition. In order to achieve this effect, the Google Play Games app sets the parent `ViewGroup` to be a transition group _only_ during the return transition, making it appear as if the activity is splitting in half when the user navigates back.

### Conclusion

In this post we learned blah and blah. In the next post we will learn blah. Don't forget to +1 this post if you enjoyed it and leave a comment below blah blah blah.

<hr class="footnote-divider"/>
<sup id="footnote1">1</sup> Beware of any `ViewGroup`'s in your view hierarchy with non-`null` background drawables and/or non-`null` transition names, as they will be treated as transition groups by default (as stated in the `isTransitionGroup()` method's [documentation][isTransitionGroup]). If any such views exist in your view hierarchy that you would not like to be animated as a single entity, make sure you call the view's `setTransitionGroup(false)` method or else you will likely get some unexpected results. **You have been warned!** <a href="#ref1" title="Jump to footnote 1.">&#8617;</a>

  [Visibility]: https://developer.android.com/reference/android/transition/Visibility.html
  [onAppear]: https://developer.android.com/reference/android/transition/Visibility.html#onAppear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
  [onDisappear]: https://developer.android.com/reference/android/transition/Visibility.html#onDisappear(android.view.ViewGroup,%20android.transition.TransitionValues,%20int,%20android.transition.TransitionValues,%20int)
  [Fade]: https://developer.android.com/reference/android/transition/Fade.html
  [Explode]: https://developer.android.com/reference/android/transition/Explode.html
  [Slide]: https://developer.android.com/reference/android/transition/Slide.html

  [ViewGroup#captureTransitioningViews]: https://github.com/android/platform_frameworks_base/blob/lollipop-release/core/java/android/view/ViewGroup.java#L6243-L6258
  [isTransitionGroup]: https://developer.android.com/reference/android/view/ViewGroup.html#isTransitionGroup()

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

  [part1]: /2014/11/activity-transitions-getting-started-part1.html
  [part2]: /2014/11/window-content-transitions-in-depth-part2.html
  [part3]: /2014/11/shared-element-transitions-in-depth-part3.html

