---
layout: post
title: 'Icon animations'
date: 2016-10-22
permalink: /2016/10/icon-morphing.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<link rel="stylesheet" type="text/css" href="/css/posts/2016/10/22/style.css" />
<script defer src="/scripts/posts/2016/10/22/web-animations.min.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-data-polyfill.js"></script>
<script defer src="/scripts/posts/2016/10/22/animated-icon-demos.js"></script>

<!--morestart-->

In this blog post I will describe different techniques to animate icons using `VectorDrawable`s and `AnimatedVectorDrawable`s.

<!--more-->

* TODO(alockwood): figure out what to write here
* Maybe start with an explanation that this blog post is about explaining animation techniques and won't be super technical as a result (most of the technical details can be learned by reading the sample app source code).

In this blog post we will discuss five groups of techniques:

1. Drawing `path`s
2. Transforming `group`s of `path`s
3. Trimming stroked `path`s
4. Morphing `path`s
5. Clipping `path`s

### Drawing `path`s

Before we can begin to create animated icons we need to understand how they are drawn. The most important elements of a `VectorDrawable` are the paths because they are what ultimately end up getting drawn to the screen. Paths are defined using the `<path>` tag and are drawn in the top-down order in which they appear in the `VectorDrawable`'s XML file. If the path is filled, the interiors of all shapes will be painted. Paths can either be filled or stroked. If the path is stroked, the paint will be applied along the outline of the path. Paths have the following 5 animatable properties, each of which affect the path's appearance during the course of an animation:

| Property name         | Element type | Value type | Min value | Max value |
|-----------------------|--------------|------------|-----------|-----------|
| `android:fillAlpha`   | `<path>`     | `float`    | `0`       | `1`       |
| `android:fillColor`   | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeAlpha` | `<path>`     | `float`    | `0`       | `1`       |
| `android:strokeColor` | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeWidth` | `<path>`     | `float`    | `0`       | - - -     |

The properties above can be used to modify the path's appearance, but a path's shape is determined by path commands. Paths are drawn using a series of space and comma separated drawing commands, using a subset of the [SVG path data spec][svg-path-reference] in order to draw lines, curves, and so on. This sequence of commands is specified as a string in the `android:pathData` attribute. Although there are many different commands, the ones you'll encounter the most frequently are listed in the table below:

| Command             | Description |
|---------------------|-------------|
| `M x,y`             | Begin a new subpath by moving to coordinate `(x,y)`.
| `L x,y`             | Draw a line to `(x,y)`.
| `C x1,y1 x2,y2 x,y` | Draw a [cubic bezier curve][cubic-bezier-curve] to `(x,y)` using control points `(x1,y1)` and `(x2,y2)`.
| `Z`                 | Close the path by drawing a line back to the beginning of the current subpath.

We can see how these commands and attributes work in action in the diagrams below:

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
    android:pathData="M 2,6 C 2,3.79 3.79,2 6,2 C 8.21,2 10,3.79 10,6 C 10,8.21 8.21,10 6,10 C 3.79,10 2,8.21 2,6"/>

