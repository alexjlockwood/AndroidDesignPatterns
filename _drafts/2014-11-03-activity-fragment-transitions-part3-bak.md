This post focuses on shared element transitions. This is the second of a series of posts I will be writing about Activity Transitions:

* **Part 1:** <a href="/2014/11/activity-transitions-getting-started-part1.html">Getting Started with Activity Transitions</a>
* **Part 2:** Window Content Transitions In-Depth (_coming soon!_)
* **Part 3:** Shared Element Transitions In-Depth (_coming soon!_)

Note that although Activity Transitions will be the primary focus of these posts, much of the information also applies to Fragment Transitions as well. For those of you who are working with the Fragment Transition APIs, don't fret: I'll point out the significant differences between the two as they are encountered in the post!

**TODO: write sentence transitioning into next section...**

### Shared Element Transitions

<!--morestart-->

Shared element transitions determine how an activity's _shared elements_ (also called _hero views_) are animated from one activity to another when an Activity Transition occurs. (**TODO: for example...**) Material-themed applications have their shared element exit and enter transitions set to [`@android:transition/move`][Move] by default. If necessary, you can specify your own [exit][setSharedElementExitTransition], [enter][setSharedElementEnterTransition], [return][setSharedElementReturnTransition], and [reenter][setSharedElementReenterTransition] shared element transitions as well, either programatically or in XML as part of the activity's theme.

Shared element transitions are initiated by altering each view's size and location on the screen. To understand what this means, let's see what happens under-the-hood when activity `A` starts activity `B`:

<!--more-->

1. `A` calls `startActivity()`.
2. `A`'s shared element exit transition captures start values for the shared elements in `A`.
3. The shared elements in `A` are modified to match their final resting position in `A`.
4. On the next animation frame, `A`'s exit transition captures end values for all of the shared elements in `A`.
5. `A`'s shared element exit transition compares the start and end values of its shared element views and creates an `Animator` based on the differences. The `Animator` is run and the shared elements animate into place.
6. The shared elements are positioned in `B` to match their end values in `A`.
7. `B`'s shared element enter transition captures start values for all of the shared elements in `B`.
8. All of the shared elements in `B` are repositioned to match their end values.
9. On the next animation frame, `B`'s shared element enter transition captures end values for all of the shared elements in `B`.
10. `B`'s shared element enter transition compares the start and end values of its shared element views and creates an `Animator` based on the differences. The `Animator` is run and the shared elements animate into place.

Whereas window content transitions are governed by changes to view visibility, shared element transitions must listen for and react to a view's location and size. As a result, the `ChangeBounds`, `ChangeTransform`, `ChangeClipBounds`, and `ChangeImageTransform` transitions are usually good options to use; in fact, you will probably find that sticking with the default [`@android:transition/move`][Move] transition will work fine in most cases.

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

* <b>Need to request window activity transition feature if not using material theme.</b> **TODO: keep this part?**

In the next few blog posts, I will give detailed examples of how transitions should and can be used to achieve some cool effects in your applications.

* **TODO: write footnote saying a similar under-the-hood process occurs in the opposite direction when `B` returns to `A`**
* **TODO: explain why exit/reenter transitions are usually not necessary when animating shared elements.**

  [setSharedElementsUseOverlay]: https://developer.android.com/reference/android/view/Window.html#setSharedElementsUseOverlay(boolean)
  [SharedElementCallback]: https://developer.android.com/reference/android/app/SharedElementCallback.html

  [setExitTransition]: https://developer.android.com/reference/android/view/Window.html#setExitTransition(android.transition.Transition)
  [setEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setEnterTransition(android.transition.Transition)
  [setReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setReturnTransition(android.transition.Transition)
  [setReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setReenterTransition(android.transition.Transition)

  [setSharedElementExitTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementExitTransition(android.transition.Transition)
  [setSharedElementEnterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementEnterTransition(android.transition.Transition)
  [setSharedElementReturnTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReturnTransition(android.transition.Transition)
  [setSharedElementReenterTransition]: https://developer.android.com/reference/android/view/Window.html#setSharedElementReenterTransition(android.transition.Transition)

