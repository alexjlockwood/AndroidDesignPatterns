---
layout: post
title: 'Icon animations'
date: 2016-10-22
permalink: /2016/10/icon-morphing.html
related: ['/2013/08/fragment-transaction-commit-state-loss.html',
    '/2013/04/retaining-objects-across-config-changes.html',
    '/2016/08/contextcompat-getcolor-getdrawable.html']
style: |
  .bordered-image {
    border-width: 1px;
    border-style: solid;
    display: inline;
    max-width:240px;
  }
---

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

* **`<path>`** - Defines the paths to be drawn using [SVG path syntax][svg-path-reference].

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

* Expand/collapse
* Radio button
* Alarm/clock/stopwatch
* Any example illustrating asymettric animations?

<svg id="expandcollapsesvg" class="bordered-image"></svg>

### Morphing paths

asdf

Examples:

* Plus to minus
* Cross to tick
* Menu drawer to back arrow
* Overflow to back arrow
* Play/pause/stop
* Countdown digits

<svg id="plusminussvg" class="bordered-image"></svg>
<svg id="crossticksvg" class="bordered-image"></svg>
<svg id="drawerarrowsvg" class="bordered-image"></svg>

### Trimming stroked paths

* Progress bars
* Search to back arrow
* Handwriting

### Clipping paths

* Quick setting icons (enable/disable)
* Timer (hourglass)
* Heart break

## Further reading

It also might be useful to give a listing of useful tools/resources for further reading.

## Miscellaneous stuff

Here is the link to the [sample app source code][adp-delightful-details].

This stuff is probably better suited to go in the sample app `README.md` file.

* Which stuff is/isn't backwards compatible.
* Importance/usefulness of tinting icons.
* Explain how `android:propertyXName` and `android:propertyYName` can be used.
* Mention that currently animated vectors can only be constructed in XML (and that this might change in the future).

<script src="/scripts/snap.svg-min.js"></script>
<script>
var bezier = function(x1, y1, x2, y2, duration){
	var epsilon = (1000 / 60 / duration) / 4;

	var curveX = function(t){
		var v = 1 - t;
		return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
	};

	var curveY = function(t){
		var v = 1 - t;
		return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
	};

	var derivativeCurveX = function(t){
		var v = 1 - t;
		return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
	};

	return function(t){

		var x = t, t0, t1, t2, x2, d2, i;

		// First try a few iterations of Newton's method -- normally very fast.
		for (t2 = x, i = 0; i < 8; i++){
			x2 = curveX(t2) - x;
			if (Math.abs(x2) < epsilon) return curveY(t2);
			d2 = derivativeCurveX(t2);
			if (Math.abs(d2) < 1e-6) break;
			t2 = t2 - x2 / d2;
		}

		t0 = 0, t1 = 1, t2 = x;

		if (t2 < t0) return curveY(t0);
		if (t2 > t1) return curveY(t1);

		// Fallback to the bisection method for reliability.
		while (t0 < t1){
			x2 = curveX(t2);
			if (Math.abs(x2 - x) < epsilon) return curveY(t2);
			if (x > x2) t0 = t2;
			else t1 = t2;
			t2 = (t1 - t0) * .5 + t0;
		}

		// Failure
		return curveY(t2);

	};
};

var expandCollapse = Snap("#expandcollapsesvg").attr({ viewBox: "0 0 24 24" });
var expandCollapseLeftPath =
    expandCollapse.path("M 1,-1 L 1,7 L -1,7 L -1,-1 Z");
var expandCollapseRightPath =
    expandCollapse.path("M 1,-7 L 1,1 L -1,1 L -1,-7 Z");
var expandCollapseGroup = expandCollapse.group(expandCollapseLeftPath, expandCollapseRightPath);

expandCollapseLeftPath.transform("R135,0,0");
expandCollapseRightPath.transform("R45,0,0");
expandCollapseGroup.transform("T12,15");

