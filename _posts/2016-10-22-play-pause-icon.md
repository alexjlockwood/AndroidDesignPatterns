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
---

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

Examples:

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

And here's a linaer indeterminate progress bar example:

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

asdf

Examples:

<!--
<iframe width="100%" height="400" src="//jsfiddle.net/alexjlockwood/L4kfh0rw/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="400" src="//jsfiddle.net/alexjlockwood/1ezda0cd/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="400" src="//jsfiddle.net/alexjlockwood/8fLeyc6j/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="400" src="//jsfiddle.net/alexjlockwood/gwqf0xmb/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="500" src="//jsfiddle.net/alexjlockwood/3ka8fugd/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="600" src="//jsfiddle.net/alexjlockwood/bdep6pec/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
-->

### Trimming stroked paths

<!--
<iframe width="100%" height="300" src="//jsfiddle.net/alexjlockwood/jvkewo4n/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="300" src="//jsfiddle.net/alexjlockwood/jxu1L9ao/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="200" src="//jsfiddle.net/alexjlockwood/4sh9tLx7/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

<iframe width="100%" height="500" src="//jsfiddle.net/alexjlockwood/7em6y3vs/embedded/result/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>
-->

### Clipping paths

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
