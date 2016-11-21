---
layout: post
title: 'Icon animations'
date: 2016-10-22
permalink: /2016/10/icon-morphing.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
---

<!-- TODO(alockwood): need to adjust material CSS to fix changes mdl made to the site layout -->
<!-- TODO(alockwood): need to fix the margins of header elements in posts (mdlite overwrites them)-->
<!-- TODO(alockwood): need to fix ordered/unordered list elements as well? -->
<!-- TODO(alockwood): probably should check all of the elements and confirm all of the elements that mdlite overwrites -->
<!-- TODO(alockwood): minify all of these and combine into a single file? -->
<link rel="stylesheet" type="text/css" href="/css/posts/2016/10/22/style.css" />
<!-- TODO(alockwood): use npm to import this (using module.exports?) -->
<script defer src="/scripts/posts/2016/10/22/bezier.js"></script>
<script defer src="/scripts/posts/2016/10/22/web-animations.min.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-data-polyfill.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-properties-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/transforming-paths-interactive-demo.js"></script>
<script defer src="/scripts/posts/2016/10/22/transformation-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/linear-progress-bar-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-morph-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/trim-path-interactive-demo.js"></script>
<script defer src="/scripts/posts/2016/10/22/trim-path-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/clip-path-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/circular-progress-bar-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/uploading-animated-svg.js"></script>

<!--morestart-->

In this blog post I will describe different techniques to animate icons using `VectorDrawable`s and `AnimatedVectorDrawable`s.

<!--more-->

## Creating animated icons

TODO(alockwood): figure out what to write here

### Drawing `path`s

Before we can animate paths we need to know how to draw them. The most important elements of a `VectorDrawable` are the paths because they are what ultimately end up getting drawn to the screen. Paths are defined using the `<path>` tag and are drawn in the top-down order in which they appear in the `VectorDrawable`'s XML file. Paths can either be filled or stroked. The path commands will result in a series of lines and shapes. If the path is filled, the interiors of all shapes will be painted. If the path is stroked, the paint will be applied along the outline of the path. Collectively, these filled and stroked paths have 5 animatable properties, each of which are listed below:

| Property name         | Element type | Value type | Min value | Max value |
|-----------------------|--------------|------------|-----------|-----------|
| `android:fillAlpha`   | `<path>`     | `float`    | `0`       | `1`       |
| `android:fillColor`   | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeAlpha` | `<path>`     | `float`    | `0`       | `1`       |
| `android:strokeColor` | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeWidth` | `<path>`     | `float`    | `0`       | - - -     |

Paths are drawn using a series of space separated drawing commands, using a subset of the [SVG path data spec][svg-path-reference] in order to draw lines, curves, and so on. This sequence of commands is specified as a string in the `android:pathData` attribute. I've summarized the drawing commands I encounter most frequently in the table below:

| Command             | Description |
|---------------------|-------------|
| `M x,y`             | Move the path's current position to `(x,y)`.
| `L x,y`             | Draw a line to `(x,y)`.
| `C x1,y1 x2,y2 x,y` | Draw a [cubic bezier curve][cubic-bezier-curve] to `(x,y)` using control points `(x1,y1)` and `(x2,y2)`.
| `Z`                 | Close the current path by drawing a line to the beginning of the current path.

We can see how these commands and attributes work in action in the diagrams below. The play and record icons are filled paths with orange and red fill colors respectively. The pause icon is a stroked path with a green stroke color and a stroke width of 2. Each icon is drawn in a 12x12 grid using the following drawing commands (view the `VectorDrawable` source code for each [here][play-pause-record-vector-drawable-gist]):

{% include posts/2016/10/22/drawing_paths_demo.html %}

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

It is particularly important to understand the order in which transformations are applied because it can seem a little backwards at first. The two rules to remember are (1) children groups are transformed before their parent groups, and (2) transformations that are made on the same group are applied in order of scale, rotation, and then translation. As an example, consider the group transformations applied to the play, pause, and record vector drawables discussed above:

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

{% include posts/2016/10/22/transforming_paths_interactive_demo.html %}

Transformations are widely used to animate icons. Here are three more examples of icons that depend on group transformations in order to be animated.

{% include posts/2016/10/22/transforming_paths_demo.html %}

The expand/collapse icon ([source code][asl_checkable_expandcollapse]) on the left consists of only two straight line paths. When clicked, the two straight lines are simultaneously rotated 90 degrees and translated vertically in order to create the transition between the expanded and collapsed states. 

The alarm clock icon ([source code][avd_clock_alarm]) is also fairly simple. The two alarm bells are rotated 16 degrees back and forth about the origin a total of 8 times in order to make it look like the alarm clock is ringing. 

The radio button icon ([source code][asl_checkable_radiobutton]) looks complicated at first, but actually only involves animating the icon's scale and stroke width properties. The radio button consists of two paths: an inner dot and an outer ring. The radio button begins in an unchecked state with only its outer ring visible. When it is checked, the outer ring's scale and stroke width are rapidly animated in order to create the effect that the outer ring is collapsing in on itself. A pretty awesome effect!

