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
<script defer src="/scripts/posts/2016/10/22/transformation-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/linear-progress-bar-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-morph-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/trim-path-interactive-demo.js"></script>
<script defer src="/scripts/posts/2016/10/22/trim-path-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/clip-path-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/circular-progress-bar-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/uploading-animated-svg.js"></script>

<!--morestart-->

In this blog post I will describe different techniques to animate icons using `AnimatedVectorDrawable`s.

<!--more-->

## Creating animated icons

`VectorDrawable`s are made up of four types of elements:

* **`<vector>`** - The root element of the `VectorDrawable`. Defines the intrinsic width and height of the drawable, as well as the width and height of the vector's virtual canvas.
* **`<group>`** - Defines a group of paths or subgroups plus additional transformation information.
* **`<path>`** - Defines the paths to be drawn using [SVG path syntax][svg-path-reference]. Paths will either be filled or stroked.
* **`<clip-path>`** - Defines a portion of the drawable to be clipped.

The opportunity to animate all or parts of the image is what we're really interested in right now. In this section I'll go over different techniques and properties that are commonly used to construct animated icons.

### Drawing `path`s

Before we can animate paths we need to know how to draw them. The most important elements of a `VectorDrawable` are the paths because they are what ultimately end up getting drawn to the screen. Paths are defined using the `<path>` tag and are drawn in the top-down order in which they appear in the `VectorDrawable`'s XML file. Paths are drawn using a series of space separated drawing commands, using a subset of the [SVG path data spec][svg-path-reference] in order to draw lines, curves, and so on. I've summarized the drawing commands I encounter most frequently in the table below (**TODO: add footnote explaining other commands at some point?**):

| Command             | Description |
|---------------------|-------------|
| `M x,y`             | Move the path's current position to `(x,y)`.
| `L x,y`             | Draw a line to `(x,y)`.
| `C x1,y1 x2,y2 x,y` | Draw a [cubic bezier curve][cubic-bezier-curve] to `(x,y)` using control points `(x1,y1)` and `(x2,y2)`.
| `Z`                 | Close the current path by drawing a line to the beginning of the current path.

As you can see above, paths can either be filled (as in the play and record icons) or stroked (as in the pause icon). Collectively, these two types of paths have 5 animatable properties, each of which are listed below:

| Property name         | Element type | Value type | Min value | Max value |
|-----------------------|--------------|------------|-----------|-----------|
| `android:fillAlpha`   | `<path>`     | `float`    | `0`       | `1`       |
| `android:fillColor`   | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeAlpha` | `<path>`     | `float`    | `0`       | `1`       |
| `android:strokeColor` | `<path>`     | `integer`  | - - -     | - - -     |
| `android:strokeWidth` | `<path>`     | `float`    | `0`       | - - -     |

`fillColor` and `strokeColor` can be used to an icon's color over time. `fillAlpha` and `strokeAlpha` can be used to selectively fade in/out individual paths over the course of an animation. (**TODO(alockwood): add footnote explaining that `android:alpha` can be animated on the `<vector>` tag as well?**) And `strokeWidth` can be used to animate the width of a stroked path over time. We'll see some examples of how these properties can be used later on in this post.

We can see how these commands work in action in the diagrams below. Each icon is drawn in a 12x12 grid using the following drawing commands:

{% include posts/2016/10/22/drawing_paths_demo.html %}

### Transforming `group`s of `path`s

Transformations include alpha, rotation, scale, and translate. Pivot determines the center point with which to perform a scale and/or a rotation.

| Property name        | Element type | Value type |
|----------------------|--------------|------------|
| `android:pivotX`     | `<group>`    | `float`    |
| `android:pivotY`     | `<group>`    | `float`    |
| `android:rotation`   | `<group>`    | `float`    |
| `android:scaleX`     | `<group>`    | `float`    |
| `android:scaleY`     | `<group>`    | `float`    |
| `android:translateX` | `<group>`    | `float`    |
| `android:translateY` | `<group>`    | `float`    |

It is important to understand the order in which transformations will be performed because this will affect what is ultimately drawn to the display. The three groups below describe how transformations will be applied. Note that children groups are applied before parent groups, and that transformations made on the same group are applied in the order of scale, rotation, and then translation.

```xml
<vector
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="24dp"
  android:height="24dp"
  android:viewportHeight="24"
  android:viewportWidth="24">

  <!-- First translate the canvas, then rotate, then scale, then draw the path. -->
  <group android:scaleX="1.5">
    <group android:rotation="90">
      <group android:translateX="12">
        <path/>
      </group>
    </group>
  </group>

  <!-- First rotate the canvas, then translate, then scale, then draw the path. -->
  <group android:scaleX="1.5">
    <group
      android:rotation="90"
      android:translateX="12">
      <path/>
    </group>
  </group>

  <!-- First translate the canvas, then rotate, then scale, then draw the path. -->
  <group
    android:rotation="90"
    android:scaleX="1.5">
    <group android:translateX="12">
      <path/>
    </group>
  </group>

</vector>
```

Some examples:

{% include posts/2016/10/22/transforming_paths_demo.html %}

A radio button consists of two paths: an outer ring and an inner dot.

A material horizontal indeterminate progress bar consists of a translucent background and two opaque children rectangles. The two children rectangles are scaled and translated in parallel at different speeds. A unique combination of cubic bezier interpolation curves is used to scale the rectangles at varying degrees. Further, the two rectangles are translated from the left to the right indefinitely (however, you can never actually tell that there are really two rectangles being translated because the two are never entirely visible at once).

{% include posts/2016/10/22/indeterminate_progress_bar_horizontal_demo.html %}

Explain examples.

### Morphing `path`s

Paths can be morphed.

| Property name      | Element type | Value type |
|--------------------|--------------|------------|
| `android:pathData` | `<path>`     | `string`   |

Some examples:

{% include posts/2016/10/22/morphing_paths_demo.html %}

Explain examples.

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

## Miscellaneous stuff

Here is the link to the [sample app source code][adp-delightful-details].

This stuff is probably better suited to go in the sample app `README.md` file.

* Which stuff is/isn't backwards compatible.
* Importance/usefulness of tinting icons.
* Explain how `android:propertyXName` and `android:propertyYName` can be used.
* Mention that currently animated vectors can only be constructed in XML (and that this might change in the future).

  [adp-delightful-details]: https://github.com/alexjlockwood/adp-delightful-details
  [svg-path-reference]: http://www.w3.org/TR/SVG11/paths.html#PathData
  [cubic-bezier-curve]: https://en.wikipedia.org/wiki/B%C3%A9zier_curve