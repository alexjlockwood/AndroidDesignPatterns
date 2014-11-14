---
layout: post
title: 'Activity & Fragment Transitions in Android Lollipop (part 2)'
date: 2014-11-02
permalink: /2014/11/activity-fragment-transitions-android-lollipop-part2.html
---

Introduction paragraph.

<!--more-->


### Getting Started with Activity Transitions

**TODO: introduction to the API?**

### Key Concepts to Understand about Activity Transitions

Now that we've seen what happens under-the-hood, there are a few key concepts that are important to understand before we begin writing the actual code.

* <b>The activity's view hierarchy must finish its layout before the transition begins.</b> If the transition begins before then, the transition will not have all of the information it needs to perform the animation (i.e. the start and/or end values will be missing), and the transition will appear to break. To get around this, a common pattern will be to postpone the activity’s transition by calling `postponeEnterTransition()`. When you know for certain that the activity has finished its layout, simply call `startPostponedEnterTransition()`. A good place to call `startPostponedEnterTransition()` is in an `onPreDraw` listener. For example,

    ```java
    view.getViewTreeObserver().addOnPreDrawListener(new ViewTreeObserver.OnPreDrawListener() {
        @Override
        public boolean onPreDraw() {
            view.getViewTreeObserver().removeOnPreDrawListener(this);
            startPostponedEnterTransition();
            return true;
        }
    });
    ```

    where `view` is a `View` that might take a couple extra layout passes before its final end values are set.

* <b>Shared elements are not actually "shared".</b> When you look at a shared element transition, you might think that what you are seeing is a single `View` object animating out of its activity and into its resting location within the new activity. _This is not the case._ What actually happens is the called Activity starts out translucent. One of the first things the framework does is it adds the shared elements to the translucent Activity and repositions them to match the view’s initial position inside the calling Activity and sets the view inside the calling Activity to `INVISIBLE`. When the transition begins, the shared element will appear to transition seamlessly from one Activity to another (but really what happens is the shared element is simply animating inside the called Activity, which gradually animates from translucent to fully opaque).

* <b>By default, shared elements are drawn on top of the view hierarchy in a `ViewOverlay`.</b> This default behavior ensures that the shared elements will always be the central focus of the Activity transition, as it makes it impossible for non-shared elements&mdash;in both the called and calling Activity's view hierarchies&mdash;to accidentally draw on top of the views that are being shared across Activities. This default behavior can be disabled in your theme's XML or programatically by calling [`Window#setSharedElementsUseOverlay(false)`][setSharedElementsUseOverlay]. **TODO: also discuss the potential side-effects of disabling the overlay? Link to G+ post about covering up the system UI?**

* <b>You can further customize your shared element transitions by setting a [`SharedElementCallback`][SharedElementCallback].</b> Understanding the SharedElementCallback class will be important if you want to implement custom Transitions that are more complicated than simply moving an image from one location to another. In particular, the following three callback methods are very important to understand when writing more complex shared element transitions:

    - `onMapSharedElements()` lets you adjust the mapping of shared element names to Views. **TODO: more detail.**
    - `onSharedElementStart()` and `onSharedElementEnd()` let you adjust view properties in your layout immediately before the transitions capture their start and end values respectively. **TODO: more detail.**

* <b>Return and reenter transitions default to the enter and exit transitions respectively.</b> **TODO: keep this part?**

* <b>By default, the exit and enter transitions overlap.</b> **TODO: keep this part?**

* <b>Need to request window activity transition feature if not using material theme.</b> **TODO: keep this part?**

In the next few blog posts, I will give detailed examples of how transitions should and can be used to achieve some cool effects in your applications.

  [setSharedElementsUseOverlay]: https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)
  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html


