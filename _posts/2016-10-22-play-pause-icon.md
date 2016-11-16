---
layout: post
title: 'Icon animations'
date: 2016-10-22
permalink: /2016/10/icon-morphing.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
style: |
  .svgDemoContainer {
    display: block;
    background-color: #fafafa;
  }
  .svgDemo {
    display: inline-block;
    width: 33%;
    padding: 16ems;
    height: 240ems;
  }
  .svgDemoCheckboxContainer {
    padding: 16px;
  }
  /* Linear progress bar demo. */
  #progressBarContainer {
    padding: 16px;
  }
  #progressBar {
    width: 360px;
    height: 4px;
    overflow: hidden;
    position: relative;
    background-color: rgba(96, 144, 0, 0.3);
  }

  #progressBarInnerRect1,
  #progressBarInnerRect2 {
    background: #690;
  }

  #progressBarOuterRect1,
  #progressBarOuterRect2,
  #progressBarInnerRect1,
  #progressBarInnerRect2 {
    height: 4px;
    position: absolute;
    width: 288px;
  }
  /* Trim path interactive demo. */
  #ic_line_path {
    padding-top: 16px;
    padding-left: 16px;
    padding-right: 16px;
  }

  .sliderContainer {
    padding: 16px;
  }

  .slider {
    margin-top: 8px;
    display: inline-block;
  }

  .sliderInput {
    width: 300px;
  }

  .sliderTextContainer {
    margin-top: 8px;
    margin-bottom: 8px;
    display: block;
  }

  .sliderText {
    display: inline-block;
  }
---

<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="/css/material.min.css">
<script defer src="/scripts/material.min.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-data-polyfill.js"></script>
<script defer src="/scripts/posts/2016/10/22/transformation-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/linear-progress-bar-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-morph-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/trim-path-interactive-demo.js"></script>
<script defer src="/scripts/posts/2016/10/22/trim-path-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/clip-path-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/circular-progress-bar-animated-svgs.js"></script>

<!-- TODO(alockwood): need to figure out why adding the material design lite css messes the site layout up -->
<!-- TODO(alockwood): need to figure out why adding the material design lite css messes the site layout up -->
<!-- TODO(alockwood): need to figure out why adding the material design lite css messes the site layout up -->
<!-- TODO(alockwood): need to figure out why adding the material design lite css messes the site layout up -->
<!-- TODO(alockwood): need to figure out why adding the material design lite css messes the site layout up -->

<!--morestart-->

In this blog post I will describe different techniques to animate icons using `AnimatedVectorDrawable`s.

<!--more-->

* I am writing this blog post because I want to see more apps embrace and incorporate motion into their apps. I genuinely think that animated icons make the application better and more usable. They're a great opportunity to make your app feel alive.
* TODO: explain the importance of motion in a few sentences
* In a previous series of blog posts, I wrote about transitions. Transitions can be used to construct elaborate animations between different states in your applications.
* In this blog post, I'm going to focus on something much smaller in scope but just as important: delightful details and creative customization. In this blog post I will describe different techniques to animate icons using `AnimatedVectorDrawable`s.

As Eames said, the details make the design. Motion can be an opportunity to provide delight and make a connection with your user. They can also bring personality to your app. After all, animating literally means bringing to life. Whenever an element changes state this is a great opportunity to animate this change. This helps both to explain what is changing and can direct attention. This technique isn't restricted to larger blocks of your UI. Animating small details eases the transition. Although they often don't provide extra functionalit, these small details bring a smile to your face and make the experience of using the app more enjoyable.

## Introduction to `VectorDrawable`s & `AnimatedVectorDrawable`s

To craft delightful details like these, we'll take a look at the VectorDrawable and AnimatedVectorDrawable classes. We'll start by looking at what VectorDrawable allows us to do, to understand what we can animate. VectorDrawable was introduced in Lollipop and lets you create density independent images by defining a series of drawing commands. It's similar in concept to SVG on the web. Here's an example of a VectorDrawable. It defines a path which has a series of space separated drawing commands, which use a subset of the SVG path data spec to draw lines, curves and so on. For example, these commands draw a cross by moving to a point. Drawing a line to another point. Lifting and moving to another point. And drawing another line. Simple. Now vectors aren't appropriate for every kind of image. You wouldn't want to represent a person's face with a vector, for example. But iconography and simple illustrations are great candidates. The vector format provides density independence, meaning that the same image works on any screen density. When vector support reaches enough devices, you won't have to explore assets at multiple different sizes like we covered in Lesson One. It also generally produces a small file size.

`VectorDrawable`s are made up of four types of elements:

* **`<vector>`** - The root element of the `VectorDrawable`. Defines the intrinsic width and height of the drawable, as well as the width and height of the vector's virtual canvas.

* **`<group>`** - Defines a group of paths or subgroups plus additional transformation information.

* **`<path>`** - Defines the paths to be drawn using [SVG path syntax][svg-path-reference]. Paths are drawn in the top-down order in which they appear in the XML file.

* **`<clip-path>`** - Defines a portion of the drawable to be clipped.

