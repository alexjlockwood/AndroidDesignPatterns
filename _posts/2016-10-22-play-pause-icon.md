---
layout: post
title: 'Icon morphing'
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

### Transforming paths

asdf

<svg id="expandcollapsesvg" class="bordered-image"></svg>

### Morphing paths

asdf

<svg id="plusminussvg" class="bordered-image"></svg>
<svg id="crossticksvg" class="bordered-image"></svg>
<svg id="drawerarrowsvg" class="bordered-image"></svg>

### Trimming stroked paths

asdf

### Clipping paths

asdf

Here is the link to the [sample app source code][adp-delightful-details].

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
        transform: 'R-180,12,12',
      }, 300, fastOutSlowInInterpolator);
    } else {
      plusMinusPath.animate({
        d: "M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z",
        transform: 'R-180,12,12',
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
        transform: 'R-360,12,12',
      }, 300, fastOutSlowInInterpolator);
    } else {
      crossTickPath.animate({
        d: "M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4",
        transform: 'R-360,12,12',
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
