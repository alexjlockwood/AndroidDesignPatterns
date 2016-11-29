---
layout: post
title: 'An Introduction to Icon Animation Techniques'
date: 2016-11-29
permalink: /2016/11/introduction-to-icon-animation-techniques.html
related: ['/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html',
    '/2016/08/coloring-buttons-with-themeoverlays-background-tints.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
style: |
    ol.icon_anim_table-of-contents li {
      margin: 0.25em 0;
    }
---

<link rel="stylesheet" type="text/css" href="/css/posts/2016/11/29/style.css" />
<script defer src="/scripts/bundle.js"></script>

<!--morestart-->

[Creative customization][creative-customization] is one of the most important tenets of material design. The subtle addition of a delightful icon animation can add an element of wonder to the user experience, making the app feel more natural and alive. Unfortunately, building icon animations from scratch can be challenging. Not only can it take a fair amount of work to implement, but it also requires a vision of how the final result should look and feel. If you aren't famliar with the different techniques that are most often used to create them, you're going to have a bad time designing your own.

<!--more-->

This blog post will discuss several different techniques that can be used to create beautiful icon animations. The best way to learn is by example, so as you read through the post you'll encounter interactive demos highlighting how each technique works. In doing so, I hope this blog post can at the very least open your eyes to how icon animations behave under-the-hood, because understanding they work is the first step towards creating your own.

This blog post is split into the following six sections:

<ol class="icon_anim_table-of-contents">
  <li><a href="#drawing-paths">Drawing <code>path</code>s</a></li>
  <li><a href="#transforming-groups-of-paths">Transforming <code>group</code>s of <code>path</code>s</a></li>
  <li><a href="#trimming-stroked-paths">Trimming stroked <code>path</code>s</a></li>
  <li><a href="#morphing-paths">Morphing <code>path</code>s</a></li>
  <li><a href="#clipping-paths">Clipping <code>path</code>s</a></li>
  <li><a href="#conclusion-putting-it-all-together">Conclusion: putting it all together</a></li>
</ol>

All of the icon animations in this blog post (and more) are available in `AnimatedVectorDrawable` format on [GitHub][adp-delightful-details]. 

### Drawing `path`s

Before we can begin creating animated icons, we first need to understand how they are drawn. In Android, we'll represent each icon using the relatively new [`VectorDrawable`][VectorDrawable] class. `VectorDrawable`s are similar in concept to SVGs on the web: they allow us to create scalable, density-independent assets by representing each icon as a series of lines and shapes called `path`s. Each path's shape is determined by a sequence of _drawing commands_, represented by a space/comma-separated string using a subset of the [SVG path data spec][svg-path-reference] to draw lines and curves. The spec defines many different types of commands, a few of which are summarized in the table below:

| Command             | Description |
|---------------------|-------------|
| `M x,y`             | Begin a new subpath by moving to coordinate `(x,y)`.
| `L x,y`             | Draw a line to `(x,y)`.
| `C x1,y1 x2,y2 x,y` | Draw a [cubic bezier curve][cubic-bezier-curve] to `(x,y)` using control points `(x1,y1)` and `(x2,y2)`.
| `Z`                 | Close the path by drawing a line back to the beginning of the current subpath.

At runtime, `path`s can either be drawn _filled_ or _stroked_. If the path is filled, the interiors of its entire shape will be painted. If the path is stroked, the paint will be applied along the outline of the path. Each type of `path` has its own animatable attributes that they can use to further modify their appearance:

| Property name         | Element type | Value type | Min   | Max   |
|-----------------------|--------------|------------|-------|-------|
| `android:fillAlpha`   | `<path>`     | `float`    | `0`   | `1`   |
| `android:fillColor`   | `<path>`     | `integer`  | - - - | - - - |
| `android:strokeAlpha` | `<path>`     | `float`    | `0`   | `1`   |
| `android:strokeColor` | `<path>`     | `integer`  | - - - | - - - |
| `android:strokeWidth` | `<path>`     | `float`    | `0`   | - - - |

Let's see how this all works with an example. Say we wanted to create a play, pause, and record icon for a music application. We can represent each icon using a single `path`:

```xml
<vector
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="48dp"
  android:height="48dp"
  android:viewportHeight="12"
  android:viewportWidth="12">

  <!-- This path draws an orange triangular play icon. -->
  <path
    android:fillColor="#FF9800"
    android:pathData="M 4,2.5 L 4,9.5 L 9.5,6 Z"/>

  <!-- This path draws two green stroked vertical pause bars. -->
  <path
    android:pathData="M 4,2.5 L 4,9.5 M 8,2.5 L 8,9.5"
    android:strokeColor="#0F9D58"
    android:strokeWidth="2"/>

  <!-- This path draws a red circle. -->
  <path
    android:fillColor="#DB4437"
    android:pathData="M 2,6 C 2,3.8 3.8,2 6,2 C 8.2,2 10,3.8 10,6 C 10,8.2 8.2,10 6,10 C 3.8,10 2,8.2 2,6"/>

</vector>
```

The triangular play and circular record icons are both filled `path`s with orange and red fill colors respectively. The pause icon, on the other hand, is a stroked `path` with a green stroke color and a stroke width of 2. **Figure 1** illustrates each `path`'s drawing commands executed inside to a `12x12` grid:

{% include posts/2016/11/29/includes1_drawing_paths_path_commands.html %}

As we mentioned earlier, one of the benefits of `VectorDrawable`s is that they provide _density independence_, meaning that they can be scaled arbitrarily on any device without loss of quality. This ends up being both convenient and efficient: developers no longer need to go through the tedious process of exporting different sized PNGs for each screen density, which in turn also leads to a smaller APK size. *However, in our case the reason we want to use `VectorDrawable`s is so we can animate the individual `path`s in each icon using the [`AnimatedVectorDrawable`][AnimatedVectorDrawable] class.* `AnimatedVectorDrawable`s can be thought of as the glue that connects `VectorDrawable`s with `ObjectAnimator`s: the `VectorDrawable` assigns each animated `path` (or `group` of `path`s) a unique name, and the `AnimatedVectorDrawable` maps each of these names to their corresponding `ObjectAnimator`s. As we'll see, the ability to target individual elements within a `VectorDrawable` to be animated is quite powerful.

The remainder of this blog post will cover four general techniques for creating `AnimatedVectorDrawable` icons: _transforming `group`s of `path`s_, _trimming stroked `path`s_, _morphing `path`s_, and _clipping `path`s_. We'll end the post with an example that combines all of these techniques into one last final animation.

### Transforming `group`s of `path`s

In the previous section we learned how to alter a single `path`'s appearance by directly modifying its properties, such as its opacity and color. In addition to this, `VectorDrawable`s also support _group transformations_ using the `<group>` tag. Specifically, the `<group>` tag enables us to chain together transformations on one or more `path`s using the following animatable attributes:

| Property name        | Element type | Value type |
|----------------------|--------------|------------|
| `android:pivotX`     | `<group>`    | `float`    |
| `android:pivotY`     | `<group>`    | `float`    |
| `android:rotation`   | `<group>`    | `float`    |
| `android:scaleX`     | `<group>`    | `float`    |
| `android:scaleY`     | `<group>`    | `float`    |
| `android:translateX` | `<group>`    | `float`    |
| `android:translateY` | `<group>`    | `float`    |

It is important to understand the order in which a sequence of `group` transformations will be applied. The two rules to remember are (1) children `group`s inherit the transformations applied by their parent groups, and (2) transformations made to the same `group` are applied in order of scale, rotation, and then translation. As an example, consider the following `group` transformations applied to the play, pause, and record icons discussed above:

```xml
<vector
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="48dp"
  android:height="48dp"
  android:viewportHeight="12"
  android:viewportWidth="12">

  <!-- Translate the canvas, then rotate, then scale, then draw the play icon. -->
  <group android:scaleX="1.5" android:pivotX="6" android:pivotY="6">
    <group android:rotation="90" android:pivotX="6" android:pivotY="6">
      <group android:translateX="2">
        <path android:name="play_path"/>
      </group>
    </group>
  </group>

  <!-- Rotate the canvas, then translate, then scale, then draw the pause icon. -->
  <group android:scaleX="1.5" android:pivotX="6" android:pivotY="6">
    <group
      android:rotation="90" android:pivotX="6" android:pivotY="6"
      android:translateX="2">
      <path android:name="pause_path"/>
    </group>
  </group>

  <!-- Scale the canvas, then rotate, then translate, then draw the record icon. -->
  <group android:translateX="2">
    <group
      android:rotation="90"
      android:scaleX="1.5"
      android:pivotX="6"
      android:pivotY="6">
      <path android:name="record_path"/>
    </group>
  </group>

</vector>
```

The results are shown in **Figure 2** below; toggle the checkboxes to see how the different combinations of transformations affect the final result!

{% include posts/2016/11/29/includes2_transforming_paths_demo.html %}

The ability to chain together `group` transformations makes them extremely powerful, making it possible to achieve a variety of cool effects. **Figure 3** below gives three such examples:

* The _expand/collapse icon_ is drawn using two rectangular paths. When clicked, the two paths are simultaneously rotated 90° and vertically translated to create the effect.

* The _alarm clock icon_ also draws its bells using two rectangular paths. When clicked, a `<group>` containing the two paths is rotated back and forth about the center to create a 'ringing' effect.

* The _radio button icon_ animation is one of my favorites due to its clever simplicity. The radio button is also drawn using only two paths: a filled inner dot and a stroked outer ring. When the radio button transitions between an unchecked to checked, only three attributes are animated:

    | Time  | Outer ring `strokeWidth` | Outer ring `scale{X,Y}` | Inner dot `scale{X,Y}` |
    |-------|--------------------------|-------------------------|------------------------|
    | 0     | 2                        | 1                       | 0                      |
    | 0.333 | 18                       | 0.5                     | 0                      |
    | 0.334 | 2                        | 0.9                     | 1.5                    |
    | 1     | 2                        | 1                       | 1                      |

    During the first third of the animation, the the outer ring's stroke width and scale are simultaneously increased and decreased respectively, making it look as if the outer ring is collapsing inwards towards the center---a pretty awesome effect!

{% include posts/2016/11/29/includes3_transforming_paths_animated_svgs.html %}

One last example that makes use of group transformations is the _horizontal indeterminate progress bar_. A horizontal indeterminate progress bar consists of three paths: a translucent background and two inner rectangular paths. Over the course of the animation the two inner rectangles are horizontally translated and scaled at varying degrees. Toggle the checkboxes in **Figure 4** below to see how each transformation individually contributes to the final result!

{% include posts/2016/11/29/includes4_transforming_paths_indeterminate_progress.html %}

### Trimming stroked `path`s

A lesser known property of stroked paths is that they can be _trimmed_. Given a stroked path, we can choose to show only a portion of the path before having it drawn to the display. In Android, this is done using the following animatable attributes:

| Property name            | Element type | Value type | Min | Max |
|--------------------------|--------------|------------|-----|-----|
| `android:trimPathStart`  | `<path>`     | `float`    | `0` | `1` |
| `android:trimPathEnd`    | `<path>`     | `float`    | `0` | `1` |
| `android:trimPathOffset` | `<path>`     | `float`    | `0` | `1` |

`trimPathStart` determines where the visible portion of the path will begin, while `trimPathEnd` determines where the visible portion of the path will end. An additional `trimPathOffset` may also be added to the start and end values if needed. **Figure 5** demonstrates how this all works. Update the sliders to see how different values affect what is drawn to the display! Note that it is perfectly fine for `trimPathStart` to greater than `trimPathEnd`; if this occurs, the visible portion of the path simply wraps around the end of the segment back to the beginning.

{% include posts/2016/11/29/includes5_trimming_stroked_paths_demo.html %}

The ability to animate these three properties opens up a world of possibilities. **Figure 6** below shows four examples that animates these attributes in order to achieve some pretty cool effects:

* The _fingerprint icon_ consists of 5 stroked paths, each with their trim path start and end values initially set to `0` and `1` respectively. When hidden, the difference is quickly animated to `0` until the icon is no longer visible, and then back to `1` when the icon is shown once again. The _cursive handwriting icon_ behaves similarly, except instead of animating the individual paths all at once, they are animated sequentially as if the word was being written out by hand.

* The _search to back icon_ uses a clever combination of trim path animations in order to seamlessly transition between the stem of the search icon and the stem of a back arrow. Enable the 'show trim paths' checkbox and you'll see how the changing `trimPathStart` and `trimPathEnd` values affect the relative location of the stem as it animates to its new state. Enable the 'slow animation' checkbox and you'll also notice that the visible length of the stem changes over time: it expands slightly at the beginning and shrinks towards the end, creating a subtle 'stretching' effect that feels more natural. Creating this effect is actually quite easy: we simply begin animating one of the trims with a short start delay to make it look like one end of the path is animating faster than the other.

* Each animating digit in the _Google IO 2016 icon_ consists of 4 paths, each with a different stroke color and each with trim path start/end values covering a quarter of the digit's total length. The `trimPathOffset` is then animated from `0` to `1` in a loop in order to create the effect.

{% include posts/2016/11/29/includes6_trimming_stroked_paths_animated_svgs.html %}

Finally, **Figure 7** shows how a stroked trim path is used to animate the familiar circular indeterminate progress bar. The icon consists of a single, circular stroked path and animates the following three properties:

1. The progress bar is rotated from 0° to 720° over the course of 4444ms.

2. The progress bar's trim path offset is animated from `0` to `0.25` over the course of 1333ms.

3. Portions of the progress bar's circular path are trimmed over the course of 1333ms. Specifically, over the course of the animation they animate through the following values:

    | Time | `trimPathStart` | `trimPathEnd` | `trimPathOffset` |
    |------|-----------------|---------------|------------------|
    | 0    | 0               | 0.03          | 0                |
    | 0.5  | 0               | 0.75          | 0.125            |
    | 1    | 0.75            | 0.78          | 0.25             |

    At time `t = 0.0` and `t = 1.0`, the progress bar is at it's smallest size (only 3% is visible). At `t = 0.5`, the progress bar has stretched to its maximum size (75% is visible). And at time `t = 1.0`, the progress bar has shrunk back to its smallest size and restarts the animation.

{% include posts/2016/11/29/includes7_trimming_stroked_paths_indeterminate_progress.html %}

### Morphing `path`s

The most advanced icon animation technique we'll cover in this post is path morphing. Currently only supported on Android 5.0 and above, path morphing allows us to seamlessly transform the *shapes* of two paths by animating the differences in their drawing commands, specified by their `android:pathData` attributes. With path morphing, we can transform a plus sign into a minus sign, a play icon into a pause icon, or even an overflow icon into a back arrow, as seen in **Figure 8** below.

| Property name      | Element type | Value type |
|--------------------|--------------|------------|
| `android:pathData` | `<path>`     | `string`   |

The first thing to consider when implementing a path morphing animation is whether or not the paths you want to morph are *compatible*. In order to morph path `A` into path `B` the following conditions must be met:

1. `A` and `B` have the same number of drawing commands.
2. The `i`-th drawing command in `A` must be the same type as the `i`-th drawing command in `B`, for all `i`.
3. The `i`-th drawing command in `A` must have the same number of parameters as the `i`-th drawing command in `B`, for all `i`.

If any of these conditions aren't met (i.e. attempting to morph an `L` command into a `C` command, or a `C` into a `c`, etc.), the application will crash with an exception. The reason these rules must be enforced is due to the way path morphing animations are implemented under-the-hood. Before the animation begins, the framework extracts the command types and coordinates from each path's `android:pathData` attribute. If the conditions above are met, then the framework can assume that the only difference between the two paths are the values of the coordinates embedded in their drawing command strings. As a result, on each new display frame the framework can execute the same sequence of drawing commands on each new display frame, re-calculating the values of the coordinates to use based on the current progress of the animation. **Figure 8** illustrates this concept nicely. First disable 'animate rotation', then enable the 'show path control/end points' and 'slow animation' checkboxes below. Notice how the red coordinates change during the course of the animation: they travel a straight line from their starting positions in path `A` to their ending positions in path `B`. It's really that simple!

{% include posts/2016/11/29/includes8_morphing_paths_animated_svgs.html %}

Path morphing animations are known for often being tedious and time-consuming to implement. Often times you'll need to tweak the start and end paths by hand in order to make them compatible to be morphed, which, depending on the complexity of the paths, is where most of the work will be spent. To help facilitate the process, here are several tips and tricks that I've found helpful in getting started:

* Adding *dummy coordinates* is often necessary in order to make a simple path compatible with a more complex path. Dummy coordinates were added to nearly all of the examples above. Consider the plus-to-minus animation, for example. We could draw a rectangular minus path using only drawing commands. However, drawing the more complex plus path requires at least 12 drawing commands, so in order to make the two paths compatible we must add 8 additional noop drawing commands to the simpler minus path. Compare the two paths' [drawing command strings][PlusMinusPathCommands] and see if you can identify the added dummy coordinates yourself!

* A cubic bezier curve command will draw a straight line if its two control points lie on the straight line connecting its start and end points. This can be useful to know if you ever need to morph an `L` command into a `C` command (which was the case in the overflow-to-arrow and animating digit examples above). It is also possible to estimate an [elliptical arc command][EllipticalArcCommand] using one or more cubic bezier curves, as I previously discussed [here][ConvertEllipticalArcToBezierCurve]. This can also be useful to know if you ever find yourself in a situation where you need to morph a `C` command into an `A` command.

* Sometimes morphing one path into another looks awkward no matter how you do it. In my experience, I've found that adding an 180° or 360° degree rotation to the animation often makes things look significantly better: it distracts the eye from the morphing paths and adds a layer of motion that makes the animation seem more responsive to user touch.

* Remember that path morphing animations are ultimately determined by the relative positioning of the two paths' drawing command coordinates. For best results, try to minimize the distance each coordinate has to travel over the course of the animation. The longer the distance each coordinate has to travel, the more distracting the path morphing animation will usually become.

### Clipping `path`s

The last technique we'll cover involves animating the bounds of a `<clip-path>`. A clip path restricts the region to which paint can be applied to the canvas---anything that lies outside of the region bounded by a clip path will not be drawn. By animating the bounds of these regions, we can create some cool effects, as we'll see below.

| Property name      | Element type  | Value type |
|--------------------|---------------|------------|
| `android:pathData` | `<clip-path>` | `string`   |

A `<clip-path>`'s bounds can be animated via path morphing by animating the differences in its path commands specified in the `android:pathData` attribute. Take a look at the examples in **Figure 9** below to get a better idea of how these animations work. Enabling the 'show clip paths' checkbox will show the bounds of the currently active `<clip-path>` as a red overlay mask, which in turn dictates the portions of its sibling `<path>`s that will be drawn. Clip path are especially useful for animating fill effects, as you can see in the hourglass and heart fill/break examples below.

{% include posts/2016/11/29/includes9_clipping_paths_animated_svgs.html %}

### Conclusion: putting it all together

If you've made it this far in the blog post, that means you now have all of the fundamental building blocks you need in order to design your own icon animations from scratch! To celebrate, let's combine all of the techniques discussed in this post into one last kickass example! The progress icon in **Figure 10** animates the following five properties:

1. Stroke width (during the progress indicator to check mark animation).
2. Translation and rotation (at the beginning to create the 'bouncing arrow' effect).
3. Trim path start/end (at the beginning to create the 'bouncing line' effect, and at the end when transitioning from the progress bar to the check mark).
4. Path morphing (at the end while transitioning the check mark back into an arrow).
5. Clip path (vertically filling the contents of the downloading arrow to indicate indeterminate progress).

{% include posts/2016/11/29/includes10_downloading_animated_svgs.html %}

Thanks for reading! Remember to +1 this blog or leave a comment below if you have any questions. And remember that all of the icon animations in this blog post (and more) are available in `AnimatedVectorDrawable` format on [GitHub][adp-delightful-details]. Feel free to steal them for your own application if you want! :)