The opportunity to animate all or parts of the image is what we're really interested in right now. The `AnimatedVectorDrawable` class lets you animate any property of a part of set of parts. `AnimatedVectorDrawable`s are the glue that tie together `VectorDrawable`s and `ObjectAnimator`s. That is, `AnimatedVectorDrawable`s assign `ObjectAnimator`s to individual groups/paths called "targets" and tell them how they should be animated.

The table below describes what can be animated:

| Property name                 | Element type            | Value type | Min value | Max value |
|-------------------------------|-------------------------|------------|-----------|-----------|
| `android:alpha`               | `<vector>`              | `float`    | `0`       | `1`       |
| `android:pivot{X,Y}`          | `<group>`               | `float`    | - - -     | - - -     |
| `android:rotation`            | `<group>`               | `float`    | - - -     | - - -     |
| `android:scale{X,Y}`          | `<group>`               | `float`    | - - -     | - - -     |
| `android:translate{X,Y}`      | `<group>`               | `float`    | - - -     | - - -     |
| `android:fillAlpha`           | `<path>`                | `float`    | `0`       | `1`       |
| `android:fillColor`           | `<path>`                | `integer`  | - - -     | - - -     |
| `android:strokeAlpha`         | `<path>`                | `float`    | `0`       | `1`       |
| `android:strokeColor`         | `<path>`                | `integer`  | - - -     | - - -     |
| `android:strokeWidth`         | `<path>`                | `float`    | `0`       | - - -     |
| `android:trimPath{Start,End}` | `<path>`                | `float`    | `0`       | `1`       |
| `android:trimPathOffset`      | `<path>`                | `float`    | `0`       | `1`       |
| `android:pathData`            | `<path>`, `<clip-path>` | `string`   | - - -     | - - -     |

TODO(alockwood): add a caption to the above table

In the below sections we'll go through these one by one.

## Building animated icons

### Path transformations

Transformations include alpha, pivot, rotation, scale, and translate. It is important to understand the order in which transformations will be performed because this will affect what is ultimately drawn to the display. The three groups below describe how transformations will be applied. Note that children groups are applied before parent groups, and that transformations made on the same group are applied in the order of scale, rotation, and then translation.

