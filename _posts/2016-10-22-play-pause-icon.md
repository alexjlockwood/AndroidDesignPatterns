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
  background-color: rgba(63, 81, 181, 0.26);
  }

  #progressBarInnerRect1,
  #progressBarInnerRect2 {
  background: #3f51b5;
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
<link rel="stylesheet" href="https://code.getmdl.io/1.2.1/material.indigo-pink.min.css">
<script defer src="https://code.getmdl.io/1.2.1/material.min.js"></script>
<script defer src="/scripts/posts/2016/10/22/transformation-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/linear-progress-bar-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-morph-digits-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-morph-animated-svgs.js"></script>
<script defer src="/scripts/posts/2016/10/22/path-morph-play-pause-stop-animated-svgs.js"></script>
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

<div id="svgRotationDemos" class="svgDemoContainer">
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
    <g id="button_position" transform="translate(16,16)">
      <g id="ring_outer">
        <path id="ring_outer_path" stroke="#000" fill="none" stroke-width="2" d="M-9 0A9 9 0 1 0 9 0 9 9 0 1 0-9 0" />
      </g>
      <g id="dot_group" transform="scale(0,0)">
        <path id="dot_path" d="M-5 0A5 5 0 1 0 5 0 5 5 0 1 0-5 0" />
      </g>
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_alarm" viewBox="0 0 24 24" class="svgDemo">
    <g id="button_position" transform="translate(12,12)">
      <g id="button_rotation" transform="rotate(0)">
        <g id="button_scale_x" transform="scale(1, 1)">
          <g id="button_scale_y">
            <g id="button_pivot" transform="translate(-12,-12)">
              <g id="button">
                <g id="right_button_transform" transform="translate(19.0722,4.5758)">
                  <g id="right_button">
                    <path id="path_1" d="M2.94 1.162l-4.595-3.857L-2.94-1.16l4.595 3.855L2.94 1.162z" />
                  </g>
                </g>
                <g id="left_button_transform" transform="translate(4.9262,4.5729)">
                  <g id="left_button">
                    <path id="left_button_path" d="M2.94-1.163L1.656-2.695-2.94 1.16l1.285 1.535L2.94-1.163z" />
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
    <g id="alarm_transform" transform="translate(12,12)">
      <g id="alarm_pivot" transform="translate(-12,-12)">
        <g id="alarm">
          <g id="alarm_hands_transform" transform="translate(13.75,12.4473)">
            <g id="alarm_hands">
              <path id="alarm_hands_path" d="M-1.25-4.427h-1.5v6l4.747 2.854.753-1.232-4-2.372v-5.25z" />
            </g>
          </g>
          <g id="alarm_body_transform" transform="translate(12,13.0203)">
            <g id="alarm_body">
              <path id="alarm_outline_path_merged" d="M-.005-9C-4.98-9-9-4.97-9 0s4.02 9 8.995 9S9 4.97 9 0 4.97-9-.005-9zM0 7c-3.867 0-7-3.134-7-7s3.133-7 7-7 7 3.134 7 7-3.133 7-7 7z" />
            </g>
          </g>
        </g>
      </g>
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
      <span class="mdl-checkbox__label">Animate <code>android:scaleX</code> property</span>
    </label>
    <label for="linearProgressTranslateCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="linearProgressTranslateCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate <code>android:translateX</code> property</span>
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
    <g id="plus_minus_container" transform="translate(12,12)">
      <g id="plus_minus_container_rotate" transform="rotate(0)">
        <g id="plus_minus_container_translate" transform="translate(-12,-12)">
          <path id="plus_minus_path" d="M5 11h6V5h2v6h6v2h-6v6h-2v-6H5z">
            <animate id="plus_to_minus_path_animation" attributeName="d" begin="indefinite" dur="250ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z;M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z"
            />
            <animate id="minus_to_plus_path_animation" attributeName="d" begin="indefinite" dur="250ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z;M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z"
            />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_cross_tick" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svgDemo">
    <g id="cross_tick_container" transform="translate(12,12)">
      <g id="cross_tick_container_rotate" transform="rotate(0)">
        <g id="cross_tick_container_translate" transform="translate(-12,-12)">
          <path id="cross_tick_path" stroke="#000" stroke-width="2" stroke-linecap="square" d="M6.4 6.4l11.2 11.2m-11.2 0L17.6 6.4">
            <animate id="cross_to_tick_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4;M4.8,13.4 L9,17.6 M10.4,16.2 L19.6,7" />
            <animate id="tick_to_cross_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M4.8,13.4 L9,17.6 M10.4,16.2 L19.6,7;M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4" />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_arrow_drawer" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="svgDemo">
    <g id="arrow_drawer_container" transform="translate(12,12)">
      <g id="arrow_drawer_container_rotate" transform="rotate(0)">
        <g id="arrow_drawer_container_translate" transform="translate(-12,-12)">
          <path id="arrow_drawer_path" d="M3 6v2h18V6H3zm0 5v2h18v-2H3zm0 7v-2h18v2H3z">
            <animate id="arrow_to_drawer_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20z;M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z"
            />
            <animate id="drawer_to_arrow_path_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" values="M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z;M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20z"
            />
          </path>
        </g>
      </g>
    </g>
  </svg>

  <svg id="ic_arrow_overflow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 240px; height: 240px;">
    <g id="arrow_overflow_container" transform="translate(12,12)">
      <g id="arrow_overflow_translate_dot3" transform="translate(0,6)">
        <g id="arrow_overflow_rotate_dot3" transform="rotate(0)">
          <g id="arrow_overflow_pivot_dot3">
            <path android:id="arrow_overflow_path3" android:fill="#000" d="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z">
              <animate id="overflow_to_arrow_path3_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" values="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z;M -4.0950630677,-1.30952224204 l 8.1901261354,0 c 0.177619793131,0 0.32160908516,0.143989292029 0.32160908516,0.32160908516 l 0,1.97582631376 c 0,0.177619793131 -0.143989292029,0.32160908516 -0.32160908516,0.32160908516 l -8.1901261354,0 c -0.177619793131,0 -0.32160908516,-0.143989292029 -0.32160908516,-0.32160908516 l 0,-1.97582631376 c 0,-0.177619793131 0.143989292029,-0.32160908516 0.32160908516,-0.32160908516 Z;M -5.11454284324,-1.11013061622 l 10.2290856865,0 c 0,0 0,0 0,0 l 0,2.22026123243 c 0,0 0,0 0,0 l -10.2290856865,0 c 0,0 0,0 0,0 l 0,-2.22026123243 c 0,0 0,0 0,0 Z;M -5.41755510258,-1.02355568498 l 10.8351102052,0 c 0,0 0,0 0,0 l 0,2.04711136995 c 0,0 0,0 0,0 l -10.8351102052,0 c 0,0 0,0 0,0 l 0,-2.04711136995 c 0,0 0,0 0,0 Z;M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"
              />
              <animate id="arrow_to_overflow_path2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze"
              values="M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z;M -5.349609375,-1.04296875 l 10.69921875,0 c 0,0 0,0 0,0 l 0,2.0859375 c 0,0 0,0 0,0 l -10.69921875,0 c 0,0 0,0 0,0 l 0,-2.0859375 c 0,0 0,0 0,0 Z;M -4.57327108594,-1.25 l 9.14654217189,0 c 0.0285690903566,0 0.0517289140556,0.023159823699 0.0517289140556,0.0517289140556 l 0,2.39654217189 c 0,0.0285690903566 -0.023159823699,0.0517289140556 -0.0517289140556,0.0517289140556 l -9.14654217189,0 c -0.0285690903566,0 -0.0517289140556,-0.023159823699 -0.0517289140556,-0.0517289140556 l 0,-2.39654217189 c 0,-0.0285690903566 0.023159823699,-0.0517289140556 0.0517289140556,-0.0517289140556 Z;M -3.04137381938,-1.55960748018 l 6.08274763876,0 c 0.2761423749,0 0.5,0.2238576251 0.5,0.5 l 0,2.11921496035 c 0,0.2761423749 -0.2238576251,0.5 -0.5,0.5 l -6.08274763876,0 c -0.2761423749,0 -0.5,-0.2238576251 -0.5,-0.5 l 0,-2.11921496035 c 0,-0.2761423749 0.2238576251,-0.5 0.5,-0.5 Z;M -1.55858989728,-1.77552577131 l 3.11717979456,0 c 0.677691994437,0 1.22706990313,0.549377908693 1.22706990313,1.22706990313 l 0,1.09691173636 c 0,0.677691994437 -0.549377908693,1.22706990313 -1.22706990313,1.22706990313 l -3.11717979456,0 c -0.677691994437,0 -1.22706990313,-0.549377908693 -1.22706990313,-1.22706990313 l 0,-1.09691173636 c 0,-0.677691994437 0.549377908693,-1.22706990313 1.22706990313,-1.22706990313 Z;M -0.706008791281,-1.89447268498 l 1.41201758256,0 c 0.918635554655,0 1.66333681129,0.744701256633 1.66333681129,1.66333681129 l 0,0.462271747384 c 0,0.918635554655 -0.744701256633,1.66333681129 -1.66333681129,1.66333681129 l -1.41201758256,0 c -0.918635554655,0 -1.66333681129,-0.744701256633 -1.66333681129,-1.66333681129 l 0,-0.462271747384 c 0,-0.918635554655 0.744701256633,-1.66333681129 1.66333681129,-1.66333681129 Z;M -0.265730251554,-1.95936709392 l 0.531460503108,0 c 1.03635400439,0 1.87648491973,0.840130915331 1.87648491973,1.87648491973 l 0,0.165764348389 c 0,1.03635400439 -0.840130915331,1.87648491973 -1.87648491973,1.87648491973 l -0.531460503108,0 c -1.03635400439,0 -1.87648491973,-0.840130915331 -1.87648491973,-1.87648491973 l 0,-0.165764348389 c 0,-1.03635400439 0.840130915331,-1.87648491973 1.87648491973,-1.87648491973 Z;M -0.0581061000545,-1.99098433926 l 0.116212200109,0 c 1.08990562844,0 1.97344871252,0.883543084083 1.97344871252,1.97344871252 l 0,0.0350712534878 c 0,1.08990562844 -0.883543084083,1.97344871252 -1.97344871252,1.97344871252 l -0.116212200109,0 c -1.08990562844,0 -1.97344871252,-0.883543084083 -1.97344871252,-1.97344871252 l 0,-0.0350712534878 c 0,-1.08990562844 0.883543084083,-1.97344871252 1.97344871252,-1.97344871252 Z;M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z"
              />
            </path>
          </g>
        </g>
      </g>
      <g id="arrow_overflow_translate_dot2">
        <g id="arrow_overflow_pivot_dot2">
          <path android:id="arrow_overflow_path2" android:fill="#000" d="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z">
            <animate id="overflow_to_arrow_path2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.1667;0.3333;0.5;0.6666;0.83333;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" values="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z;M -0.510644950991,-1.91489250817 l 1.02128990198,0 c 1.05756592977,0 1.91489250817,0.857326578401 1.91489250817,1.91489250817 l 0,0 c 0,1.05756592977 -0.857326578401,1.91489250817 -1.91489250817,1.91489250817 l -1.02128990198,0 c -1.05756592977,0 -1.91489250817,-0.857326578401 -1.91489250817,-1.91489250817 l 0,0 c 0,-1.05756592977 0.857326578401,-1.91489250817 1.91489250817,-1.91489250817 Z;M -3.66172292328,-1.54166666667 l 7.32344584656,0 c 0.347908322704,0 0.629943743386,0.282035420682 0.629943743386,0.629943743386 l 0,1.82344584656 c 0,0.347908322704 -0.282035420682,0.629943743386 -0.629943743386,0.629943743386 l -7.32344584656,0 c -0.347908322704,0 -0.629943743386,-0.282035420682 -0.629943743386,-0.629943743386 l 0,-1.82344584656 c 0,-0.347908322704 0.282035420682,-0.629943743386 0.629943743386,-0.629943743386 Z;M -5.80605656225,-1.22447422869 l 11.6121131245,0 c 0.0395282866537,0 0.0715722943065,0.0320440076528 0.0715722943065,0.0715722943065 l 0,2.30580386877 c 0,0.0395282866537 -0.0320440076528,0.0715722943065 -0.0715722943065,0.0715722943065 l -11.6121131245,0 c -0.0395282866537,0 -0.0715722943065,-0.0320440076528 -0.0715722943065,-0.0715722943065 l 0,-2.30580386877 c 0,-0.0395282866537 0.0320440076528,-0.0715722943065 0.0715722943065,-0.0715722943065 Z;M -6.60386380145,-1.07922723971 l 13.2077276029,0 c 0,0 0,0 0,0 l 0,2.15845447942 c 0,0 0,0 0,0 l -13.2077276029,0 c 0,0 0,0 0,0 l 0,-2.15845447942 c 0,0 0,0 0,0 Z;M -6.91679014084,-1.01664197183 l 13.8335802817,0 c 0,0 0,0 0,0 l 0,2.03328394367 c 0,0 0,0 0,0 l -13.8335802817,0 c 0,0 0,0 0,0 l 0,-2.03328394367 c 0,0 0,0 0,0 Z;M -7,-1 l 14,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -14,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"
            />
            <animate id="arrow_to_overflow_path3_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze"
            values="M -7,-1 l 14,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -14,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z;  M -4.36843359242,-1.49992262412 l 8.73686718484,0 c 0.0728757880921,0 0.131953286993,0.0590774989007 0.131953286993,0.131953286993 l 0,2.73593867425 c 0,0.0728757880921 -0.0590774989007,0.131953286993 -0.131953286993,0.131953286993 l -8.73686718484,0 c -0.0728757880921,0 -0.131953286993,-0.0590774989007 -0.131953286993,-0.131953286993 l 0,-2.73593867425 c 0,-0.0728757880921 0.0590774989007,-0.131953286993 0.131953286993,-0.131953286993 Z;M -2.7976112102,-1.69047775796 l 5.59522242041,0 c 0.41421356235,0 0.75,0.33578643765 0.75,0.75 l 0,1.88095551592 c 0,0.41421356235 -0.33578643765,0.75 -0.75,0.75 l -5.59522242041,0 c -0.41421356235,0 -0.75,-0.33578643765 -0.75,-0.75 l 0,-1.88095551592 c 0,-0.41421356235 0.33578643765,-0.75 0.75,-0.75 Z;M -1.5412962309,-1.81003891076 l 3.08259246181,0 c 0.777898159561,0 1.4085092153,0.630611055735 1.4085092153,1.4085092153 l 0,0.803059390927 c 0,0.777898159561 -0.630611055735,1.4085092153 -1.4085092153,1.4085092153 l -3.08259246181,0 c -0.777898159561,0 -1.4085092153,-0.630611055735 -1.4085092153,-1.4085092153 l 0,-0.803059390927 c 0,-0.777898159561 0.630611055735,-1.4085092153 1.4085092153,-1.4085092153 Z;M -0.798718330914,-1.88987363368 l 1.59743666183,0 c 0.967555109393,0 1.75191350068,0.784358391285 1.75191350068,1.75191350068 l 0,0.275920266008 c 0,0.967555109393 -0.784358391285,1.75191350068 -1.75191350068,1.75191350068 l -1.59743666183,0 c -0.967555109393,0 -1.75191350068,-0.784358391285 -1.75191350068,-1.75191350068 l 0,-0.275920266008 c 0,-0.967555109393 0.784358391285,-1.75191350068 1.75191350068,-1.75191350068 Z;M -0.366220962052,-1.94300934217 l 0.732441924103,0 c 1.05968660322,0 1.91873232712,0.859045723904 1.91873232712,1.91873232712 l 0,0.0485540300878 c 0,1.05968660322 -0.859045723904,1.91873232712 -1.91873232712,1.91873232712 l -0.732441924103,0 c -1.05968660322,0 -1.91873232712,-0.859045723904 -1.91873232712,-1.91873232712 l 0,-0.0485540300878 c 0,-1.05968660322 0.859045723904,-1.91873232712 1.91873232712,-1.91873232712 Z;M -0.141334109858,-1.97644431502 l 0.282668219716,0 c 1.09156005402,0 1.97644431502,0.884884261007 1.97644431502,1.97644431502 l 0,0 c 0,1.09156005402 -0.884884261007,1.97644431502 -1.97644431502,1.97644431502 l -0.282668219716,0 c -1.09156005402,0 -1.97644431502,-0.884884261007 -1.97644431502,-1.97644431502 l 0,0 c 0,-1.09156005402 0.884884261007,-1.97644431502 1.97644431502,-1.97644431502 Z;M -0.0331287849506,-1.99447853584 l 0.0662575699012,0 c 1.10152007915,0 1.99447853584,0.892958456693 1.99447853584,1.99447853584 l 0,0 c 0,1.10152007915 -0.892958456693,1.99447853584 -1.99447853584,1.99447853584 l -0.0662575699012,0 c -1.10152007915,0 -1.99447853584,-0.892958456693 -1.99447853584,-1.99447853584 l 0,0 c 0,-1.10152007915 0.892958456693,-1.99447853584 1.99447853584,-1.99447853584 Z;M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z"
            />
          </path>
        </g>
      </g>
      <g id="arrow_overflow_translate_dot1" transform="translate(0,-6)">
        <g id="arrow_overflow_rotate_dot1" transform="rotate(0)">
          <g id="arrow_overflow_pivot_dot1">
            <path android:id="arrow_overflow_path1" android:fill="#000" d="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z">
              <animate id="overflow_to_arrow_path1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze" values="M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z;M -4.0950630677,-1.30952224204 l 8.1901261354,0 c 0.177619793131,0 0.32160908516,0.143989292029 0.32160908516,0.32160908516 l 0,1.97582631376 c 0,0.177619793131 -0.143989292029,0.32160908516 -0.32160908516,0.32160908516 l -8.1901261354,0 c -0.177619793131,0 -0.32160908516,-0.143989292029 -0.32160908516,-0.32160908516 l 0,-1.97582631376 c 0,-0.177619793131 0.143989292029,-0.32160908516 0.32160908516,-0.32160908516 Z;M -5.11454284324,-1.11013061622 l 10.2290856865,0 c 0,0 0,0 0,0 l 0,2.22026123243 c 0,0 0,0 0,0 l -10.2290856865,0 c 0,0 0,0 0,0 l 0,-2.22026123243 c 0,0 0,0 0,0 Z;M -5.41755510258,-1.02355568498 l 10.8351102052,0 c 0,0 0,0 0,0 l 0,2.04711136995 c 0,0 0,0 0,0 l -10.8351102052,0 c 0,0 0,0 0,0 l 0,-2.04711136995 c 0,0 0,0 0,0 Z;M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"
              />
              <animate id="arrow_to_overflow_path1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1" keySplines="0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1" fill="freeze"
              values="M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z;M -5.349609375,-1.04296875 l 10.69921875,0 c 0,0 0,0 0,0 l 0,2.0859375 c 0,0 0,0 0,0 l -10.69921875,0 c 0,0 0,0 0,0 l 0,-2.0859375 c 0,0 0,0 0,0 Z;M -4.57327108594,-1.25 l 9.14654217189,0 c 0.0285690903566,0 0.0517289140556,0.023159823699 0.0517289140556,0.0517289140556 l 0,2.39654217189 c 0,0.0285690903566 -0.023159823699,0.0517289140556 -0.0517289140556,0.0517289140556 l -9.14654217189,0 c -0.0285690903566,0 -0.0517289140556,-0.023159823699 -0.0517289140556,-0.0517289140556 l 0,-2.39654217189 c 0,-0.0285690903566 0.023159823699,-0.0517289140556 0.0517289140556,-0.0517289140556 Z;M -3.04137381938,-1.55960748018 l 6.08274763876,0 c 0.2761423749,0 0.5,0.2238576251 0.5,0.5 l 0,2.11921496035 c 0,0.2761423749 -0.2238576251,0.5 -0.5,0.5 l -6.08274763876,0 c -0.2761423749,0 -0.5,-0.2238576251 -0.5,-0.5 l 0,-2.11921496035 c 0,-0.2761423749 0.2238576251,-0.5 0.5,-0.5 Z;M -1.55858989728,-1.77552577131 l 3.11717979456,0 c 0.677691994437,0 1.22706990313,0.549377908693 1.22706990313,1.22706990313 l 0,1.09691173636 c 0,0.677691994437 -0.549377908693,1.22706990313 -1.22706990313,1.22706990313 l -3.11717979456,0 c -0.677691994437,0 -1.22706990313,-0.549377908693 -1.22706990313,-1.22706990313 l 0,-1.09691173636 c 0,-0.677691994437 0.549377908693,-1.22706990313 1.22706990313,-1.22706990313 Z;M -0.706008791281,-1.89447268498 l 1.41201758256,0 c 0.918635554655,0 1.66333681129,0.744701256633 1.66333681129,1.66333681129 l 0,0.462271747384 c 0,0.918635554655 -0.744701256633,1.66333681129 -1.66333681129,1.66333681129 l -1.41201758256,0 c -0.918635554655,0 -1.66333681129,-0.744701256633 -1.66333681129,-1.66333681129 l 0,-0.462271747384 c 0,-0.918635554655 0.744701256633,-1.66333681129 1.66333681129,-1.66333681129 Z;M -0.265730251554,-1.95936709392 l 0.531460503108,0 c 1.03635400439,0 1.87648491973,0.840130915331 1.87648491973,1.87648491973 l 0,0.165764348389 c 0,1.03635400439 -0.840130915331,1.87648491973 -1.87648491973,1.87648491973 l -0.531460503108,0 c -1.03635400439,0 -1.87648491973,-0.840130915331 -1.87648491973,-1.87648491973 l 0,-0.165764348389 c 0,-1.03635400439 0.840130915331,-1.87648491973 1.87648491973,-1.87648491973 Z;M -0.0581061000545,-1.99098433926 l 0.116212200109,0 c 1.08990562844,0 1.97344871252,0.883543084083 1.97344871252,1.97344871252 l 0,0.0350712534878 c 0,1.08990562844 -0.883543084083,1.97344871252 -1.97344871252,1.97344871252 l -0.116212200109,0 c -1.08990562844,0 -1.97344871252,-0.883543084083 -1.97344871252,-1.97344871252 l 0,-0.0350712534878 c 0,-1.08990562844 0.883543084083,-1.97344871252 1.97344871252,-1.97344871252 Z;M 0,-2 l 0,0 c 1.1045694996,0 2,0.8954305004 2,2 l 0,0 c 0,1.1045694996 -0.8954305004,2 -2,2 l 0,0 c -1.1045694996,0 -2,-0.8954305004 -2,-2 l 0,0 c 0,-1.1045694996 0.8954305004,-2 2,-2 Z"
              />
            </path>
          </g>
        </g>
      </g>
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="pathMorphRotateCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphRotateCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate <code>android:rotation</code></span>
    </label>
    <label for="pathMorphSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

