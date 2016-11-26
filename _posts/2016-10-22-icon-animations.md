---
layout: post
title: 'Introduction to Icon Animations'
date: 2016-10-22
permalink: /2016/10/icon-morphing.html
related: ['/2015/01/activity-fragment-shared-element-transitions-in-depth-part3a.html',
    '/2016/08/coloring-buttons-with-themeoverlays-background-tints.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<link rel="stylesheet" type="text/css" href="/css/posts/2016/10/22/style.css" />
<script defer src="/scripts/posts/2016/10/22/web-animations.min.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-data-polyfill.js"></script>
<script defer src="/scripts/posts/2016/10/22/animated-icon-demos.js"></script>

<!--morestart-->

Have you ever noticed a subtle icon animation in your favorite app and wondered how it worked? I know I have. [Creative customization][creative-customization] is a tenet of material design, and incorporating meaningful motion and subtle transitions between states can help inch your way towards a pixel-perfect user experience. It gives you an opportunity to add personality to your app, adding an element of wonder to user interactions and making it feel more natural and alive.

Unfortunately, **being creative is hard**. Building an icon animation from scratch requires not only a fair amount of engineering effort but also a vision of how the final product should look and feel. You could be the best programmer the world has ever seen, and yet if you don't have the design tools that make it possible to seamlessly animate icons from one state to another, you're going to have a bad time.

<!--more-->

In this blog post, I'll discuss several techniques and strategies that are used to create beautiful icon animations. The best way to learn is by analyzing existing examples, so each section is accompanied with several interactive icon animations which highlight how they work. This blog post won't teach you everything you need to know, but I hope it will make you see icon animations for what they are and will hopefully get you started on the right path towards creating your own!

All of the icon animations in this blog post (and more) are available in `AnimatedVectorDrawable` format on [GitHub][adp-delightful-details]. 

### Drawing `path`s

Before we can begin to create animated icons, we must first understand how they are drawn. In this blog post, we'll make heavy use of a relatively new class in Android called [`VectorDrawable`][VectorDrawable]s. `VectorDrawable`s are similar in concept to SVGs on the web: they allow us to create density independent assets by representing each icon as a series of lines and shapes called `path`s. Each path's shape is determined by a sequence of _drawing commands_, represented as a space/comma-separated string that uses a subset of the [SVG path data spec][svg-path-reference] to draw lines and curves. The spec defines many different types of commands; however, the ones you'll likely encounter the most are summarized in the table below: 

| Command             | Description |
|---------------------|-------------|
| `M x,y`             | Begin a new subpath by moving to coordinate `(x,y)`.
| `L x,y`             | Draw a line to `(x,y)`.
| `C x1,y1 x2,y2 x,y` | Draw a [cubic bezier curve][cubic-bezier-curve] to `(x,y)` using control points `(x1,y1)` and `(x2,y2)`.
| `Z`                 | Close the path by drawing a line back to the beginning of the current subpath.

Paths can either be filled or stroked. If the path is filled, the interiors of its shape will be painted. If the path is stroked, the paint will be applied along the outline of the path. A path's color and overall appearance can be further modified using the following 5 animatable properties:

| Property name         | Element type | Value type | Min value | Max value |
|-----------------------|--------------|------------|-----------|-----------|
| `android:fillAlpha`   | `<path>`     | `float`    | `0`       | `1`       |
| `android:fillColor`   | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeAlpha` | `<path>`     | `float`    | `0`       | `1`       |
| `android:strokeColor` | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeWidth` | `<path>`     | `float`    | `0`       | - - -     |

Let's see how this all works with an example. Say we wanted to create a play, pause, and record icon for a music application. We can do so by defining three separate `path`s:

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

The triangular play and circular record icons are both filled paths with orange and red fill colors respectively. The pause icon, on the other hand, is a stroked path with a green stroke color and a stroke width of 2. Each path's drawing commands are executed with respect to a `12x12` grid:

{% include posts/2016/10/22/includes1_drawing_paths_path_commands.html %}

As we mentioned above, one of the benefits of `VectorDrawable`s is that they provide _density independence_, meaning that they can be scaled arbitrarily on any screen without loss of quality. This ends up being both convenient and efficient: developers no longer need to go through the tedious process of exporting different sized PNGs for each screen density, which in turn also leads to a smaller APK size. However, the main reason for using `VectorDrawable`s in our case is that they'll enable us to animate the individual `path`s that make up each icon using the [`AnimatedVectorDrawable`][AnimatedVectorDrawable] class. `AnimatedVectorDrawable`s can be thought of as the glue that connects a `VectorDrawable` and one or more `ObjectAnimator`s: the `VectorDrawable` defines a series of uniquely named paths (or groups of paths), and the `AnimatedVectorDrawable` maps the parts of the icon that should be animated to their corresponding `ObjectAnimator`s. As we'll see, the ability to target individual elements to be animated within a `VectorDrawable` is quite powerful.

In the remainder of this blog post, we'll go over four techniques that are used to create icon animations: _transforming `group`s of `path`s_, _trimming stroked `path`s_, _morphing `path`s_, and _clipping `path`s_. We'll end the post with one last epic icon animation that combines all of the techniques into one.

### Transforming `group`s of `path`s

Paths can also be transformed using the `<group>` tag. Multiple paths can belong to a group. Groups support the following transformation types, all of which are animatable. Note that the pivot determines the center point with which to perform a scale and/or rotation.

| Property name        | Element type | Value type |
|----------------------|--------------|------------|
| `android:pivotX`     | `<group>`    | `float`    |
| `android:pivotY`     | `<group>`    | `float`    |
| `android:rotation`   | `<group>`    | `float`    |
| `android:scaleX`     | `<group>`    | `float`    |
| `android:scaleY`     | `<group>`    | `float`    |
| `android:translateX` | `<group>`    | `float`    |
| `android:translateY` | `<group>`    | `float`    |

It is particularly important to understand the order in which transformations are applied because it can seem a little backwards at first. The two rules to remember are (1) children groups are transformed before their parent groups, and (2) transformations that are made on the same group are applied in order of scale, rotation, and then translation. As an example, consider the group transformations applied to the play, pause, and record icons discussed above:

```xml
<vector
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="48dp"
  android:height="48dp"
  android:viewportHeight="12"
  android:viewportWidth="12">

  <!-- Translate the canvas, then rotate, then scale, then draw the play icon. -->
  <group android:scaleX="1.5" android:pivotX="6" android:pivotY="6" >
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

In each scenario, the following will be displayed to the screen. Make sure you understand how the different orderings of the groups affect how each icon ends up being displayed.

{% include posts/2016/10/22/includes2_transforming_paths_demo.html %}

Transformations are widely used to animate icons. **Figure 3** shows three examples of icons that depend on group transformations in order to be animated.

* The _expand/collapse icon_ is drawn using two paths. When clicked, the two straight lines are simultaneously rotated 90° and a `<group>` containing the two paths is vertically translated in order to create the effect.

* The _alarm clock icon_ draws its bells using two rectangular paths. When clicked, a `<group>` containing the two paths is repeatedly rotated about the center in order to create the alarm clock ringing effect.

* The _radio button icon_ animation is one of my favorites because of its clever simplity. The radio button is drawn using two paths: a filled inner dot and a stroked outer ring. Perhaps surprisingly, only two properties need to be animated. For example, in order to animate from an unchecked to checked state:

    | Time  | Outer ring `strokeWidth` | Outer ring `scale{X,Y}` | Inner dot `scale{X,Y}` |
    |-------|--------------------------|-------------------------|------------------------|
    | 0     | 2                        | 1                       | 0                      |
    | 0.333 | 18                       | 0.5                     | 0                      |
    | 0.334 | 2                        | 0.9                     | 1.5                    |
    | 1     | 2                        | 1                       | 1                      |

    The part I like the best is during `0 <= t <= 0.333`, where the outer ring's stroke width and scale are simultaneously increased and decreased respectively, making it look as if the outer ring is collapsing inwards toward the center. A pretty awesome effect!

{% include posts/2016/10/22/includes3_transforming_paths_animated_svgs.html %}

One last cool animation that makes use of group transformations is the _horizontal indeterminate progress bar_. A material horizontal indeterminate progress bar consists of three paths: a translucent background and two inner rectangular paths. The two inner rectangles are simultaneously translated from left to right and scaled, altering their positions and sizes at varying degrees. Try toggling the scale and translation animations on the demo below to see the effect!

{% include posts/2016/10/22/includes4_transforming_paths_indeterminate_progress.html %}

### Trimming stroked `path`s

A lesser known property of stroked paths is that they can be _trimmed_. That is, given a stroked path, we can choose to hide or show portions of the path before drawing it to the dispaly. In Android, this is done using the three `<path>` attributes below, each of which can be animated to create some pretty awesome effects:

| Property name            | Element type | Value type | Min value | Max value|
|--------------------------|--------------|------------|-----------|-----------|
| `android:trimPathStart`  | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathEnd`    | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathOffset` | `<path>`     | `float`    | `0`       | `1`       |

The value assigned to `trimPathStart` determines where the visible portion of the path will begin, while the value assigned to `trimPathEnd` determines where the visible portion of the path will end. The `trimPathOffset` value may also be specified to add an extra offset to the start and end values if necessary. Consider the simple stroked path in **Figure 5** as an example, and update the sliders to see how the different values affect what is drawn to the display. Note that it is perfectly fine for `trimPathStart` to be greater than `trimPathEnd`; if this occurs, the visible portion of the path simply wraps around the end of the segment back to the beginning.

{% include posts/2016/10/22/includes5_trimming_stroked_paths_demo.html %}

The ability to animate these three properties opens us up to a world of possibilities, especially for icons that make heavy use of stroked paths. **Figure 6** below shows four examples that animate these attributes in order to achieve some pretty cool effects:

* The _fingerprint icon_ is made up of 5 stroked paths, each with their trim path start and end values initially set to `0` and `1` respectively. When hidden, each path's trim path end value is quickly animated to `0` until the icon is no longer visible, and then back again to `1` when the icon is later shown. The _cursive handwriting icon_ works similarly, except instead of animating the individual paths all at once, they are animated sequentially as if the word was being written out by hand.

* The _search to back icon_ uses a clever trim path transition in order to animate the stem of the search icon into the stem of a back arrow. Enable the "show trim paths" checkbox and you'll see how the changing `trimPathStart` and `trimPathEnd` values affect the relative location of the stem as it animates towards its new state. Enable the "slow animation" checkbox and you'll also notice that the stem's size does not remain constant over the course of the animation: it expands at the beginning and shrinks at the end, creating a subtle "stretching" effect that feels more natural. In order to achieve this effect, we begin animating either the start or end value with a slight start delay. Simple!

* Each animating digit in the _Google IO 2016 icon_ consists of 4 paths, each with a different stroke color and each with trim path start/end values covering a quarter of the path's total length. The `trimPathOffset` is then animated from `0` to `1` in a loop in order to create the effect.

{% include posts/2016/10/22/includes6_trimming_stroked_paths_animated_svgs.html %}

The most familiar example we'll cover, however, is the circular indeterminate progress bar, which consists of a single stroked path and is animated by modifying the following three properties:

1. The progress bar is rotated from 0° to 720° over the course of 4444ms.

2. The progress bar's trim path offset is animated from `0` to `0.25` over the course of 1333ms.

3. Portions of the progress bar's circular path are trimmed over the course of 1333ms. Specifically, over the course of the animation they take on the following values:

    | Time | `trimPathStart` | `trimPathEnd` | `trimPathOffset` |
    |------|-----------------|---------------|------------------|
    | 0    | 0               | 0.03          | 0                |
    | 0.5  | 0               | 0.75          | 0.125            |
    | 1    | 0.75            | 0.78          | 0.25             |

    At time `t = 0.0` and `t = 1.0`, the progress bar is at it's smallest size (only 3% is visible). At `t = 0.5`, the progress bar has stretched to its maximum size (75% is visible). And at time `t = 1.0`, the progress bar has shrunk back to its smallest size and restarts the animation.

{% include posts/2016/10/22/includes7_trimming_stroked_paths_indeterminate_progress.html %}

### Morphing `path`s

Perhaps the most powerful animation technique we'll discuss is path morphing: the ability to transform one arbitrary path into another. On Android 5.0 and above, this can be done by animating the path commands themselves using the `android:pathData` attribute.

| Property name      | Element type | Value type |
|--------------------|--------------|------------|
| `android:pathData` | `<path>`     | `string`   |

You're probably wondering what magical algorithm could possibly be used behind the scenes in order to animate the differences in two arbitrary paths' drawing command strings. Well, before we get into that I should clarify that there are a couple of rules that determine whether or not two paths can be morphed. Specifically, in order for two paths to be compatible, *they must have the same commands, in the same order, and must have the same number of parameters for each command.* You can't morph an `L` command into a `C` command---you can’t even morph a `C` into a `c`---each successive pair of commands has to have the same letter and the same case.

You might be wondering why this requirement must be enforced. Well, the key to understanding how path morphing animations work is by thinking of them as being powered by animating the position of path coordinates. We can see what this means in the examples below. First disable the "animate rotation" checkbox and enable the "show path control/end points" and "slow animation" checkboxes. The red dots that appear correspond to coordinates in each path's command string. Notice how during the course of the animation, the dots follow a straight line beginning from their starting position to their ending position. This is essentially how path morphing animations work. At each animation frame, we recalculate the position of each path's coordinates and redraw the path command.

{% include posts/2016/10/22/includes8_morphing_paths_animated_svgs.html %}

Implementing path morphing animations can be tedious. So here are some tips to get started:

* Adding dummy points to paths in order to make them compatible. (i.e. plus/minus animation)
* Drawing straight lines using bezier curves makes it possible to animate a straight line into a curve (i.e. animated digits animation).
* Sometimes you will need to get creative in how two paths can be animated by splitting them up into two and animating them separately (i.e. play/pause/stop icons).
* Choose the order of your path commands with care. Remember that it is the coordinates of each path that are animated, so the start/end locations of each path point will ultimately determine whether or not the animation looks seamless. This is also why automated tools may not generate perfect results.
* Adding rotation can be extremely helpful as it usually distracts the eye from a path morph animation that might otherwise look somewhat weird.
* Make sure your UX team is aware of these rules. Many UXers don't have to think about this and simply depend on UX software like Sketch or Adobe Illustrator to export the result as an SVG. However, automated export tools like this often don't take into consideration these types of rules.
* Elliptical arcs can be approximated as one or more cubic bezier curves. This can be useful, as it animating elliptical arcs is not very common.

### Animating `clip-path`s

The last technique we'll discuss has to do with animating `<clip-path>`s. A clip path specifies a region of the display that should be drawn to the screen---anything that lies outside the bounds of a clip path will simply be ignored. By animating the bounds of these regions, we can create some cool effects, as we'll see below.

| Property name      | Element type  | Value type |
|--------------------|---------------|------------|
| `android:pathData` | `<clip-path>` | `string`   |

Just as we saw in the section above, a clip path's region can be transformed by animating the differences in drawing commands specified in the `android:pathData` attribute. We can get a better idea of how these animations work by enabling the "show clip paths" checkbox below. In each example, the red overlay mask represents the current position of a `<clip-path>`, dictating the portions of the display that should be drawn in each display frame. As a result, clip paths are great for animating "fill effects", like in the hourglass and heart examples below.

{% include posts/2016/10/22/includes9_clipping_paths_animated_svgs.html %}

### Conclusion: putting it all together

Now that we've covered all of the basic icon animation techniques, let's try combining them all in one last epic example! In **Figure 10**, we'll animate the following properties:

* Animate stroke width (progress indicator to check mark).
* Animate translation and rotation (arrow bounce animation and checkmark to arrow animation).
* Animate trim path (progress indicator and progress indicator to check mark).
* Animate path morph (bottom line bounce animation and checkmark to arrow animation).
* Animate clip path (download arrow fill animation).

{% include posts/2016/10/22/includes10_downloading_animated_svgs.html %}

### Sample app

Here is the link to the [sample app source code][adp-delightful-details].

### Further reading

**TODO(alockwood): add list of helpful resources**

### Special thanks

I'd like to give a **huge** shout out to [Nick Butcher][NickButcherGooglePlus], because I probably would never have written this blog post without him. Several of the animations in this blog post were copied from his amazing open source project [Plaid][plaid-source-code], which I highly recommend you check out if you haven't already! I'd also like to thank [Roman Nurik][RomanNurikGooglePlus] for his [Android Icon Animator][AndroidIconAnimator] tool and for inspiring the path morphing animations in the final example in this blog post.

### Reporting bugs & feedback

If you notice a glitch in one of the animated demos on this page, please report them [here][alexjlockwood.github.io-new-bug]. I only began learning Javascript a few weeks ago so I wouldn't be surprised if I made a mistake somewhere along the line. I want this blog post to be perfect, so I'd really appreciate it! Thanks! :)

### Potential footnotes/ideas/todos

* Mention that the `<vector>` tag's `android:alpha` property can also be animated.
* Mention a few other path command information (i.e. `H`, `V`, `A`, difference between upper/lower case, space/commas don't matter, etc.).
* Add check box to 'color individual paths' so the reader can see what is being animated?
* Add warning that attempting to trim a filled path will cause unexpected behavior.
* Test polyfills and animations on different browsers.
* Minify resources?
* Set up `module.exports`.
* Fix CSS issues created after the addition of material design lite.
* Make sure all polyfills/libraries/etc. are up to date.
* Move javascript/css stuff into default layout `<head>` so we can benefit from caching.
* Finish implementing Roman's downloading icon animation for Android.
* Mention the importance of understanding how path morphing animations work from a UX perspective?
* Mention path morphing tools like [vectalign](https://github.com/bonnyfone/vectalign)?
* Add a "special thanks" section for Roman and Nick.
* Add "click the icons to play" to the captions?
* Good example of path morphing (between an Android and an Apple) can be found [here](https://lewismcgeary.github.io/posts/animated-vector-drawable-pathMorphing/).
* It also might be useful to give a listing of useful tools/resources for further reading.
* At some point will need to rewrite SMIL animations and/or use some sort of polyfill.
* Fix instances of `begin="infinite"` vs `begin="indefinite"`.
* Confirm that markdown is rendered properly when paginating through posts on ADP home screen.
* Footnote idea: You also cannot morph a `L` command with three coordinates, into an `L` command with four coordinates like a square.
* Add color to icons?
* Link to SVG source code somewhere? Somehow make the blog post useful to web developers as well? Mention that trim path start/end doesn't exist in SVG and must be animated using stroke dash array/offset?
* Add table of contents and/or anchor links to each header?
* Reset rotation values for path morph animations after rotation checkbox is clicked.
* Fix radiobutton glitch in firefox.
* Note that clip paths only affect the paths contained in the current group (paths belonging to other sibling groups will not be affected).
* Add thumbnail to the blog post to help drive traffic.
* Mention Sriram Ramnani anywhere (to give credit for timely text view thingy?)

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
  [NumberTweeningBlogPost]: https://sriramramani.wordpress.com/2013/10/14/number-tweening/