</vector>
```

 The triangular play and circular record icons are both filled paths with orange and red fill colors respectively. The pause icon is a stroked path with a green stroke color and a stroke width of 2. Each icon is drawn in a 12x12 grid using the following drawing commands:

{% include posts/2016/10/22/includes1_drawing_paths_path_commands.html %}

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

Transformations are widely used to animate icons. Below are three more examples of icons that depend on group transformations in order to be animated.

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

A lesser known property of stroked paths paths is that they can be trimmed. `VectorDrawable`s provide three additional attributes that can be animated to achieve some pretty cool effects:

| Property name            | Element type | Value type | Min value | Max value|
|--------------------------|--------------|------------|-----------|-----------|
| `android:trimPathStart`  | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathEnd`    | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathOffset` | `<path>`     | `float`    | `0`       | `1`       |

Perhaps the best way to understand how this works is through an example. Consider the simple, straight line path below. Update the sliders below to see how altering each attribute affects what portions of the path will be drawn to the display. Note that setting the start value to be greater than the end value is perfectly valid, and results in a trimmed path that begins at the start value and wraps around the end of the path back to the lesser end value.

{% include posts/2016/10/22/includes5_trimming_stroked_paths_demo.html %}

Below are four examples of animated icons that are composed of stroked paths and make use of this effect. (**TODO(alockwood): an alternative to talking about each icon one by one is to talk about the different types of effects that can be created using these attributes and citing the icons as examples**).

* The fingerprint icon is made up of 5 stroked paths. The paths begin with their trim path start and end values set to 0 and 1 respectively, and their end values are quickly animated to 0 when hidden and back to 1 when shown.

* The Android handwriting icon works similarly. The paths begin with their start and end values set to 0, making it completely hidden. Then each path is sequentially animated into view, creating the illusion that the icon is being written out by hand.

* The search to back icon uses a clever trim path transition in order to animate the stem of the search icon into the stem of a back arrow. Notice how the start and end trims are animated at different speeds in order to create the effect that the stem is being stretched over time as it slides into its new position.

* Unlike the others, the Google IO 2016 icon animates the trim path offset attribute, making use of the fact that trimmed paths wrap around the end of the path.

{% include posts/2016/10/22/includes6_trimming_stroked_paths_animated_svgs.html %}

Lastly, a material circular indeterminate progress bar consists of a single circular stroked path, and can be animated by modifying the following three properties in parallel at various speeds:

1. The entire progress bar is rotated from 0° to 720° over the course of 4444ms.

2. The progress bar's trimPathOffset is animated from `0` to `0.25` over the course of 1333ms. This has the same effect as applying an additional rotation from 0° to 90°.

3. Portions of the progress bar's circular path are trimmed using the trim path start/end properties over the course of 1333ms. Specifically, over the course of the animation they are animated between the following values:

    | Time | `trimPathStart` | `trimPathEnd` | `trimPathOffset` |
    |------|-----------------|---------------|------------------|
    | 0    | 0               | 0.03          | 0                |
    | 0.5  | 0               | 0.75          | 0.125            |
    | 1    | 0.75            | 0.78          | 0.25             |

    At time `t = 0.0` and `t = 1.0`, the progress bar is at it's smallest size (only 3% is visible). At `t = 0.5`, the progress bar has stretched to its maximum size (75% is visible). Similar to the search to back icon, the path's start and end trims are animated at different speeds to achieve the stretching effect that is characteristic of loading indicators.

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

### Clipping `path`s

Finally, paths can be clipped using the `<clip-path>` tag. A clip path specifies the portion of the display that should be shown. Anything that lies outside the bounds of the clip path will not be drawn to the display. Note that clip paths only affect the paths contained in the current group (paths belonging to other sibling groups will not be affected).

| Property name      | Element type  | Value type |
|--------------------|---------------|------------|
| `android:pathData` | `<clip-path>` | `string`   |

Clip paths can be animated via path morphing using the `android:pathData` property. They are commonly used to create fill animations. For example, in the hourglass animation and the heart break animation. However, they can also be used to create other effects, such as animating the effect of crossing out an icon, as in the second animation below.

{% include posts/2016/10/22/includes9_clipping_paths_animated_svgs.html %}

### One last example!

{% include posts/2016/10/22/includes10_downloading_animated_svgs.html %}

## Sample app

Here is the link to the [sample app source code][adp-delightful-details] (mention that the `README.md` file has a bunch of useful information).

## Potential footnotes/ideas/todos

* Mention that the `<vector>` tag's `android:alpha` property can also be animated.
* Should we explain the concept of "scalable vector graphic" or can that be assumed?
* Mention a few other path command information (i.e. `H`, `V`, `A`, difference between upper/lower case, space/commas don't matter, etc.).
* Add check box to 'color individual paths' so the reader can see what is being animated?
* Add warning that attempting to trim a filled path will cause unexpected behavior.
* Add source code for eye visibility icon animation.
* Test polyfills and animations on different browsers.
* Add pictures of sample app to GitHub `README.md` file.
* Minify resources?
* Set up `module.exports`.
* Fix CSS issues created after the addition of material design lite.
* Make sure all polyfills/libraries/etc. are up to date.
* Move javascript/css stuff into default layout `<head>` so we can benefit from caching.
* Finish implementing Roman's downloading icon animation.
* Mention the importance of understanding how path morphing animations work from a UX perspective?
* Mention path morphing tools like [vectalign](https://github.com/bonnyfone/vectalign)?
* Add a "special thanks" section for Roman and Nick.
* Add "click the icons to play" to the captions?
* Good example of path morphing (between an Android and an Applie) can be found [here](https://lewismcgeary.github.io/posts/animated-vector-drawable-pathMorphing/).
* Add a section about choosing interpolators?
* It also might be useful to give a listing of useful tools/resources for further reading.
* At some point will need to rewrite SMIL animations and/or use some sort of polyfill.
* Fix instances of `begin="infinite"` vs `begin="indefinite"`.
* Confirm that markdown is rendered properly when paginating through posts on ADP home screen.
* Sliders in trim path start/end/offset demo look crappy on mobile viewports.
* Footnote idea: You also cannot morph a `L` command with three coordinates, into an `L` command with four coordinates like a square.
* Add color to icons?

  [adp-delightful-details]: https://github.com/alexjlockwood/adp-delightful-details
  [svg-path-reference]: http://www.w3.org/TR/SVG11/paths.html#PathData
  [cubic-bezier-curve]: https://en.wikipedia.org/wiki/B%C3%A9zier_curve