And a play/pause/stop demo:

<!-- TODO(alockwood): disable the buttons that can't be clicked. -->
<div id="playPauseStopDemo" class="svgDemoContainer">
  <svg xmlns="http://www.w3.org/2000/svg" id="ic_play_pause_stop" viewBox="0 0 18 18" class="svgDemo">
    <g id="button_translateX" transform="translate(0.75,0)">
      <g id="button_position" transform="translate(9,9)">
        <g id="button_rotate" transform="rotate(90)">
          <g id="button_translate" transform="translate(-9,-9)">
            <path id="icon_path" d="M9 5v8H4l5-8m0 0l5 8H9V5">
              <animate id="icon_state_change_animation" fill="freeze" attributeName="d" begin="infinite" dur="200ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" />
            </path>
          </g>
        </g>
      </g>
    </g>
  </svg>

  <div style="padding-left: 16px; padding-bottom: 16px;">
    <button id="play_button" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Play</button>
    <button id="pause_button" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Pause</button>
    <button id="stop_button" class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored">Stop</button>
  </div>

  <div class="svgDemoCheckboxContainer">
    <label for="playPauseStopAnimateRotationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="playPauseStopAnimateRotationCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate <code>android:rotation</code></span>
    </label>
    <label for="playPauseStopSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="playPauseStopSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