### Reporting bugs & feedback

If you notice a glitch in one of the animated demos on this page, please report them [here][alexjlockwood.github.io-new-bug]. I only began learning Javascript a few weeks ago so I wouldn't be surprised if I made a mistake somewhere along the line. I want this blog post to be perfect, so I'd really appreciate it! :)

### Special thanks

I'd like to give a **huge** thanks to [Nick Butcher][NickButcherGooglePlus], because I probably would never have written this blog post without his help and advice! Several of the animations in this blog post were borrowed from his amazing open source application [Plaid][plaid-source-code], which I highly recommend you check out if you haven't already. I'd also like to thank [Roman Nurik][RomanNurikGooglePlus] for his [Android Icon Animator][AndroidIconAnimator] tool and for inspiring the path morphing animations in the final example in this blog post. Finally, I'd like to thank [Sriram Ramani][SriramRamani] for his [blog post on number tweening][NumberTweeningBlogPost], which inspired the animated digits demo in **Figure 8**. Thanks again!

  [adp-delightful-details]: https://github.com/alexjlockwood/adp-delightful-details
  [svg-path-reference]: http://www.w3.org/TR/SVG11/paths.html#PathData
  [cubic-bezier-curve]: https://en.wikipedia.org/wiki/B%C3%A9zier_curve
  [RomanNurikGooglePlus]: https://plus.google.com/+RomanNurik
  [NickButcherGooglePlus]: https://plus.google.com/+NickButcher
  [VectorDrawable]: https://developer.android.com/reference/android/graphics/drawable/VectorDrawable.html
  [AnimatedVectorDrawable]: https://developer.android.com/reference/android/graphics/drawable/AnimatedVectorDrawable.html
  [creative-customization]: https://material.google.com/motion/creative-customization.html
  [alexjlockwood.github.io-new-bug]: https://github.com/alexjlockwood/alexjlockwood.github.io/issues/new
  [adp-delightful-details-new-bug]: https://github.com/alexjlockwood/adp-delightful-details/issues/new
  [plaid-source-code]: https://github.com/nickbutcher/plaid
  [AndroidIconAnimator]: https://romannurik.github.io/AndroidIconAnimator/
  [SriramRamani]: https://sriramramani.wordpress.com/
  [NumberTweeningBlogPost]: https://sriramramani.wordpress.com/2013/10/14/number-tweening/
  [PlusMinusPathCommands]: https://github.com/alexjlockwood/adp-delightful-details/blob/master/app/src/main/res/values/pathmorph_plusminus.xml
  [ConvertEllipticalArcToBezierCurve]: https://plus.google.com/+AlexLockwood/posts/1q26J7qqkTZ
  [EllipticalArcCommand]: https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