```xml
<vector
  xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="24dp"
  android:height="24dp"
  android:viewportHeight="24"
  android:viewportWidth="24">

  <!-- First translate, then rotate, then scale, then draw the path. -->
  <group android:scaleX="1.5">
    <group android:rotation="90">
      <group android:translateX="12">
        <path/>
      </group>
    </group>
  </group>

  <!-- First rotate, then translate, then scale, then draw the path. -->
  <group android:scaleX="1.5">
    <group
      android:rotation="90"
      android:translateX="12">
      <path/>
    </group>
  </group>

  <!-- First translate, then rotate, then scale, then draw the path. -->
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

<div class="svgDemoContainer">
  <svg xmlns="http://www.w3.org/2000/svg" id="ic_expand_collapse" viewBox="0 0 24 24" class="svgDemo">
    <g id="chevron" transform="translate(12,15)">
      <g id="leftBar" transform="rotate(135)">
        <g transform="translate(0,3)">
          <path id="leftBarPath" d="M1-4v8h-2v-8z" />
        </g>
      </g>
      <g id="rightBar" transform="rotate(45)">
        <g transform="translate(0,-3)">
          <path id="rightBarPath" d="M1-4v8h-2v-8z" />
        </g>
      </g>
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_radiobutton" class="svgDemo" viewBox="0 0 32 32">
    <g transform="translate(16,16)">
      <g id="radiobutton_ring_outer">
        <path id="radiobutton_ring_outer_path" stroke="#000" fill="none" stroke-width="2" d="M-9 0A9 9 0 1 0 9 0 9 9 0 1 0-9 0" />
      </g>
      <g id="radiobutton_dot_group" transform="scale(0,0)">
        <path id="radiobutton_dot_path" d="M-5 0A5 5 0 1 0 5 0 5 5 0 1 0-5 0" />
      </g>
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_alarm" viewBox="0 0 24 24" class="svgDemo">
    <g transform="translate(12,12)">
      <g id="alarmclock_button_rotation" transform="rotate(0)">
        <g transform="translate(-12,-12)">
          <g transform="translate(19.0722,4.5758)">
            <path d="M2.94 1.162l-4.595-3.857L-2.94-1.16l4.595 3.855L2.94 1.162z" />
          </g>
          <g transform="translate(4.9262,4.5729)">
            <path d="M2.94-1.163L1.656-2.695-2.94 1.16l1.285 1.535L2.94-1.163z" />
          </g>
        </g>
      </g>
    </g>
    <g transform="translate(13.75,12.4473)">
      <path d="M-1.25-4.427h-1.5v6l4.747 2.854.753-1.232-4-2.372v-5.25z" />
    </g>
    <g transform="translate(12,13.0203)">
      <path d="M-.005-9C-4.98-9-9-4.97-9 0s4.02 9 8.995 9S9 4.97 9 0 4.97-9-.005-9zM0 7c-3.867 0-7-3.134-7-7s3.133-7 7-7 7 3.134 7 7-3.133 7-7 7z" />
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="basicTransformationSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="basicTransformationSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

And here's a linear indeterminate progress bar example:

<!-- A material horizontal indeterminate progress bar consists of a translucent background and
     two opaque children rectangles. The two children rectangles are scaled and translated in
     parallel at different speeds. A unique combination of cubic bezier interpolation curves
     is used to scale the rectangles at varying degrees. Further, the two rectangles are translated
     from the left to the right indefinitely (however, you can never actually tell that there are
     really two rectangles being translated because the two are never entirely visible at once). -->

<div id="svgLinearProgressDemo" class="svgDemoContainer">
  <div id="progressBarContainer">
    <div id="progressBar">
      <div id="progressBarOuterRect1">
        <div id="progressBarInnerRect1"></div>
      </div>
      <div id="progressBarOuterRect2">
        <div id="progressBarInnerRect2"></div>
      </div>
    </div>
  </div>

  <div class="svgDemoCheckboxContainer">
    <label for="linearProgressScaleCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="linearProgressScaleCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate horizontal scale</span>
    </label>
    <label for="linearProgressTranslateCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="linearProgressTranslateCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate horizontal translation</span>
    </label>
    <label for="linearProgressSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="linearProgressSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

### Morphing paths

Some examples:

<div id="svgPathMorphDemo" class="svgDemoContainer">
  <svg id="ic_plus_minus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svgDemo">
    <g transform="translate(12,12)">
      <g id="plus_minus_container_rotate" transform="rotate(0)">
        <g id="plus_minus_container_translate" transform="translate(-12,-12)">
          <path id="plus_minus_path" d="M5 11h6V5h2v6h6v2h-6v6h-2v-6H5z">
            <animate id="plus_to_minus_path_animation" attributeName="d" begin="indefinite" dur="250ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z;M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z" />
            <animate id="minus_to_plus_path_animation" attributeName="d" begin="indefinite" dur="250ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z;M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z"/>
          </path>
          <path id="plus_minus_end_points_path" fill="#64B5F6" style="visibility: hidden;">
            <animate id="plus_minus_end_points_animation" attributeName="d" begin="indefinite" dur="250ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze"/>
        </path>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_cross_tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svgDemo">
    <g transform="translate(12,12)">
      <g id="cross_tick_container_rotate" transform="rotate(0)">
        <g id="cross_tick_container_translate" transform="translate(-12,-12)">
          <path id="cross_tick_path" stroke="#000" stroke-width="2" stroke-linecap="square" d="M6.4 6.4l11.2 11.2m-11.2 0L17.6 6.4">
            <animate id="cross_to_tick_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4;M4.8,13.4 L9,17.6 M10.4,16.2 L19.6,7" />
            <animate id="tick_to_cross_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M4.8,13.4 L9,17.6 M10.4,16.2 L19.6,7;M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4" />
          </path>
          <path id="cross_tick_end_points_path" fill="#64B5F6" style="visibility: hidden;">
            <animate id="cross_tick_end_points_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_arrow_drawer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svgDemo">
    <g transform="translate(12,12)">
      <g id="arrow_drawer_container_rotate" transform="rotate(0)">
        <g id="arrow_drawer_container_translate" transform="translate(-12,-12)">
          <path id="arrow_drawer_path" d="M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z">            
            <animate id="drawer_to_arrow_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z;M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20z"
            />
            <animate id="arrow_to_drawer_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20z;M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z"
            />
          </path>
          <path id="arrow_drawer_end_points_path" fill="#64B5F6" style="visibility: hidden;">
            <animate id="drawer_arrow_end_points_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_arrow_overflow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svgDemo">
    <g transform="translate(12,12)">
      <g id="arrow_overflow_translate_dot3" transform="translate(0,6)">
        <g id="arrow_overflow_rotate_dot3" transform="rotate(0)">
          <g id="arrow_overflow_pivot_dot3">
            <path id="arrow_overflow_path3" fill="#000" d="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z">
              <animate id="overflow_to_arrow_path3_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" />
              <animate id="arrow_to_overflow_path3_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" />
            </path>
            <path id="arrow_overflow_end_points_path3" style="visibility: hidden;" fill="#64B5F6">
              <animate id="arrow_overflow_end_points3_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" fill="freeze" />
            </path>
          </g>
        </g>
      </g>
      <g id="arrow_overflow_translate_dot1" transform="translate(0,-6)">
        <g id="arrow_overflow_rotate_dot1" transform="rotate(0)">
          <g id="arrow_overflow_pivot_dot1">
            <path id="arrow_overflow_path1" fill="#000" d="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z">
              <animate id="overflow_to_arrow_path1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" />
              <animate id="arrow_to_overflow_path1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" />
            </path>
            <path id="arrow_overflow_end_points_path1" style="visibility: hidden;" fill="#64B5F6">
              <animate id="arrow_overflow_end_points1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" fill="freeze" />
          </path>
          </g>
        </g>
      </g>
      <g id="arrow_overflow_translate_dot2">
        <g id="arrow_overflow_pivot_dot2">
          <path id="arrow_overflow_path2" fill="#000" d="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z">
            <animate id="overflow_to_arrow_path2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.1667;0.3333;0.5;0.6666;0.83333;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" />
            <animate id="arrow_to_overflow_path2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" />
          </path>
          <path id="arrow_overflow_end_points_path2" style="visibility: hidden;" fill="#64B5F6">
            <animate id="arrow_overflow_end_points2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" fill="freeze" />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_play_pause_stop" viewBox="0 0 18 18" class="svgDemo">
    <g id="play_pause_stop_translateX" transform="translate(0.75,0)">
      <g transform="translate(9,9)">
        <g id="play_pause_stop_rotate" transform="rotate(90)">
          <g transform="translate(-9,-9)">
            <path id="play_pause_stop_path" d="M9 5v8H4l5-8m0 0l5 8H9V5">
              <animate id="play_pause_stop_animation" fill="freeze" attributeName="d" begin="infinite" dur="200ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
            </path>
            <path id="play_pause_stop_end_points_path" style="visibility: hidden;" fill="#64B5F6">
              <animate id="play_pause_stop_end_points_animation" fill="freeze" attributeName="d" begin="infinite" dur="200ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
            </path>
          </g>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_countdown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" class="svgDemo">
    <g id="scale_container" transform="scale(0.8,0.8)">
      <g id="countdown_container" transform="translate(0.1,0.1)">
        <path id="countdown_digits" stroke="#000" stroke-width="0.02" fill="none" d="M 0.24585635359116,0.552486187845304 C 0.24585635359116,0.331491712707182 0.370165745856354,0.0994475138121547 0.552486187845304,0.0994475138121547 C 0.734806629834254,0.0994475138121547 0.861878453038674,0.331491712707182 0.861878453038674,0.552486187845304 C 0.861878453038674,0.773480662983425 0.734806629834254,0.994475138121547 0.552486187845304,0.994475138121547 C 0.370165745856354,0.994475138121547 0.24585635359116,0.773480662983425 0.24585635359116,0.552486187845304">
          <animate id="countdown_digits_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
        <path id="countdown_digits_cp1" style="visibility: hidden;" fill="#64B5F6">
          <animate id="countdown_digits_cp1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
        <path id="countdown_digits_cp2" style="visibility: hidden;" fill="#64B5F6">
          <animate id="countdown_digits_cp2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
        <path id="countdown_digits_end" style="visibility: hidden;" fill="#64B5F6">
          <animate id="countdown_digits_end_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
      </g>
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="pathMorphRotateCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphRotateCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate rotation</span>
    </label>
    <label for="pathMorphShowPathPointsCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphShowPathPointsCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Show path control/end points</span>
    </label>
    <label for="pathMorphSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

### Trimming stroked paths

This is how trimming paths works:

<!-- TODO(alockwood): reduce the scope of the trim path interactive demo. -->

<div id="svgSliderDemo" class="svgDemoContainer">
  <svg xmlns="http://www.w3.org/2000/svg" id="ic_line_path" viewBox="0 0 24 1" width="95%">
    <path id="line_path" fill="none" stroke="#000" stroke-width=".25" d="M 0.5,0.5 h 23" />
  </svg>

  <div class="sliderContainer">
    <div class="sliderTextContainer">
      <div class="slider">
        <input id="trimPathStart" class="mdl-slider mdl-js-slider sliderInput" type="range" min="0" max="100" value="0" tabindex="0" oninput="updateTrimPathStart(this.value)" onchange="updateTrimPathStart(this.value)">
      </div>
      <div class="sliderText"><code>android:trimPathStart="<span id="trimPathStartValue">0</span>"</code></div>
    </div>

    <div class="sliderTextContainer">
      <div class="slider">
        <input id="trimPathEnd" class="mdl-slider mdl-js-slider sliderInput" type="range" min="0" max="100" value="100" tabindex="0" oninput="updateTrimPathEnd(this.value)" onchange="updateTrimPathEnd(this.value)">
      </div>
      <div class="sliderText"><code>android:trimPathEnd="<span id="trimPathEndValue">100</span>"</code></div>
    </div>

    <div class="sliderTextContainer">
      <div class="slider">
        <input id="trimPathOffset" class="mdl-slider mdl-js-slider sliderInput" type="range" min="0" max="100" value="0" tabindex="0" oninput="updateTrimPathOffset(this.value)" onchange="updateTrimPathOffset(this.value)">
      </div>
      <div class="sliderText"><code>android:trimPathOffset="<span id="trimPathOffsetValue">0</span>"</code></div>
    </div>
  </div>
</div>

Some examples:

<div id="svgTrimPathDemos" class="svgDemoContainer">
  <svg xmlns="http://www.w3.org/2000/svg" id="ic_search_back" viewBox="0 0 48 24" class="svgDemo">
    <path id="stem_debug" style="visibility: hidden;" fill="none" stroke-opacity="0.3" stroke="#000" stroke-width="2" d="M24.7 12.7l7.117 7.207C32.787 20.7 34.46 23 37.5 23s5.5-2.46 5.5-5.5-2.46-5.5-5.5-5.5h-5.683-12.97"/>
    <path id="search_circle_debug" style="visibility: hidden;" fill="none" stroke-opacity="0.3" stroke="#000" stroke-width="2" d="M25.39 13.39a5.5 5.5 0 1 1-7.78-7.78 5.5 5.5 0 1 1 7.78 7.78" />
     <g id="arrow_head_debug">
      <path id="arrow_head_top_debug" style="visibility: hidden;" fill="none" stroke-opacity="0.3" stroke="#000" stroke-width="2" d="M16.702 12.696l8.002-8.003" />
      <path id="arrow_head_bottom_debug" style="visibility: hidden;" fill="none" stroke-opacity="0.3" stroke="#000" stroke-width="2" d="M16.71 11.276l8.012 8.012" />
    </g>
    <path id="stem" fill="none" stroke="#000" stroke-width="2" d="M24.7 12.7l7.117 7.207C32.787 20.7 34.46 23 37.5 23s5.5-2.46 5.5-5.5-2.46-5.5-5.5-5.5h-5.683-12.97" stroke-dasharray="9.75516635929,42.975462608" />
    <path id="search_circle" fill="none" stroke="#000" stroke-width="2" d="M25.39 13.39a5.5 5.5 0 1 1-7.78-7.78 5.5 5.5 0 1 1 7.78 7.78" />
    <g id="arrow_head" transform="translate(8,0)">
      <path id="arrow_head_top" fill="none" stroke="#000" stroke-width="2" d="M16.702 12.696l8.002-8.003" stroke-dashoffset="11.317" stroke-dasharray="11.317" />
      <path id="arrow_head_bottom" fill="none" stroke="#000" stroke-width="2" d="M16.71 11.276l8.012 8.012" stroke-dashoffset="11.33" stroke-dasharray="11.33" />
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_android_handwriting" viewBox="0 0 170 68" class="svgDemo">
    <g transform="translate(2, 12)">
      <path id="andro_debug" style="visibility: hidden;" stroke-opacity="0.3" fill="none" stroke="#690" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M.342 40.576c10.073 8.093 17.46-26.214 24.843-37.008-2.504 13.87-.942 31.505 5.634 34.256 6.575 2.752 10.747-12.91 13.866-20.387 0 7.477-7.16 19.9-5.436 20.876 3.597-7.226 10.768-15.395 13.076-16.554 2.307-1.16-1.44 14.734.942 14.376 8.927 2.946 8.88-19.38 21.295-12.37-12.416-4.875-12.516 11.16-11.494 12.643C76.07 34.924 86 6.615 81.632.9 72.673-.873 72.18 37.314 76.07 38.14c10.548-.318 14.896-18.363 13.145-22.848-5.363 7.766 2.17 5.983 4.633 9.62 2.506 3.4-3.374 14.54 2.506 13.907 4.856-.844 15.163-23.165 17.118-17.82-5.727-2.37-10.81 16.224-4.143 16.824 8.588.318 9.125-16.823 4.142-17.34"
    />
      <path id="id_debug" style="visibility: hidden;" stroke-opacity="0.3" fill="none" stroke="#690" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M126.046 22.4c-4.284 6.404-2.96 14.827-.092 15.973 4.31 3.24 12.428-18.428 18.5-16.612-13.063 5.738-9.164 14.542-7.253 14.542 15.016-1.847 21.977-34.67 18.283-36.193-9.478 5.223-9.927 36.192-5.008 38.058 6.956 0 10.04-9.364 10.04-9.364"
    />
      <path id="a_debug" style="visibility: hidden;" stroke-opacity="0.3" fill="none" stroke="#690" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M15.513 25.218c4.082 0 15.976-2.228 15.976-2.228" />
      <path id="i1_dot_debug" style="visibility: hidden;" stroke-opacity="0.3" fill="none" stroke="#690" stroke-width="3" d="M127.723 15.887l-.56 1.116" />
      <path id="andro" fill="none" stroke="#690" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M.342 40.576c10.073 8.093 17.46-26.214 24.843-37.008-2.504 13.87-.942 31.505 5.634 34.256 6.575 2.752 10.747-12.91 13.866-20.387 0 7.477-7.16 19.9-5.436 20.876 3.597-7.226 10.768-15.395 13.076-16.554 2.307-1.16-1.44 14.734.942 14.376 8.927 2.946 8.88-19.38 21.295-12.37-12.416-4.875-12.516 11.16-11.494 12.643C76.07 34.924 86 6.615 81.632.9 72.673-.873 72.18 37.314 76.07 38.14c10.548-.318 14.896-18.363 13.145-22.848-5.363 7.766 2.17 5.983 4.633 9.62 2.506 3.4-3.374 14.54 2.506 13.907 4.856-.844 15.163-23.165 17.118-17.82-5.727-2.37-10.81 16.224-4.143 16.824 8.588.318 9.125-16.823 4.142-17.34"
    />
      <path id="id" fill="none" stroke="#690" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M126.046 22.4c-4.284 6.404-2.96 14.827-.092 15.973 4.31 3.24 12.428-18.428 18.5-16.612-13.063 5.738-9.164 14.542-7.253 14.542 15.016-1.847 21.977-34.67 18.283-36.193-9.478 5.223-9.927 36.192-5.008 38.058 6.956 0 10.04-9.364 10.04-9.364"
    />
      <path id="a" fill="none" stroke="#690" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M15.513 25.218c4.082 0 15.976-2.228 15.976-2.228" />
      <path id="i1_dot" fill="none" stroke="#690" stroke-width="3" d="M127.723 15.887l-.56 1.116" />
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_fingerprint" viewBox="0 0 32 32" class="svgDemo">
    <g transform="translate(49.3335,50.66685)">
      <path id="ridge_5_path_debug" style="visibility: hidden;" fill="none" stroke="#dadada" stroke-linecap="round" stroke-width="1.45" d="M-25.36-24.414c-.568.107-1.126.14-1.454.14-1.297 0-2.532-.343-3.62-1.123-1.677-1.204-2.77-3.17-2.77-5.392"/>
      <path id="ridge_7_path_debug" style="visibility: hidden;" fill="none" stroke="#dadada" stroke-linecap="round" stroke-width="1.45" d="M-36.14-21.784c-1.006-1.193-1.576-1.918-2.366-3.502-.828-1.66-1.314-3.492-1.314-5.485 0-3.664 2.97-6.633 6.633-6.633 3.662 0 6.632 2.97 6.632 6.632"/>
      <path id="ridge_6_path_debug" style="visibility: hidden;" fill="none" stroke="#dadada" stroke-linecap="round" stroke-width="1.45" d="M-42.19-25.676c-.76-2.143-.897-3.87-.897-5.13 0-1.46.25-2.847.814-4.096 1.562-3.45 5.035-5.85 9.068-5.85 5.495 0 9.95 4.453 9.95 9.947 0 1.832-1.486 3.316-3.318 3.316-1.83 0-3.316-1.483-3.316-3.315 0-1.83-1.483-3.316-3.315-3.316-1.83 0-3.316 1.484-3.316 3.315 0 2.57.99 4.887 2.604 6.587 1.222 1.285 2.432 2.1 4.476 2.69"/>
      <path id="ridge_2_path_debug" style="visibility: hidden;" fill="none" stroke="#dadada" stroke-linecap="round" stroke-width="1.45" d="M-44.065-38.167c1.19-1.775 2.675-3.246 4.56-4.273 1.883-1.028 4.044-1.61 6.34-1.61 2.29 0 4.44.578 6.32 1.597 1.878 1.02 3.36 2.48 4.552 4.242"/>
      <path id="ridge_1_path_debug" style="visibility: hidden;" fill="none" stroke="#dadada" stroke-linecap="round" stroke-width="1.45" d="M71.78 97.05c-2.27-1.313-4.712-2.07-7.56-2.07-2.85 0-5.234.78-7.345 2.07"/>
      <path id="ridge_5_path" fill="none" stroke="#808080" stroke-linecap="round" stroke-width="1.45" d="M-25.36-24.414c-.568.107-1.126.14-1.454.14-1.297 0-2.532-.343-3.62-1.123-1.677-1.204-2.77-3.17-2.77-5.392"/>
      <path id="ridge_7_path" fill="none" stroke="#808080" stroke-linecap="round" stroke-width="1.45" d="M-36.14-21.784c-1.006-1.193-1.576-1.918-2.366-3.502-.828-1.66-1.314-3.492-1.314-5.485 0-3.664 2.97-6.633 6.633-6.633 3.662 0 6.632 2.97 6.632 6.632"/>
      <path id="ridge_6_path" fill="none" stroke="#808080" stroke-linecap="round" stroke-width="1.45" d="M-42.19-25.676c-.76-2.143-.897-3.87-.897-5.13 0-1.46.25-2.847.814-4.096 1.562-3.45 5.035-5.85 9.068-5.85 5.495 0 9.95 4.453 9.95 9.947 0 1.832-1.486 3.316-3.318 3.316-1.83 0-3.316-1.483-3.316-3.315 0-1.83-1.483-3.316-3.315-3.316-1.83 0-3.316 1.484-3.316 3.315 0 2.57.99 4.887 2.604 6.587 1.222 1.285 2.432 2.1 4.476 2.69"/>
      <path id="ridge_2_path" fill="none" stroke="#808080" stroke-linecap="round" stroke-width="1.45" d="M-44.065-38.167c1.19-1.775 2.675-3.246 4.56-4.273 1.883-1.028 4.044-1.61 6.34-1.61 2.29 0 4.44.578 6.32 1.597 1.878 1.02 3.36 2.48 4.552 4.242"/>
      <path id="ridge_1_path" fill="none" stroke="#808080" stroke-linecap="round" stroke-width="1.45" d="M71.78 97.05c-2.27-1.313-4.712-2.07-7.56-2.07-2.85 0-5.234.78-7.345 2.07"/>
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="trimPathShowTrimPathsCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="trimPathShowTrimPathsCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Show trim paths</span>
    </label>
    <label for="trimPathSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="trimPathSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

And the circular progress bar demo:

<!-- A material circular indeterminate progress bar can be animated by altering
     SVG properties in parallel:

     (1) The entire progress bar is rotated indefinitely about the center of
         the canvas from 0° to 720° over the course of 4.444s.

     (2) The progress bar's starting stroke position (i.e. trimPathOffset) is animated
         from 0.0 to 0.25 over the course of 1.333s. In this example, it could also be
         thought of as an additional rotation from 0 to 90 degrees (although trimming
         the path offset in Android is usually more convenient).

     (3) Portions of the progress bar's circular path are clipped using the trimPathStart
         and trimPathEnd properties. trimPath{Start,End} both take floating point values between
         0f and 1f; trimPathStart="x" and trimPathEnd="y" tells us that only the portion
         of the path between [x,y] will be drawn to the display. Over the course of the
         animation, these properties are assigned the following values:

         t = 0.0, trimPathStart = 0.75, trimPathEnd = 0.78
         t = 0.5, trimPathStart = 0.00, trimPathEnd = 0.75
         t = 1.0, trimPathStart = 0.00, trimPathEnd = 0.03

         At time t = 0 and t = 1, the progress bar is at it's smallest size (only 3% is
         visible). At t = 0.5, the progress bar has stretched to its maximum size (75% is
         visible).

         Between t = 0 and t = 0.5, the animation uses a standard "fast out slow in" interpolation
         curve to assign floating point values to the trimPathStart property (in other words,
         trimPathStart's rate of change is much faster at t = 0 than it is at t = 0.5). This
         results in a quick and sudden expansion of the progress bar path. The same thing is done
         to assign values to the trimPathEnd property between t = 0.5 and t = 1.0,
         resulting in a quick and immediate shrinking of the progress bar path.
-->

<div id="svgCircularProgressDemos" class="svgDemoContainer">
  <svg id="circular_progress" xmlns="http://www.w3.org/2000/svg" width="320" height="320">
    <g id="circular_progress_position" transform="translate(160,160)">
      <g id="circular_progress_outer_rotation" transform="rotate(0)">
        <g id="circular_progress_inner_rotation">
          <g id="circular_progress_scale" transform="scale(8.91, 8.91)">
            <ellipse id="circular_progress_circle_path_debug" rx="9.5" ry="9.5" style="visibility: hidden;" stroke="#690" stroke-opacity="0.3" stroke-width="2" fill="none" />
            <ellipse id="circular_progress_circle_path" rx="9.5" ry="9.5" stroke="#690" stroke-width="2" stroke-dasharray="1.79095622248, 57.907584527" stroke-dashoffset="14.925" fill="none" />
          </g>
        </g>
      </g>
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="circularProgressOuterRotationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressOuterRotationCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate rotation</span>
    </label>
    <label for="circularProgressTrimPathOffsetCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressTrimPathOffsetCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate trim path offset</span>
    </label>
    <label for="circularProgressTrimPathStartEndCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressTrimPathStartEndCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate trim path start/end</span>
    </label>
    <label for="circularProgressShowTrimPathsCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressShowTrimPathsCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Show trim paths</span>
    </label>
    <label for="circularProgressSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

### Clipping paths

Some examples:

<div id="svgClipPathDemos" class="svgDemoContainer">
  <svg xmlns="http://www.w3.org/2000/svg" id="ic_timer" class="svgDemo" viewBox="0 0 24 24">
    <g transform="translate(12,12)">
      <g id="hourglass_frame_rotation" transform="rotate(0)">
        <g transform="translate(-12,-12)">
          <g transform="translate(12,12)">
            <path d="M1 0l6.29-6.29c.63-.63.19-1.71-.7-1.71H-6.59c-.89 0-1.33 1.08-.7 1.71L-1 0l-6.29 6.29c-.63.63-.19 1.71.7 1.71H6.59c.89 0 1.33-1.08.7-1.71L1 0zm-5.17-6h8.34L0-1.83-4.17-6zm0 12L0 1.83 4.17 6h-8.34z" />
          </g>
        </g>
      </g>
    </g>
    <g transform="translate(12,12)">
      <g id="hourglass_fill_rotation" transform="rotate(0)">
        <g transform="translate(-12,-12)">
          <clipPath id="hourglass_clip_mask">
            <path d="M24 13.4H0V24h24V13.4z">
              <animate id="hourglass_clip_mask_animation" fill="freeze" attributeName="d" begin="infinite" dur="1000ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" values="M 24,13.3999938965 c 0,0 -24,0 -24,0 c 0,0 0,10.6 0,10.6000061035 c 0,0 24,0 24,0 c 0,0 0,-10.6000061035 0,-10.6000061035 Z;M 24,0.00173950195312 c 0,0 -24,0 -24,0 c 0,0 0,10.6982574463 0,10.6982574463 c 0,0 24,0 24,0 c 0,0 0,-10.6982574463 0,-10.6982574463 Z" />
            </path>
          </clipPath>
           <g clip-path="url(#hourglass_clip_mask)">
            <path id="path_2" d="M13 12l6.293-6.293c.63-.63.184-1.707-.707-1.707H5.416c-.892 0-1.338 1.077-.708 1.707L11 12l-6.292 6.293c-.63.63-.184 1.707.707 1.707h13.17c.892 0 1.338-1.077.708-1.707L13 12z" />
          </g>
          <path id="hourglass_clip_mask_debug" d="M24 13.4H0V24h24V13.4z" fill="#F44336" fill-opacity="0.3" style="visibility: hidden;">
            <animate id="hourglass_clip_mask_debug_animation" fill="freeze" attributeName="d" begin="infinite" dur="1000ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" values="M 24,13.3999938965 c 0,0 -24,0 -24,0 c 0,0 0,10.6 0,10.6000061035 c 0,0 24,0 24,0 c 0,0 0,-10.6000061035 0,-10.6000061035 Z;M 24,0.00173950195312 c 0,0 -24,0 -24,0 c 0,0 0,10.6982574463 0,10.6982574463 c 0,0 24,0 24,0 c 0,0 0,-10.6982574463 0,-10.6982574463 Z" />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_visibility" class="svgDemo" viewBox="0 0 24 24">
    <path id="cross_out_path" fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="square" d="M3.27 4.27l16.47 16.47" />
    <clipPath id="eye_mask_clip_path">
      <path id="eye_mask" d="M2 4.27L19.73 22l2.54-2.54L4.54 1.73V1H23v22H1V4.27z">
        <animate id="eye_mask_animation" fill="freeze" attributeName="d" begin="infinite" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
      </path>
    </clipPath>
    <g id="eye_mask_clip_path_group" clip-path="url(#eye_mask_clip_path)">
      <path id="eye" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </g>
    <path id="eye_mask_clip_path_debug" d="M2 4.27L19.73 22l2.54-2.54L4.54 1.73V1H23v22H1V4.27z" fill="#F44336" fill-opacity=".3" style="visibility: hidden;">
      <animate id="eye_mask_debug_animation" fill="freeze" attributeName="d" begin="infinite" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
    </path>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_heart" class="svgDemo" viewBox="0 0 56 56">
    <path id="heart_stroke_left" fill="none" stroke="#000" stroke-width="2" d="M28.72 38.296l-3.05-2.744c-4.05-3.76-7.654-6.66-7.654-10.707 0-3.257 2.615-4.88 5.618-4.88 1.365 0 3.165 1.216 5.01 3.165" />
    <path id="heart_stroke_right" fill="none" stroke="#000" stroke-width="2" d="M27.23 38.294l3.535-3.094c4.07-3.965 6.987-6.082 7.24-10.116.163-2.625-2.232-5.05-4.626-5.05-2.948 0-3.708 1.013-6.15 3.1" />
    <clipPath id="clip">
      <path id="clip_path" d="M18 37h20-20z">
        <animate id="heart_fill_animation" fill="freeze" attributeName="d" begin="infinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" values="M18 37 L38 37 L38 37 L18 37 Z;M14 14 L42 14 L42 42 L14 42 Z" />
      </path>
    </clipPath>
    <g id="clip_path_group" clip-path="url(#clip)">
      <path id="heart_full_path" fill="#000000" style="visibility: hidden;" d="M28 39l-1.595-1.433C20.74 32.47 17 29.11 17 24.995 17 21.632 19.657 19 23.05 19c1.914 0 3.75.883 4.95 2.272C29.2 19.882 31.036 19 32.95 19c3.393 0 6.05 2.632 6.05 5.995 0 4.114-3.74 7.476-9.405 12.572L28 39z"
      />
    </g>
    <g id="broken_heart_left_group" transform="translate(28,37.3)">
      <g id="broken_heart_rotate_left_group" transform="rotate(0)">
        <g id="broken_heart_translate_left_group" transform="translate(-28,-37.3)">
          <path id="broken_heart_left_path" fill-opacity="0" d="M28.03 21.054l-.03.036C26.91 19.81 25.24 19 23.5 19c-3.08 0-5.5 2.42-5.5 5.5 0 3.78 3.4 6.86 8.55 11.53L28 37.35l.002-.002-.22-.36.707-.915-.984-1.31 1.276-1.736-1.838-2.02 2.205-2.282-2.033-1.582 2.032-2.125-2.662-2.04 1.543-1.924z"
          />
        </g>
      </g>
    </g>
    <g id="broken_heart_right_group" transform="translate(28,37.3)">
      <g id="broken_heart_rotate_right_group" transform="rotate(0)">
        <g id="broken_heart_translate_right_group" transform="translate(-28,-37.3)">
          <path id="broken_heart_right_path" fill-opacity="0" d="M28.03 21.054c.14-.16.286-.31.44-.455l.445-.374C29.925 19.456 31.193 19 32.5 19c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54l-1.448 1.308-.22-.36.707-.915-.984-1.31 1.276-1.736-1.838-2.02 2.205-2.282-2.033-1.582 2.032-2.125-2.662-2.04 1.543-1.924z"
          />
        </g>
      </g>
    </g>
    <path id="clip_path_debug" style="visibility: hidden;" d="M18 37h20-20z" fill="#F44336" fill-opacity="0.3">
      <animate id="heart_fill_debug_animation" fill="freeze" attributeName="d" begin="infinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" values="M18 37 L38 37 L38 37 L18 37 Z;M14 14 L42 14 L42 42 L14 42 Z" />
    </path>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="clipPathShowClipMaskCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="clipPathShowClipMaskCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Show clip masks</span>
    </label>
    <label for="clipPathSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="clipPathSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

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