And finally a path morph digits demo:

<!-- TODO(alockwood): figure out how to deal with the global variables and stuff. -->
<!-- TODO(alockwood): figure out how to deal with the global variables and stuff. -->
<!-- TODO(alockwood): figure out how to deal with the global variables and stuff. -->
<!-- TODO(alockwood): figure out how to deal with the global variables and stuff. -->
<div id="svgPathMorphDigitsDemo" class="svgDemoContainer">
  <svg id="ic_countdown" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" style="width: 400px; height: 400px;">
    <g id="scale_container" transform="scale(0.8,0.8)">
      <g id="countdown_container" transform="translate(0.1,0.1)">
        <path id="countdown_digits" stroke="#000" stroke-width="0.02" fill="none">
          <animate id="countdown_digits_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
        <path id="countdown_digits_cp1" style="visibility: hidden;" fill="#64B5F6">
          <animate id="countdown_digits_cp1_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
        <path id="countdown_digits_cp2" style="visibility: hidden;" fill="#64B5F6">
          <animate id="countdown_digits_cp2_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
        <path id="countdown_digits_end" style="visibility: hidden;" fill="#F57C00">
          <animate id="countdown_digits_end_animation" attributeName="d" begin="indefinite" dur="300ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" fill="freeze" />
        </path>
      </g>
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="pathMorphShowControlPointsCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphShowControlPointsCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Show path control points</span>
    </label>
    <label for="pathMorphShowEndPointsCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphShowEndPointsCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Show path end points</span>
    </label>
    <label for="pathMorphDigitsSlowAnimationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="pathMorphDigitsSlowAnimationCheckbox" class="mdl-checkbox__input">
      <span class="mdl-checkbox__label">Slow animation</span>
    </label>
  </div>
