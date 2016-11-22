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

* TODO(alockwood): figure out what to write here
* Maybe start with an explanation that this blog post is about explaining animation techniques and won't be super technical as a result (most of the technical details can be learned by reading the sample app source code).

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

We can see how these commands and attributes work in action in the diagrams below. The play and record icons are filled paths with orange and red fill colors respectively. The pause icon is a stroked path with a green stroke color and a stroke width of 2. Each icon is drawn in a 12x12 grid using the following drawing commands:

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

Transformations are widely used to animate icons. Below are three more examples of icons that depend on group transformations in order to be animated.

The expand/collapse icon on the left consists of only two straight line paths. When clicked, the two straight lines are simultaneously rotated 90 degrees and translated vertically in order to create the transition between the expanded and collapsed states. 

The alarm clock icon is also fairly simple. The two alarm bells are rotated 16 degrees back and forth about the origin a total of 8 times in order to make it look like the alarm clock is ringing. 

The radio button icon looks complicated at first, but actually only involves animating the icon's scale and stroke width properties.

| `t`   | Outer ring `strokeWidth` | Outer ring `scale{X,Y}` | Inner dot `scale{X,Y}` |
|-------|--------------------------|-------------------------|------------------------|
| 0.0   | 2                        | 1                       | 0                      |
| 0.333 | 18                       | 0.5                     | 0                      |
| 0.334 | 2                        | 0.9                     | 1.5                    |
| 1.0   | 2                        | 1                       | 1                      |

 The radio button consists of two paths: an inner dot and an outer ring. The radio button begins in an unchecked state with only its outer ring visible. When it is checked, the outer ring's scale and stroke width are rapidly animated in order to create the effect that the outer ring is collapsing in on itself. A pretty awesome effect!

{% include posts/2016/10/22/transforming_paths_demo.html %}

One last cool animation that makes use of group transformations is the horizontal indeterminate progress bar. A material horizontal indeterminate progress bar consists of two opaque rectangular paths drawn on top of a translucent background. The two rectangles are scaled and translated in parallel, controlled by a unique combination of interpolators that alter their size and location at varying degrees. Note that the two rectangles are never entirely visible at the same time. Try toggling the scale and translation animations on the demo below to see the effect!

{% include posts/2016/10/22/indeterminate_progress_bar_horizontal_demo.html %}

### Trimming stroked `path`s

A lesser known property of stroked paths paths is that they can be trimmed. `VectorDrawable`s provide three additional attributes that can be animated to achieve some pretty cool effects:

| Property name            | Element type | Value type | Min value | Max value |
|--------------------------|--------------|------------|-----------|-----------|
| `android:trimPathStart`  | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathEnd`    | `<path>`     | `float`    | `0`       | `1`       |
| `android:trimPathOffset` | `<path>`     | `float`    | `0`       | `1`       |

Perhaps the best way to understand how this works is through an example. Consider the simple, straight line path below. Update the sliders below to see how altering each attribute affects what portions of the path will be drawn to the display. Note that setting the start value to be greater than the end value is perfectly valid, and results in a trimmed path that begins at the start value and wraps around the end of the path back to the lesser end value.

{% include posts/2016/10/22/trim_path_start_end_offset_interactive_demo.html %}

Below are four examples of animated icons that are composed of stroked paths and make use of this effect. (**TODO(alockwood): an alternative to talking about each icon one by one is to talk about the different types of effects that can be created using these attributes and citing the icons as examples).

The fingerprint icon is made up of 5 stroked paths. The paths begin with their trim path start and end values set to 0 and 1 respectively, and their end values are quickly animated to 0 when hidden and back to 1 when shown. The Android handwriting icon works similarly. The paths begin with their start and end values set to 0, making it completely hidden. Then each path is sequentially animated into view, creating the illusion that the icon is being written out by hand.

The search to back icon uses a clever trim path transition in order to animate the stem of the search icon into the stem of a back arrow. Notice how the start and end trims are animated at different speeds in order to create the effect that the stem is being stretched over time as it slides into its new position.

Unlike the others, the Google IO 2016 icon animates the trim path offset attribute, making use of the fact that trimmed paths wrap around the end of the path.

{% include posts/2016/10/22/trimming_stroked_paths_demo.html %}

Lastly, a material circular indeterminate progress bar consists of a single circular stroked path, and can be animated by modifying the following three properties in parallel at various speeds:

1. The entire progress bar is rotated from 0° to 720° over the course of 4444 milliseconds.

2. The progress bar's trimPathOffset is animated from `0` to `0.25` over the course of 1333 milliseconds. This has the same effect as applying an additional rotation from 0° to 90°.

3. Portions of the progress bar's circular path are trimmed using the trim path start/end properties over the course of 1333 milliseconds. Specifically, over the course of the animation they are animated between the following values:

    | `t` | `android:trimPathStart` | `android:trimPathEnd` |
    |-----|-------------------------|-----------------------|
    | 0.0 | 0                       | 0.03                  |
    | 0.5 | 0                       | 0.75                  |
    | 1.0 | 0.75                    | 0.78                  |

    At time `t = 0.0` and `t = 1.0`, the progress bar is at it's smallest size (only 3% is visible). At `t = 0.5`, the progress bar has stretched to its maximum size (75% is visible). Similar to the search to back icon, the path's start and end trims are animated at different speeds to achieve the stretching effect that is characteristic of loading indicators.

{% include posts/2016/10/22/indeterminate_progress_bar_circular_demo.html %}

### Morphing `path`s

Paths can be morphed using the following property:

| Property name      | Element type | Value type |
|--------------------|--------------|------------|
| `android:pathData` | `<path>`     | `string`   |

Some examples:

{% include posts/2016/10/22/morphing_paths_demo.html %}

### Clipping `path`s

Finally, paths can be clipped using the `<clip-path>` tag. A clip path specifies the portion of the display that should be shown. Anything that lies outside the bounds of the clip path will not be drawn to the display. Note that clip paths only affect the paths contained in the current group (paths belonging to other sibling groups will not be affected).

| Property name      | Element type  | Value type |
|--------------------|---------------|------------|
| `android:pathData` | `<clip-path>` | `string`   |

Clip paths are animated via path morphing using the `android:pathData` property. They are commonly used to create fill animations. For example, in the hourglass animation and the heart break animation. However, they can also be used to create other effects, such as animating the effect of crossing out an icon, as in the second animation below.

{% include posts/2016/10/22/clipping_paths_demo.html %}

### Uploading example

{% include posts/2016/10/22/uploading_demo.html %}

## Further reading

It also might be useful to give a listing of useful tools/resources for further reading.

## Sample app

Here is the link to the [sample app source code][adp-delightful-details] (mention that the `README.md` file has a bunch of useful information).

## Potential footnotes/ideas

* Mention that the `<vector>` tag's `android:alpha` property can also be animated.
* Mention a few other path command information (i.e. `H`, `V`, `A`, difference between upper/lower case, space/commas don't matter, etc.).
* Add check box to 'color individual paths' so the reader can see what is being animated?
* Add warning that attempting to trim a filled path will cause unexpected behavior.
* Add source code for eye visibility icon animation?

  [adp-delightful-details]: https://github.com/alexjlockwood/adp-delightful-details
  [svg-path-reference]: http://www.w3.org/TR/SVG11/paths.html#PathData
  [cubic-bezier-curve]: https://en.wikipedia.org/wiki/B%C3%A9zier_curve