var fastOutSlowInInterpolator = bezier(0.4, 0, 0.2, 1, 250);
var expandCollapseInterpolator = bezier(0, 0, 0, 1, 200);
var shouldReverseExpandCollapse = false;
expandCollapse.click(function () {
    if (shouldReverseExpandCollapse) {
      expandCollapseLeftPath.transform("R45,0,0");
      expandCollapseRightPath.transform("R135,0,0");
      expandCollapseGroup.transform("T12,9");
      expandCollapseLeftPath.animate({
        transform: 'R135,0,0',
      }, 200, expandCollapseInterpolator);
      expandCollapseRightPath.animate({
        transform: 'R45,0,0',
      }, 200, expandCollapseInterpolator);
      expandCollapseGroup.animate({
        transform: 'T12,15',
      }, 250, fastOutSlowInInterpolator);
    } else {
      expandCollapseLeftPath.transform("R135,0,0");
      expandCollapseRightPath.transform("R45,0,0");
      expandCollapseGroup.transform("T12,15");
      expandCollapseLeftPath.animate({
        transform: 'R45,0,0',
      }, 200, expandCollapseInterpolator);
      expandCollapseRightPath.animate({
        transform: 'R135,0,0',
      }, 200, expandCollapseInterpolator);
      expandCollapseGroup.animate({
        transform: 'T12,9',
      }, 250, fastOutSlowInInterpolator);
    }
    shouldReverseExpandCollapse = !shouldReverseExpandCollapse;
});

var plusMinus = Snap("#plusminussvg");
plusMinus.attr({ viewBox: "0 0 24 24" });
var plusMinusPath = plusMinus.path("M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z");
var shouldReversePlusMinus = false;
plusMinus.click(function () {
    plusMinusPath.transform("R0,12,12");
    if (shouldReversePlusMinus) {
      plusMinusPath.animate({
        d: "M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z",
      }, 250, fastOutSlowInInterpolator);
      plusMinusPath.animate({
        transform: 'R180,12,12',
      }, 300, fastOutSlowInInterpolator);
    } else {
      plusMinusPath.animate({
        d: "M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z",
      }, 250, fastOutSlowInInterpolator);
      plusMinusPath.animate({
        transform: 'R180,12,12',
      }, 300, fastOutSlowInInterpolator);
    }
    shouldReversePlusMinus = !shouldReversePlusMinus;
});

var crossTick = Snap("#crossticksvg");
crossTick.attr({ viewBox: "0 0 24 24" });
var crossTickPath = crossTick.path("M4.8,13.4 L9.707106781,18.307106781 M9.69289321881,16.9071067812 L19.6,7");
crossTickPath.attr({
  stroke: "#000",
  strokeWidth: "2",
  strokeLineCap: "square",
});

var shouldReverseCrossTick = false;
crossTick.click(function () {
    crossTickPath.transform("R0,12,12");
    if (shouldReverseCrossTick) {
      crossTickPath.animate({
        d: "M4.8,13.4 L9.707106781,18.307106781 M9.69289321881,16.9071067812 L19.6,7",
        transform: 'R360,12,12',
      }, 300, fastOutSlowInInterpolator);
    } else {
      crossTickPath.animate({
        d: "M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4",
        transform: 'R360,12,12',
      }, 300, fastOutSlowInInterpolator);
    }
    shouldReverseCrossTick = !shouldReverseCrossTick;
});

var drawerArrow = Snap("#drawerarrowsvg");
drawerArrow.attr({ viewBox: "0 0 24 24" });
var drawerArrowPath = drawerArrow.path("M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z");

var shouldReverseDrawerArrow = false;
drawerArrow.click(function () {
    if (shouldReverseDrawerArrow) {
      drawerArrowPath.transform("R180,12,12");
      drawerArrowPath.animate({
        d: "M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z",
        transform: 'R360,12,12',
      }, 300, fastOutSlowInInterpolator);
    } else {
      drawerArrowPath.transform("R0,12,12");
      drawerArrowPath.animate({
        d: "M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20 z",
        transform: 'R180,12,12',
      }, 300, fastOutSlowInInterpolator);
    }
    shouldReverseDrawerArrow = !shouldReverseDrawerArrow;
});
</script>

  [adp-delightful-details]: https://github.com/alexjlockwood/adp-delightful-details
  [svg-path-reference]: http://www.w3.org/TR/SVG11/paths.html#PathData