</div>

### Trimming stroked paths

This is how trimming paths works:

<!-- TODO(alockwood): reduce the scope of the trim path interactive demo. -->

<div id="svgCircularProgressDemos" class="svgDemoContainer">
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
    <path id="stem" fill="none" stroke="#000" stroke-width="2" d="M24.7 12.7l7.117 7.207C32.787 20.7 34.46 23 37.5 23s5.5-2.46 5.5-5.5-2.46-5.5-5.5-5.5h-5.683-12.97" stroke-dasharray="9.75516635929,42.975462608" />
    <path id="search_circle" fill="none" stroke="#000" stroke-width="2" d="M25.39 13.39a5.5 5.5 0 1 1-7.78-7.78 5.5 5.5 0 1 1 7.78 7.78" />
    <g id="arrow_head" transform="translate(8,0)">
      <path id="arrow_head_top" fill="none" stroke="#000" stroke-width="2" d="M16.702 12.696l8.002-8.003" stroke-dashoffset="11.317" stroke-dasharray="11.317" />
      <path id="arrow_head_bottom" fill="none" stroke="#000" stroke-width="2" d="M16.71 11.276l8.012 8.012" stroke-dashoffset="11.33" stroke-dasharray="11.33" />
    </g>
  </svg>

  <svg xmlns="http://www.w3.org/2000/svg" id="ic_android_design" viewBox="0 0 308 68" class="svgDemo">
    <path id="andro" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M.342 40.576c10.073 8.093 17.46-26.214 24.843-37.008-2.504 13.87-.942 31.505 5.634 34.256 6.575 2.752 10.747-12.91 13.866-20.387 0 7.477-7.16 19.9-5.436 20.876 3.597-7.226 10.768-15.395 13.076-16.554 2.307-1.16-1.44 14.734.942 14.376 8.927 2.946 8.88-19.38 21.295-12.37-12.416-4.875-12.516 11.16-11.494 12.643C76.07 34.924 86 6.615 81.632.9 72.673-.873 72.18 37.314 76.07 38.14c10.548-.318 14.896-18.363 13.145-22.848-5.363 7.766 2.17 5.983 4.633 9.62 2.506 3.4-3.374 14.54 2.506 13.907 4.856-.844 15.163-23.165 17.118-17.82-5.727-2.37-10.81 16.224-4.143 16.824 8.588.318 9.125-16.823 4.142-17.34"
    />
    <path id="id" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M126.046 22.4c-4.284 6.404-2.96 14.827-.092 15.973 4.31 3.24 12.428-18.428 18.5-16.612-13.063 5.738-9.164 14.542-7.253 14.542 15.016-1.847 21.977-34.67 18.283-36.193-9.478 5.223-9.927 36.192-5.008 38.058 6.956 0 10.04-9.364 10.04-9.364"
    />
    <path id="a" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M15.513 25.218c4.082 0 15.976-2.228 15.976-2.228" />
    <path id="i1_dot" fill="none" stroke="#3f51b5" stroke-width="3" d="M127.723 15.887l-.56 1.116" />
    <path id="d" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M179.8 2.605c-3.668 7.51-5.576 31.462-6.24 35.943 1.646-1.62.974-1.677 2.045-1.677C212.01 27 192.197-.394 172.43 6.563" />
    <path id="esig" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M204.027 29.02c8.472-4.797 5.46-8.965 4.504-8.965-2.755-1.672-12.485 12.385-3.934 17.473 10.222 3.933 14.088-21.51 18.642-21.51-5.815 11.606 11.867 21.51-7.708 22.23 15.235 5.963 20.42-13.348 22.366-14.66-3.526 11.608-1.76 13.94.806 14.66 4.5 1.27 12.92-24.435 25.972-17.394-13.053-7.04-20.326 14.888-14.98 14.888s9.903-11.52 12.848-11.52c0 10.79-3.065 36.49-13.51 28.437"
    />
    <path id="n" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M274.092 17.934c-2.426 3.674-4.002 20.53-4.002 20.53 5.472-13.677 10.573-16.424 12.204-15.88 1.173 5.48-1.21 11.765 1.265 13.526 2.473 1.76 6.36-1.056 9.452-7.205"
    />
    <path id="i2_dot" fill="none" stroke="#3f51b5" stroke-linejoin="round" stroke-linecap="round" stroke-width="3" d="M239.723 15.887l-.56 1.116" />
  </svg>

  <div class="svgDemoCheckboxContainer">
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
            <ellipse id="circle_path" rx="9.5" ry="9.5" stroke="#3f51b5" stroke-width="2" stroke-dasharray="1.79095622248, 57.907584527" stroke-dashoffset="14.925" fill="none" />
          </g>
        </g>
      </g>
    </g>
  </svg>

  <div class="svgDemoCheckboxContainer">
    <label for="circularProgressOuterRotationCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressOuterRotationCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate <code>android:rotation</code> property</span>
    </label>
    <label for="circularProgressTrimPathOffsetCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressTrimPathOffsetCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate <code>android:trimPathOffset</code> property</span>
    </label>
    <label for="circularProgressTrimPathStartEndCheckbox" class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect">
      <input type="checkbox" id="circularProgressTrimPathStartEndCheckbox" class="mdl-checkbox__input" checked>
      <span class="mdl-checkbox__label">Animate <code>android:trimPath{Start,End}</code> property</span>
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
    <g id="hourglass_frame_position" transform="translate(12,12)">
      <g id="hourglass_frame_rotation" transform="rotate(0)">
        <g id="hourglass_frame_pivot" transform="translate(-12,-12)">
          <g id="hourglass_frame">
            <g id="group_1_transform" transform="translate(12,12)">
              <g id="group_1">
                <path id="path_3_merged" d="M1 0l6.29-6.29c.63-.63.19-1.71-.7-1.71H-6.59c-.89 0-1.33 1.08-.7 1.71L-1 0l-6.29 6.29c-.63.63-.19 1.71.7 1.71H6.59c.89 0 1.33-1.08.7-1.71L1 0zm-5.17-6h8.34L0-1.83-4.17-6zm0 12L0 1.83 4.17 6h-8.34z" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
    <g id="hourglass_fill_position" transform="translate(12,12)">
      <g id="hourglass_fill_rotation" transform="rotate(0)">
        <g id="hourglass_fill_pivot" transform="translate(-12,-12)">
          <g id="hourglass_fill">
            <clipPath id="mask_1">
              <path id="mask_1_path" d="M24 13.4H0V24h24V13.4z">
                <animate id="mask_1_path_animation" fill="freeze" attributeName="d" begin="infinite" dur="1000ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" values="M 24,13.3999938965 c 0,0 -24,0 -24,0 c 0,0 0,10.6 0,10.6000061035 c 0,0 24,0 24,0 c 0,0 0,-10.6000061035 0,-10.6000061035 Z;M 24,0.00173950195312 c 0,0 -24,0 -24,0 c 0,0 0,10.6982574463 0,10.6982574463 c 0,0 24,0 24,0 c 0,0 0,-10.6982574463 0,-10.6982574463 Z"
                />
              </path>
            </clipPath>
            <g id="mask_1_clip_path_group" clip-path="url(#mask_1)">
              <path id="path_2" d="M13 12l6.293-6.293c.63-.63.184-1.707-.707-1.707H5.416c-.892 0-1.338 1.077-.708 1.707L11 12l-6.292 6.293c-.63.63-.184 1.707.707 1.707h13.17c.892 0 1.338-1.077.708-1.707L13 12z" />
            </g>
            <path id="mask_1_path_debug" d="M24 13.4H0V24h24V13.4z" fill="#F44336" fill-opacity=".3" visibility="hidden">
              <animate id="mask_1_path_debug_animation" fill="freeze" attributeName="d" begin="infinite" dur="1000ms" calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1" values="M 24,13.3999938965 c 0,0 -24,0 -24,0 c 0,0 0,10.6 0,10.6000061035 c 0,0 24,0 24,0 c 0,0 0,-10.6000061035 0,-10.6000061035 Z;M 24,0.00173950195312 c 0,0 -24,0 -24,0 c 0,0 0,10.6982574463 0,10.6982574463 c 0,0 24,0 24,0 c 0,0 0,-10.6982574463 0,-10.6982574463 Z"
              />
            </path>
          </g>
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
    <path id="eye_mask_clip_path_debug" d="M2 4.27L19.73 22l2.54-2.54L4.54 1.73V1H23v22H1V4.27z" fill="#F44336" fill-opacity=".3" visibility="hidden">
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