One last cool animation that makes use of group transformations is the horizontal indeterminate progress bar ([source code][avd_progress_indeterminate_horizontal]). A material horizontal indeterminate progress bar consists of two opaque rectangular paths drawn on top of a translucent background. The two rectangles are scaled and translated in parallel, controlled by a unique combination of interpolators that alter their size and location at varying degrees. Try toggling the scale and translation animations on the demo below to see the effect!

{% include posts/2016/10/22/indeterminate_progress_bar_horizontal_demo.html %}

### Trimming stroked `path`s

Paths can be trimmed.

| Property name            | Element type | Value type | Min value | Max value |
|--------------------------|--------------|------------|-----------|-----------|
| `android:trimPathStart`  | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathEnd`    | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathOffset` | `<path>`     | `float`    | `0`       | `1`       |

This is how trimming paths works:

{% include posts/2016/10/22/trim_path_start_end_offset_interactive_demo.html %}

Some examples:

{% include posts/2016/10/22/trimming_stroked_paths_demo.html %}

A material circular indeterminate progress bar can be animated by altering SVG properties in parallel:

1. The entire progress bar is rotated indefinitely about the center of the 
   canvas from 0° to 720° over the course of 4.444s.

2. The progress bar's starting stroke position (i.e. trimPathOffset) is animated
   from 0.0 to 0.25 over the course of 1.333s. In this example, it could also be
   thought of as an additional rotation from 0 to 90 degrees (although trimming
   the path offset in Android is usually more convenient).

3. Portions of the progress bar's circular path are clipped using the trimPathStart
   and trimPathEnd properties. trimPath{Start,End} both take floating point values between
   0f and 1f; trimPathStart="x" and trimPathEnd="y" tells us that only the portion
   of the path between [x,y] will be drawn to the display. Over the course of the
   animation, these properties are assigned the following values:

   ```
   t = 0.0, trimPathStart = 0.75, trimPathEnd = 0.78
   t = 0.5, trimPathStart = 0.00, trimPathEnd = 0.75
   t = 1.0, trimPathStart = 0.00, trimPathEnd = 0.03
   ```

   At time t = 0 and t = 1, the progress bar is at it's smallest size (only 3% is
   visible). At t = 0.5, the progress bar has stretched to its maximum size (75% is
   visible).

   Between t = 0 and t = 0.5, the animation uses a standard "fast out slow in" interpolation
   curve to assign floating point values to the trimPathStart property (in other words,
   trimPathStart's rate of change is much faster at t = 0 than it is at t = 0.5). This
   results in a quick and sudden expansion of the progress bar path. The same thing is done
   to assign values to the trimPathEnd property between t = 0.5 and t = 1.0,
   resulting in a quick and immediate shrinking of the progress bar path.

{% include posts/2016/10/22/indeterminate_progress_bar_circular_demo.html %}

Explain examples.

### Morphing `path`s

Paths can be morphed.

| Property name      | Element type | Value type |
|--------------------|--------------|------------|
| `android:pathData` | `<path>`     | `string`   |

Some examples:

{% include posts/2016/10/22/morphing_paths_demo.html %}

Explain examples.

### Clipping `path`s with `clip-path`

Paths can be clipped.

| Property name      | Element type  | Value type |
|--------------------|---------------|------------|
| `android:pathData` | `<clip-path>` | `string`   |

Some examples:

{% include posts/2016/10/22/clipping_paths_demo.html %}

Explain examples.

### Uploading example

{% include posts/2016/10/22/uploading_demo.html %}

Explain examples.

## Further reading

It also might be useful to give a listing of useful tools/resources for further reading.

## Sample app

Here is the link to the [sample app source code][adp-delightful-details] (mention that the `README.md` file has a bunch of useful information).

## Potential footnotes/ideas

* Mention that the `<vector>` tag's `android:alpha` property can also be animated.
* Mention a few other path command information (i.e. `H`, `V`, `A`, difference between upper/lower case, space/commas don't matter, etc.).
* Add check box to 'color individual paths' so the reader can see what is being animated?

  [adp-delightful-details]: https://github.com/alexjlockwood/adp-delightful-details
  [svg-path-reference]: http://www.w3.org/TR/SVG11/paths.html#PathData
  [cubic-bezier-curve]: https://en.wikipedia.org/wiki/B%C3%A9zier_curve
  [play-pause-record-vector-drawable-gist]: https://gist.github.com/alexjlockwood/e70717b7cb9c040899f08b58860ea3fb
  
  [asl_checkable_expandcollapse]: https://github.com/alexjlockwood/adp-delightful-details/blob/master/app/src/main/res/drawable/asl_checkable_expandcollapse.xml
  [avd_clock_alarm]: https://github.com/alexjlockwood/adp-delightful-details/blob/master/app/src/main/res/drawable/avd_clock_alarm.xml
  [asl_checkable_radiobutton]: https://github.com/alexjlockwood/adp-delightful-details/blob/master/app/src/main/res/drawable/asl_checkable_radiobutton.xml
  [avd_progress_indeterminate_horizontal]: https://github.com/alexjlockwood/adp-delightful-details/blob/master/app/src/main/res/drawable/avd_progress_indeterminate_horizontal.xml


