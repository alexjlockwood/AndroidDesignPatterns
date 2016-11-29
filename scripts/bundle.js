/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bezierEasing = __webpack_require__(1);
	var webAnimationsJs = __webpack_require__(2);
	var pathDataPolyfill = __webpack_require__(3);

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: transforming play, pause, and record icons (interactive)
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  function getCheckbox(checkboxId) {
	    return document.querySelector("input[id=" + checkboxId + "]");
	  }

	  function updateGroupTransform(iconType, transformType, shouldEnable) {
	    var group = document.getElementById("transform_paths_" + iconType + "_" + transformType);
	    var currentTransformValue;
	    var nextTransformValue;
	    if (transformType === "translation") {
	      currentTransformValue = shouldEnable ? "translate(0px,0px)" : "translate(40px,0px)";
	      nextTransformValue = shouldEnable ? "translate(40px,0px)" : "translate(0px,0px)";
	    } else if (transformType === "scale") {
	      currentTransformValue = shouldEnable ? "scale(1,1)" : "scale(1.5,1)";
	      nextTransformValue = shouldEnable ? "scale(1.5,1)" : "scale(1,1)";
	    } else {
	      currentTransformValue = shouldEnable ? "rotate(0deg)" : "rotate(90deg)";
	      nextTransformValue = shouldEnable ? "rotate(90deg)" : "rotate(0deg)";
	    }
	    group.animate([
	      { transform: currentTransformValue, offset: 0, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
	      { transform: nextTransformValue, offset: 1 }
	    ], { duration: 300, fill: "forwards" });
	  }

	  var playScale = getCheckbox("playTransformScaleCheckbox");
	  var playRotation = getCheckbox("playTransformRotationCheckbox");
	  var playTranslation = getCheckbox("playTransformTranslationCheckbox");
	  var pauseScale = getCheckbox("pauseTransformScaleCheckbox");
	  var pauseRotation = getCheckbox("pauseTransformRotationCheckbox");
	  var pauseTranslation = getCheckbox("pauseTransformTranslationCheckbox");
	  var recordScale = getCheckbox("recordTransformScaleCheckbox");
	  var recordRotation = getCheckbox("recordTransformRotationCheckbox");
	  var recordTranslation = getCheckbox("recordTransformTranslationCheckbox");

	  playScale.addEventListener("change", function () {
	    updateGroupTransform("play", "scale", playScale.checked);
	  });
	  playRotation.addEventListener("change", function () {
	    updateGroupTransform("play", "rotation", playRotation.checked);
	  });
	  playTranslation.addEventListener("change", function () {
	    updateGroupTransform("play", "translation", playTranslation.checked);
	  });
	  pauseScale.addEventListener("change", function () {
	    updateGroupTransform("pause", "scale", pauseScale.checked);
	  });
	  pauseRotation.addEventListener("change", function () {
	    updateGroupTransform("pause", "rotation", pauseRotation.checked);
	  });
	  pauseTranslation.addEventListener("change", function () {
	    updateGroupTransform("pause", "translation", pauseTranslation.checked);
	  });
	  recordScale.addEventListener("change", function () {
	    updateGroupTransform("record", "scale", recordScale.checked);
	  });
	  recordRotation.addEventListener("change", function () {
	    updateGroupTransform("record", "rotation", recordRotation.checked);
	  });
	  recordTranslation.addEventListener("change", function () {
	    updateGroupTransform("record", "translation", recordTranslation.checked);
	  });
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: transforming groups of paths (chevron, alarm clock, radio button)
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1.0)";

	  function getScaledAnimationDuration(durationMillis) {
	    var slowAnimationSelector = document.querySelector("input[id=basicTransformationSlowAnimationCheckbox]");
	    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 10 : 1;
	    return durationMillis * currentAnimationDurationFactor;
	  }

	  document.querySelector("input[id=basicTransformationHighlightAnimatingPathsCheckbox]").addEventListener("change", function () {
	    var shouldHighlight = document.querySelector("input[id=basicTransformationHighlightAnimatingPathsCheckbox]").checked;
	    var visibility = shouldHighlight ? "visible" : "hidden";
	    var highlightPaths = document.getElementsByClassName("delightIconHighlightPath");
	    var i = 0;
	    for (i = 0; i < highlightPaths.length; i += 1) {
	      highlightPaths.item(i).style.visibility = visibility;
	    }
	  });

	  function animateTransform(elementId, durationMillis, transformType, fromValue, toValue, easingFunction) {
	    document.getElementById(elementId).animate([
	      { transform: transformType + "(" + fromValue + ")", offset: 0, easing: easingFunction },
	      { transform: transformType + "(" + toValue + ")", offset: 1 }
	    ], { duration: getScaledAnimationDuration(durationMillis), fill: "forwards" });
	  }

	  // =============== Chevron icon.
	  var isExpanded = false;
	  document.getElementById("ic_expand_collapse").addEventListener("click", function () {
	    if (isExpanded) {
	      animateTransform("chevron", 250, "translate", "12px,9px", "12px,15px", fastOutSlowIn);
	      animateTransform("leftBar", 200, "rotate", "45deg", "135deg", "cubic-bezier(0, 0, 0, 1)");
	      animateTransform("rightBar", 200, "rotate", "135deg", "45deg", "cubic-bezier(0, 0, 0, 1)");
	    } else {
	      animateTransform("chevron", 250, "translate", "12px,15px", "12px,9px", fastOutSlowIn);
	      animateTransform("leftBar", 200, "rotate", "135deg", "45deg", "cubic-bezier(0, 0, 0, 1)");
	      animateTransform("rightBar", 200, "rotate", "45deg", "135deg", "cubic-bezier(0, 0, 0, 1)");
	    }
	    isExpanded = !isExpanded;
	  });

	  // =============== Radio button icon.
	  var isRadioButtonChecked = false;
	  document.getElementById("ic_radiobutton").addEventListener("click", function () {
	    animateRadioButton(!isRadioButtonChecked);
	    isRadioButtonChecked = !isRadioButtonChecked;
	  });

	  function animateRadioButton(isAnimatingToCheck) {
	    document.getElementById("radiobutton_ring_group").animate([{
	      transform: "scale(1,1)",
	      offset: 0,
	      easing: fastOutSlowIn
	    }, {
	      transform: isAnimatingToCheck ? "scale(0.5,0.5)" : "scale(0.9,0.9)",
	      offset: isAnimatingToCheck ? 0.333 : 0.4,
	      easing: isAnimatingToCheck ? fastOutSlowIn : "cubic-bezier(0.4, 0, 0.4, 1.0)"
	    }, {
	      transform: isAnimatingToCheck ? "scale(0.9,0.9)" : "scale(0.5,0.5)",
	      offset: isAnimatingToCheck ? 0.333 : 0.4,
	      easing: isAnimatingToCheck ? fastOutSlowIn : "cubic-bezier(0.4, 0, 0.4, 1.0)"
	    }, {
	      transform: "scale(1,1)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(500),
	      fill: "forwards"
	    });
	    document.getElementById("radiobutton_ring_path").animate([{
	      strokeWidth: "2",
	      offset: 0,
	      easing: isAnimatingToCheck ? "cubic-bezier(0.4, 0, 0.4, 1.0)" : fastOutSlowIn
	    }, {
	      strokeWidth: isAnimatingToCheck ? "18" : "2",
	      offset: isAnimatingToCheck ? 0.333 : 0.4,
	      easing: fastOutSlowIn
	    }, {
	      strokeWidth: isAnimatingToCheck ? "2" : "18",
	      offset: isAnimatingToCheck ? 0.333 : 0.4,
	      easing: fastOutSlowIn
	    }, {
	      strokeWidth: "2",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(500),
	      fill: "forwards"
	    });
	    document.getElementById("radiobutton_dot_group").animate([{
	      transform: isAnimatingToCheck ? "scale(0,0)" : "scale(1,1)",
	      offset: 0,
	      easing: fastOutSlowIn
	    }, {
	      transform: isAnimatingToCheck ? "scale(0,0)" : "scale(1.5,1.5)",
	      offset: isAnimatingToCheck ? 0.333 : 0.4,
	      easing: fastOutSlowIn
	    }, {
	      transform: isAnimatingToCheck ? "scale(1.5,1.5)" : "scale(0,0)",
	      offset: isAnimatingToCheck ? 0.333 : 0.4,
	      easing: fastOutSlowIn
	    }, {
	      transform: isAnimatingToCheck ? "scale(1,1)" : "scale(0,0)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(500),
	      fill: "forwards"
	    });
	  }

	  // =============== Alarm clock icon.
	  document.getElementById("ic_alarm").addEventListener("click", function () {
	    animateAlarmClock();
	  });

	  function createKeyFrame(rotationDegrees, keyFrameOffset) {
	    return {
	      transform: "rotate(" + rotationDegrees + "deg)",
	      offset: keyFrameOffset,
	      easing: fastOutSlowIn
	    };
	  }

	  function animateAlarmClock() {
	    var keyFrames = [];
	    var i = 0;
	    for (i = 0; i < 22; i += 1) {
	      if (i === 0) {
	        keyFrames.push(createKeyFrame(0, 0));
	      } else if (i < 21) {
	        var rotation = i % 2 === 0 ? -8 : 8;
	        keyFrames.push(createKeyFrame(rotation, 0.025 + ((i - 1) * 0.05)));
	      } else {
	        keyFrames.push({
	          transform: "rotate(0deg)",
	          offset: 1.0
	        });
	      }
	    }
	    document.getElementById("alarmclock_button_rotation").animate(keyFrames, {
	      duration: getScaledAnimationDuration(1333),
	      fill: "forwards"
	    });
	  }
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: transforming groups of paths, linear indeterminate progress bar
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {

	  function createOuterRect1Animation() {
	    return document.getElementById('progressBarOuterRect1').animate([
	      { transform: 'translateX(-522.59998px)', offset: 0, easing: 'linear' },
	      { transform: 'translateX(-522.59998px)', offset: 0.2, easing: 'cubic-bezier(0.5, 0, 0.701732, 0.495818703)' },
	      { transform: 'translateX(-185.382686832px)', offset: 0.5915, easing: 'cubic-bezier(0.302435, 0.38135197, 0.55, 0.956352125)' },
	      { transform: 'translateX(235.600006104px)', offset: 1 }
	    ], { duration: 2000, iterations: Infinity });
	  }

	  function createInnerRect1Animation() {
	    return document.getElementById('progressBarInnerRect1').animate([
	      { transform: 'scaleX(0.1)', offset: 0, easing: 'linear' },
	      { transform: 'scaleX(0.1)', offset: 0.3665, easing: 'cubic-bezier(0.334731432, 0.124819821, 0.785843996, 1)' },
	      { transform: 'scaleX(0.826849212646)', offset: 0.6915, easing: 'cubic-bezier(0.225732004, 0, 0.233648906, 1.3709798)' },
	      { transform: 'scaleX(0.1)', offset: 1 }
	    ], { duration: 2000, iterations: Infinity });
	  }

	  function createOuterRect2Animation() {
	    return document.getElementById('progressBarOuterRect2').animate([{
	      transform: 'translateX(-161.600006104px)',
	      offset: 0,
	      easing: 'cubic-bezier(0.15, 0, 0.5150584, 0.409684966)'
	    }, {
	      transform: 'translateX(-26.0531211724px)',
	      offset: 0.25,
	      easing: 'cubic-bezier(0.3103299, 0.284057684, 0.8, 0.733718979)'
	    }, {
	      transform: 'translateX(142.190187566px)',
	      offset: 0.4835,
	      easing: 'cubic-bezier(0.4, 0.627034903, 0.6, 0.902025796)'
	    }, {
	      transform: 'translateX(458.600006104px)',
	      offset: 1
	    }], {
	      duration: 2000,
	      iterations: Infinity
	    });
	  }

	  function createInnerRect2Animation() {
	    return document.getElementById('progressBarInnerRect2').animate([
	      { transform: 'scaleX(0.1)', offset: 0, easing: 'cubic-bezier(0.205028172, 0.057050836, 0.57660995, 0.453970841)' },
	      { transform: 'scaleX(0.571379510698)', offset: 0.1915, easing: 'cubic-bezier(0.152312994, 0.196431957, 0.648373778, 1.00431535)' },
	      { transform: 'scaleX(0.909950256348)', offset: 0.4415, easing: 'cubic-bezier(0.25775882, -0.003163357, 0.211761916, 1.38178961)' },
	      { transform: 'scaleX(0.1)', offset: 1 }
	    ], { duration: 2000, iterations: Infinity });
	  }

	  var outerRect1Animation = createOuterRect1Animation();
	  var innerRect1Animation = createInnerRect1Animation();
	  var outerRect2Animation = createOuterRect2Animation();
	  var innerRect2Animation = createInnerRect2Animation();

	  var scaleSelector = document.querySelector("input[id=linearProgressScaleCheckbox]");
	  var translateSelector = document.querySelector("input[id=linearProgressTranslateCheckbox]");

	  function restartAnimations() {
	    outerRect1Animation.cancel();
	    innerRect1Animation.cancel();
	    outerRect2Animation.cancel();
	    innerRect2Animation.cancel();
	    outerRect1Animation = createOuterRect1Animation();
	    innerRect1Animation = createInnerRect1Animation();
	    outerRect2Animation = createOuterRect2Animation();
	    innerRect2Animation = createInnerRect2Animation();
	    if (!scaleSelector.checked) {
	      innerRect1Animation.cancel();
	      innerRect2Animation.cancel();
	    }
	    if (!translateSelector.checked) {
	      outerRect1Animation.cancel();
	      outerRect2Animation.cancel();
	    }
	  }

	  scaleSelector.addEventListener("change", function () {
	    restartAnimations();
	  });
	  translateSelector.addEventListener("change", function () {
	    restartAnimations();
	  });
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: trimming stroked paths, interactive demo
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  var trimPathStart = 0.0;
	  var trimPathEnd = 0.5;
	  var trimPathOffset = 0.0;

	  function updateSliderText() {
	    document.getElementById("trimPathStartValue").innerHTML = trimPathStart;
	    document.getElementById("trimPathEndValue").innerHTML = trimPathEnd;
	    document.getElementById("trimPathOffsetValue").innerHTML = trimPathOffset;
	  }

	  function convertCurrentTrimToDashArray(pathLength) {
	    // Calculate the normalized length of the trimmed path. If trimPathStart
	    // is greater than trimPathEnd, then the result should be the combined
	    // length of the two line segments: [trimPathStart,1] and [0,trimPathEnd].
	    var trimPathLengthNormalized = trimPathEnd - trimPathStart;
	    if (trimPathStart > trimPathEnd) {
	      trimPathLengthNormalized += 1;
	    }

	    // Calculate the absolute length of the trim path by multiplying the
	    // normalized length with the actual length of the path.
	    var trimPathLength = trimPathLengthNormalized * pathLength;

	    // Return the dash array. The first array element is the length of
	    // the trimmed path and the second element is the gap, which is the
	    // difference in length between the total path length and the trimmed
	    // path length.
	    return trimPathLength + "," + (pathLength - trimPathLength);
	  }

	  function convertCurrentTrimToDashOffset(pathLength) {
	    // The amount to offset the path is equal to the trimPathStart plus
	    // trimPathOffset. We mod the result because the trimmed path
	    // should wrap around once it reaches 1.
	    var trueTrimPathStart = (trimPathStart + trimPathOffset) % 1;

	    // Return the dash offset.
	    return pathLength * (1 - trueTrimPathStart);
	  }

	  function updateStrokePath() {
	    var linePath = document.getElementById("line_path");
	    var linePathLength = linePath.getTotalLength();
	    var lineDashArray = convertCurrentTrimToDashArray(linePathLength);
	    var lineDashOffset = convertCurrentTrimToDashOffset(linePathLength);
	    linePath.setAttribute("stroke-dasharray", lineDashArray);
	    linePath.setAttribute("stroke-dashoffset", lineDashOffset);
	  }

	  function updateUi() {
	    updateStrokePath();
	    updateSliderText();
	  }

	  document.querySelector("input[id=trimPathStart]").addEventListener("change", function () {
	    trimPathStart = document.querySelector("input[id=trimPathStart]").value / 100;
	    updateUi();
	  });
	  document.querySelector("input[id=trimPathEnd]").addEventListener("change", function () {
	    trimPathEnd = document.querySelector("input[id=trimPathEnd]").value / 100;
	    updateUi();
	  });
	  document.querySelector("input[id=trimPathOffset]").addEventListener("change", function () {
	    trimPathOffset = document.querySelector("input[id=trimPathOffset]").value / 100;
	    updateUi();
	  });
	  document.querySelector("input[id=trimPathStart]").addEventListener("input", function () {
	    trimPathStart = document.querySelector("input[id=trimPathStart]").value / 100;
	    updateUi();
	  });
	  document.querySelector("input[id=trimPathEnd]").addEventListener("input", function () {
	    trimPathEnd = document.querySelector("input[id=trimPathEnd]").value / 100;
	    updateUi();
	  });
	  document.querySelector("input[id=trimPathOffset]").addEventListener("input", function () {
	    trimPathOffset = document.querySelector("input[id=trimPathOffset]").value / 100;
	    updateUi();
	  });
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: trimming stroked paths (fingerprint, search to back, etc.)
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  var root = document.getElementById("includes6");
	  var fastOutSlowIn = common.fastOutSlowIn;
	  var fastOutLinearIn = common.fastOutLinearIn;
	  var linearOutSlowIn = common.linearOutSlowIn;

	  function animateTrimPathStartWithDelay(strokePathId, durationMillis, startDelayMillis, easingFunction, isAnimatingIn) {
	    var strokePath = document.getElementById(strokePathId);
	    var pathLength = strokePath.getTotalLength();
	    // TODO(alockwood): remove this hack...
	    strokePath.animate([
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? -pathLength : 0), offset: 0 },
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? -pathLength : 0), offset: 1 }
	    ], { duration: 0, fill: "forwards" });
	    strokePath.animate([
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? -pathLength : 0), easing: easingFunction, offset: 0 },
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? 0 : -pathLength), offset: 1 }
	    ], { duration: common.getDuration(root, durationMillis), fill: "forwards", delay: common.getDuration(root, startDelayMillis) });
	  }

	  function animateTrimPathEndWithDelay(strokePathId, durationMillis, startDelayMillis, easingFunction, isAnimatingIn) {
	    var strokePath = document.getElementById(strokePathId);
	    var pathLength = strokePath.getTotalLength();
	    // TODO(alockwood): remove this hack...
	    strokePath.animate([
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? pathLength : 0), offset: 0 },
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? pathLength : 0), offset: 1 }
	    ], { duration: 0, fill: "forwards" });
	    strokePath.animate([
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? pathLength : 0), easing: easingFunction, offset: 0 },
	      { strokeDasharray: pathLength, strokeDashoffset: (isAnimatingIn ? 0 : pathLength), offset: 1 }
	    ], { duration: common.getDuration(root, durationMillis), fill: "forwards", delay: common.getDuration(root, startDelayMillis) });
	  }

	  document.querySelector(root.nodeName + "#" + root.id + " input[id=includes6_showTrimPathsCheckbox]").addEventListener("change", function () {
	    var visibility = document.querySelector(root.nodeName + "#" + root.id + " input[id=includes6_showTrimPathsCheckbox]").checked ? "visible" : "hidden";
	    var fingerprintDebugPaths = document.getElementsByClassName("delightIconFingerPrintStrokePathDebug");
	    var i = 0;
	    for (i = 0; i < fingerprintDebugPaths.length; i += 1) {
	      fingerprintDebugPaths.item(i).style.visibility = visibility;
	    }
	    var handwritingDebugPaths = document.getElementsByClassName("delightIconHandwritingStrokePathDebug");
	    for (i = 0; i < handwritingDebugPaths.length; i += 1) {
	      handwritingDebugPaths.item(i).style.visibility = visibility;
	    }
	    var searchToBackDebugPaths = document.getElementsByClassName("delightIconSearchToBackStrokePathDebug");
	    for (i = 0; i < searchToBackDebugPaths.length; i += 1) {
	      searchToBackDebugPaths.item(i).style.visibility = visibility;
	    }
	  });

	  // =============== Search to back animation.
	  var isBackArrow = false;
	  document.getElementById("ic_search_back").addEventListener("click", function () {
	    animateArrowHead(!isBackArrow);
	    animateSearchCircle(isBackArrow);
	    animateStem(!isBackArrow);
	    isBackArrow = !isBackArrow;
	  });

	  function animateStem(isAnimatingToBack) {
	    var fastOutSlowInFunction = bezierEasing(0.4, 0, 0.2, 1);
	    var stemPath = document.getElementById("stem");
	    var pathLength = stemPath.getTotalLength();
	    var keyFrames = [];
	    var i;
	    var trimPathStart;
	    var trimPathEnd;
	    var trimPathLength;
	    if (isAnimatingToBack) {
	      for (i = 0; i < 600; i += 16) {
	        trimPathStart = fastOutSlowInFunction(i / 600) * 0.75;
	        trimPathEnd = fastOutSlowInFunction(Math.min(i, 450) / 450) * (1 - 0.185) + 0.185;
	        trimPathLength = trimPathEnd - trimPathStart;
	        keyFrames.push({
	          strokeDasharray: (trimPathLength * pathLength) + "," + pathLength,
	          strokeDashoffset: (-trimPathStart * pathLength),
	          easing: "linear",
	          offset: (i / 600)
	        });
	      }
	      keyFrames.push({
	        strokeDasharray: (0.25 * pathLength) + "," + pathLength,
	        strokeDashoffset: (-0.75 * pathLength),
	        offset: 1
	      });
	      return stemPath.animate(keyFrames, {
	        duration: common.getDuration(root, 600),
	        fill: "forwards"
	      });
	    } else {
	      for (i = 0; i < 600; i += 16) {
	        trimPathStart = (1 - fastOutSlowInFunction(Math.min(i, 450) / 450)) * 0.75;
	        trimPathEnd = 1 - fastOutSlowInFunction(i / 600) * 0.815;
	        trimPathLength = trimPathEnd - trimPathStart;
	        keyFrames.push({
	          strokeDasharray: (trimPathLength * pathLength) + "," + pathLength,
	          strokeDashoffset: (-trimPathStart * pathLength),
	          easing: "linear",
	          offset: (i / 600)
	        });
	      }
	      keyFrames.push({
	        strokeDasharray: (0.185 * pathLength) + "," + pathLength,
	        strokeDashoffset: 0,
	        offset: 1
	      });
	      return stemPath.animate(keyFrames, {
	        duration: common.getDuration(root, 600),
	        fill: "forwards"
	      });
	    }
	  }

	  function animateSearchCircle(isAnimatingIn) {
	    var searchCirclePath = document.getElementById("search_circle");
	    var pathLength = searchCirclePath.getTotalLength();
	    searchCirclePath.animate([{
	      strokeDasharray: pathLength,
	      strokeDashoffset: (isAnimatingIn ? pathLength : 0),
	      easing: fastOutSlowIn,
	      offset: 0
	    }, {
	      strokeDasharray: pathLength,
	      strokeDashoffset: (isAnimatingIn ? 0 : pathLength),
	      offset: 1
	    }], {
	      duration: common.getDuration(root, 250),
	      fill: "forwards",
	      delay: common.getDuration(root, isAnimatingIn ? 300 : 0)
	    });
	  }

	  function animateArrowHead(isAnimatingIn) {
	    var arrowHeadGroup = document.getElementById("arrow_head");
	    var arrowHeadTop = document.getElementById("arrow_head_top");
	    var arrowHeadBottom = document.getElementById("arrow_head_bottom");
	    var arrowHeadTopPathLength = arrowHeadTop.getTotalLength();
	    var arrowHeadBottomPathLength = arrowHeadBottom.getTotalLength();
	    arrowHeadGroup.animate([{
	      transform: (isAnimatingIn ? "translate(8px,0px)" : "translate(0px,0px)"),
	      easing: (isAnimatingIn ? linearOutSlowIn : fastOutLinearIn),
	      offset: 0
	    }, {
	      transform: (isAnimatingIn ? "translate(0px,0px)" : "translate(24px,0px)"),
	      offset: 1
	    }], {
	      duration: common.getDuration(root, 250),
	      fill: "forwards",
	      delay: common.getDuration(root, isAnimatingIn ? 350 : 0)
	    });
	    arrowHeadTop.animate([{
	      strokeDasharray: arrowHeadTopPathLength,
	      strokeDashoffset: (isAnimatingIn ? arrowHeadTopPathLength : 0),
	      easing: fastOutSlowIn,
	      offset: 0
	    }, {
	      strokeDasharray: arrowHeadTopPathLength,
	      strokeDashoffset: (isAnimatingIn ? 0 : arrowHeadTopPathLength),
	      offset: 1
	    }], {
	      duration: common.getDuration(root, 250),
	      fill: "forwards",
	      delay: common.getDuration(root, isAnimatingIn ? 350 : 0)
	    });
	    arrowHeadBottom.animate([{
	      strokeDasharray: arrowHeadBottomPathLength,
	      strokeDashoffset: (isAnimatingIn ? arrowHeadBottomPathLength : 0),
	      easing: fastOutSlowIn,
	      offset: 0
	    }, {
	      strokeDasharray: arrowHeadBottomPathLength,
	      strokeDashoffset: (isAnimatingIn ? 0 : arrowHeadBottomPathLength),
	      offset: 1
	    }], {
	      duration: common.getDuration(root, 250),
	      fill: "forwards",
	      delay: common.getDuration(root, isAnimatingIn ? 350 : 0)
	    });
	  }

	  // =============== Handwriting animation.
	  var currentHandwritingAnimations = [];
	  document.getElementById("ic_android_handwriting").addEventListener("click", function () {
	    for (var i = 0; i < currentHandwritingAnimations.length; i++) {
	      currentHandwritingAnimations[i].cancel();
	    }
	    currentHandwritingAnimations = [];
	    resetAllStrokes();
	    animateHandwritingStroke("andro", 1000, 0, fastOutLinearIn);
	    animateHandwritingStroke("id", 250, 1050, fastOutSlowIn);
	    animateHandwritingStroke("a", 50, 1300, fastOutSlowIn);
	    animateHandwritingStroke("i1_dot", 50, 1400, fastOutSlowIn);
	  });

	  function resetAllStrokes() {
	    var ids = ["andro", "id", "a", "i1_dot"];
	    for (var i = 0; i < ids.length; i++) {
	      var path = document.getElementById(ids[i]);
	      var pathLength = path.getTotalLength();
	      // TODO(alockwood): fix this hack
	      currentHandwritingAnimations.push(path.animate([
	        { strokeDasharray: pathLength, strokeDashoffset: pathLength, offset: 0, },
	        { strokeDasharray: pathLength, strokeDashoffset: pathLength, offset: 1 }
	      ], { duration: 0, fill: "forwards" }));
	    }
	  }

	  function animateHandwritingStroke(pathId, durationMillis, startDelayMillis, easingCurve) {
	    var path = document.getElementById(pathId);
	    var pathLength = path.getTotalLength();
	    path.animate([{
	      strokeDasharray: pathLength,
	      strokeDashoffset: pathLength,
	      easing: easingCurve,
	      offset: 0,
	    }, {
	      strokeDasharray: pathLength,
	      strokeDashoffset: 0,
	      offset: 1
	    }], {
	      duration: common.getDuration(root, durationMillis),
	      fill: "forwards",
	      delay: common.getDuration(root, startDelayMillis)
	    });
	  }

	  // =============== Fingerprint animation.
	  var isFingerprintVisible = true;
	  document.getElementById("ic_fingerprint").addEventListener("click", function () {
	    animateFingerprint(!isFingerprintVisible);
	    isFingerprintVisible = !isFingerprintVisible;
	  });

	  function animateFingerprint(isAnimatingIn) {
	    if (isAnimatingIn) {
	      animateTrimPathStartWithDelay("ridge_5_path", 180, 20, "cubic-bezier(0.5, 0.5, 1, 1)", true);
	      animateTrimPathStartWithDelay("ridge_7_path", 160, 10, "cubic-bezier(0.5, 0.5, 1, 1)", true);
	      animateTrimPathEndWithDelay("ridge_6_path", 190, 0, "cubic-bezier(0.5, 0.5, 1, 1)", true);
	      animateTrimPathEndWithDelay("ridge_2_path", 140, 0, "cubic-bezier(0.5, 0, 1, 1)", true);
	      animateTrimPathStartWithDelay("ridge_1_path", 216, 60, "cubic-bezier(0.5, 0.5, 1, 1)", true);
	    } else {
	      animateTrimPathEndWithDelay("ridge_5_path", 383, 33, "cubic-bezier(0, 0.29, 1, 1)", false);
	      animateTrimPathEndWithDelay("ridge_7_path", 483, 83, "cubic-bezier(0, 0.5, 1, 1)", false);
	      animateTrimPathStartWithDelay("ridge_6_path", 549, 50, "cubic-bezier(0, 0.5, 1, 1)", false);
	      animateTrimPathStartWithDelay("ridge_2_path", 400, 216, "cubic-bezier(0, 0.5, 1, 1)", false);
	      animateTrimPathEndWithDelay("ridge_1_path", 383, 316, "cubic-bezier(0, 0.5, 1, 1)", false);
	    }
	  }

	  // =============== Google IO 2016 animation.
	  var currentIo16Animations = [];
	  var ioOne1 = document.getElementById("io16_one_1");
	  var ioOne2 = document.getElementById("io16_one_2");
	  var ioOne3 = document.getElementById("io16_one_3");
	  var ioOne4 = document.getElementById("io16_one_4");
	  var ioSix1 = document.getElementById("io16_six_1");
	  var ioSix2 = document.getElementById("io16_six_2");
	  var ioSix3 = document.getElementById("io16_six_3");
	  var ioSix4 = document.getElementById("io16_six_4");
	  var onePathLength = ioOne1.getTotalLength();
	  var sixPathLength = ioSix1.getTotalLength();
	  var oneStrokeDashArray = (onePathLength / 4) + "," + (onePathLength * 3 / 4);
	  var sixStrokeDashArray = (sixPathLength / 4) + "," + (sixPathLength * 3 / 4);
	  ioOne1.setAttribute("stroke-dasharray", oneStrokeDashArray);
	  ioOne2.setAttribute("stroke-dasharray", oneStrokeDashArray);
	  ioOne3.setAttribute("stroke-dasharray", oneStrokeDashArray);
	  ioOne4.setAttribute("stroke-dasharray", oneStrokeDashArray);
	  ioSix1.setAttribute("stroke-dasharray", sixStrokeDashArray);
	  ioSix2.setAttribute("stroke-dasharray", sixStrokeDashArray);
	  ioSix3.setAttribute("stroke-dasharray", sixStrokeDashArray);
	  ioSix4.setAttribute("stroke-dasharray", sixStrokeDashArray);
	  ioOne1.setAttribute("stroke-dashoffset", "0");
	  ioOne2.setAttribute("stroke-dashoffset", "" + (onePathLength * 0.25));
	  ioOne3.setAttribute("stroke-dashoffset", "" + (onePathLength * 0.5));
	  ioOne4.setAttribute("stroke-dashoffset", "" + (onePathLength * 0.75));
	  ioSix1.setAttribute("stroke-dashoffset", "0");
	  ioSix2.setAttribute("stroke-dashoffset", "" + (sixPathLength * 0.25));
	  ioSix3.setAttribute("stroke-dashoffset", "" + (sixPathLength * 0.5));
	  ioSix4.setAttribute("stroke-dashoffset", "" + (sixPathLength * 0.75));
	  beginIo16Animation();

	  function beginIo16Animation() {
	    var oneDurationMillis = common.getDuration(root, 4000);
	    var sixDurationMillis = common.getDuration(root, 5000);
	    currentIo16Animations.push(animateIo16Stroke(ioOne1, oneDurationMillis, 0));
	    currentIo16Animations.push(animateIo16Stroke(ioOne2, oneDurationMillis, onePathLength / 4));
	    currentIo16Animations.push(animateIo16Stroke(ioOne3, oneDurationMillis, onePathLength / 2));
	    currentIo16Animations.push(animateIo16Stroke(ioOne4, oneDurationMillis, onePathLength * 3 / 4));
	    currentIo16Animations.push(animateIo16Stroke(ioSix1, sixDurationMillis, 0));
	    currentIo16Animations.push(animateIo16Stroke(ioSix2, sixDurationMillis, sixPathLength / 4));
	    currentIo16Animations.push(animateIo16Stroke(ioSix3, sixDurationMillis, sixPathLength / 2));
	    currentIo16Animations.push(animateIo16Stroke(ioSix4, sixDurationMillis, sixPathLength * 3 / 4));
	  }

	  function animateIo16Stroke(element, durationMillis, startingStrokeDashOffset) {
	    return element.animate([{
	      strokeDashoffset: "" + startingStrokeDashOffset,
	      easing: "linear",
	      offset: 0
	    }, {
	      strokeDashoffset: "" + (startingStrokeDashOffset + element.getTotalLength()),
	      easing: "linear",
	      offset: 1
	    }], {
	      duration: common.getScaledDuration(root, durationMillis, 2),
	      fill: "forwards",
	      iterations: "Infinity"
	    });
	  }

	  document.querySelector(root.nodeName + "#" + root.id + " input[id=includes6_slowAnimationCheckbox]").addEventListener("change", function () {
	    for (var i = 0; i < currentIo16Animations.length; i += 1) {
	      currentIo16Animations[i].cancel();
	    }
	    currentIo16Animations = [];
	    beginIo16Animation();
	  });
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: trimming stroked paths, circular indeterminate progress bar
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  function getScaledAnimationDuration(durationMillis) {
	    var slowAnimationSelector = document.querySelector("input[id=circularProgressSlowAnimationCheckbox]");
	    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
	    return durationMillis * currentAnimationDurationFactor;
	  }

	  var circular_progress_outer_rotation = document.getElementById("circular_progress_outer_rotation");
	  var circular_progress_inner_rotation = document.getElementById("circular_progress_inner_rotation");
	  var circle_path = document.getElementById("circular_progress_circle_path");

	  function restartAnimation(animation) {
	    animation.cancel();
	    animation.play();
	  }

	  function createRotationAnimation() {
	    return circular_progress_outer_rotation.animate([
	      { transform: "rotate(0deg)", offset: 0, easing: 'linear' },
	      { transform: "rotate(720deg)", offset: 1 }
	    ], { duration: getScaledAnimationDuration(4444), fill: "forwards", iterations: "Infinity" });
	  }

	  function createTrimPathOffsetAnimation() {
	    return circular_progress_inner_rotation.animate([
	      { transform: "rotate(0deg)", offset: 0, easing: 'linear' },
	      { transform: "rotate(90deg)", offset: 1 }
	    ], { duration: getScaledAnimationDuration(1333), fill: "forwards", iterations: "Infinity" });
	  }

	  function createTrimPathStartEndAnimation() {
	    var fastOutSlowInFunction = bezierEasing(0.4, 0, 0.2, 1);
	    var trimPathEndFunction = function (t) {
	      if (t <= 0.5) {
	        return fastOutSlowInFunction(t * 2) * 0.96;
	      } else {
	        return 0.08 * t + 0.92;
	      }
	    };
	    var pathLength = circle_path.getTotalLength();
	    var keyFrames = [];
	    var i = 0;
	    for (i = 0; i < 1344; i += 16) {
	      var trimPathStart = 0;
	      if (i >= 672) {
	        trimPathStart = fastOutSlowInFunction(((i - 672) / 672)) * 0.75;
	      }
	      var trimPathEnd = trimPathEndFunction(i / 1344) * 0.75 + 0.03;
	      var trimPathLength = trimPathEnd - trimPathStart;
	      keyFrames.push({
	        strokeDasharray: (trimPathLength * pathLength) + "," + (1 - trimPathLength) * pathLength,
	        strokeDashoffset: (-trimPathStart * pathLength),
	        easing: "linear",
	        offset: (i / 1344)
	      });
	    }
	    keyFrames.push({
	      strokeDasharray: (0.03 * pathLength) + "," + pathLength,
	      strokeDashoffset: (-0.75 * pathLength),
	      offset: 1
	    });
	    return circle_path.animate(keyFrames, {
	      duration: getScaledAnimationDuration(1333),
	      fill: "forwards",
	      iterations: "Infinity"
	    });
	  }

	  var outerRotationAnimation = createRotationAnimation();
	  var trimPathOffsetAnimation = createTrimPathOffsetAnimation();
	  var trimPathStartEndAnimation = createTrimPathStartEndAnimation();

	  var outerRotationCheckbox = document.querySelector("input[id=circularProgressOuterRotationCheckbox]");
	  var trimPathOffsetCheckbox = document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]");
	  var trimPathStartEndCheckbox = document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]");
	  var showTrimPathsCheckbox = document.querySelector("input[id=circularProgressShowTrimPathsCheckbox]");
	  var slowAnimationCheckbox = document.querySelector("input[id=circularProgressSlowAnimationCheckbox]");

	  outerRotationCheckbox.addEventListener("change", function () {
	    if (outerRotationCheckbox.checked) {
	      outerRotationAnimation.play();
	    } else {
	      outerRotationAnimation.pause();
	    }
	  });
	  trimPathOffsetCheckbox.addEventListener("change", function () {
	    if (!trimPathOffsetCheckbox.checked) {
	      trimPathOffsetAnimation.pause();
	      return;
	    }
	    if (!trimPathStartEndCheckbox.checked) {
	      trimPathOffsetAnimation.play();
	      return;
	    }
	    restartAnimation(trimPathStartEndAnimation);
	    restartAnimation(trimPathOffsetAnimation);
	  });
	  trimPathStartEndCheckbox.addEventListener("change", function () {
	    if (!trimPathStartEndCheckbox.checked) {
	      trimPathStartEndAnimation.pause();
	      return;
	    }
	    if (!trimPathOffsetCheckbox.checked) {
	      trimPathStartEndAnimation.play();
	      return;
	    }
	    restartAnimation(trimPathStartEndAnimation);
	    restartAnimation(trimPathOffsetAnimation);
	  });
	  showTrimPathsCheckbox.addEventListener("change", function () {
	    var visibility = showTrimPathsCheckbox.checked ? "visible" : "hidden";
	    document.getElementById("circular_progress_circle_path_debug").style.visibility = visibility;
	  });
	  slowAnimationCheckbox.addEventListener("change", function () {
	    outerRotationAnimation.cancel();
	    trimPathOffsetAnimation.cancel();
	    trimPathStartEndAnimation.cancel();
	    if (outerRotationCheckbox.checked) {
	      outerRotationAnimation = createRotationAnimation();
	    }
	    if (trimPathOffsetCheckbox.checked) {
	      trimPathOffsetAnimation = createTrimPathOffsetAnimation();
	    }
	    if (trimPathStartEndCheckbox.checked) {
	      trimPathStartEndAnimation = createTrimPathStartEndAnimation();
	    }
	  });
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: path morphing animated icon demos
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {

	  var plusMinusPaths = [
	    "M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z",
	    "M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z"
	  ];

	  var crossTickPaths = [
	    "M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4",
	    "M4.8,13.4 L9,17.6 M10.4,16.2 L19.6,7"
	  ];

	  var drawerArrowPaths = [
	    "M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z",
	    "M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20z"
	  ];

	  var overflowToArrowPaths = [
	    ["M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z", "M -4.0951,-1.3095 l 8.1901,0 c 0.1776,0 0.3216,0.1440 0.3216,0.3216 l 0,1.9758 c 0,0.1776 -0.1440,0.3216 -0.3216,0.3216 l -8.1901,0 c -0.1776,0 -0.3216,-0.1440 -0.3216,-0.3216 l 0,-1.9758 c 0,-0.1776 0.1440,-0.3216 0.3216,-0.3216 Z", "M -5.1145,-1.1101 l 10.2291,0 c 0,0 0,0 0,0 l 0,2.2203 c 0,0 0,0 0,0 l -10.2291,0 c 0,0 0,0 0,0 l 0,-2.2203 c 0,0 0,0 0,0 Z", "M -5.4176,-1.0236 l 10.8351,0 c 0,0 0,0 0,0 l 0,2.0471 c 0,0 0,0 0,0 l -10.8351,0 c 0,0 0,0 0,0 l 0,-2.0471 c 0,0 0,0 0,0 Z", "M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"],
	    ["M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z", "M -0.5106,-1.9149 l 1.0213,0 c 1.0576,0 1.9149,0.8573 1.9149,1.9149 l 0,0 c 0,1.0576 -0.8573,1.9149 -1.9149,1.9149 l -1.0213,0 c -1.0576,0 -1.9149,-0.8573 -1.9149,-1.9149 l 0,0 c 0,-1.0576 0.8573,-1.9149 1.9149,-1.9149 Z", "M -3.6617,-1.5417 l 7.3234,0 c 0.3479,0 0.6299,0.2820 0.6299,0.6299 l 0,1.8234 c 0,0.3479 -0.2820,0.6299 -0.6299,0.6299 l -7.3234,0 c -0.3479,0 -0.6299,-0.2820 -0.6299,-0.6299 l 0,-1.8234 c 0,-0.3479 0.2820,-0.6299 0.6299,-0.6299 Z", "M -5.8061,-1.2245 l 11.6121,0 c 0.0395,0 0.0716,0.0320 0.0716,0.0716 l 0,2.3058 c 0,0.0395 -0.0320,0.0716 -0.0716,0.0716 l -11.6121,0 c -0.0395,0 -0.0716,-0.0320 -0.0716,-0.0716 l 0,-2.3058 c 0,-0.0395 0.0320,-0.0716 0.0716,-0.0716 Z", "M -6.6039,-1.0792 l 13.2077,0 c 0,0 0,0 0,0 l 0,2.1585 c 0,0 0,0 0,0 l -13.2077,0 c 0,0 0,0 0,0 l 0,-2.1585 c 0,0 0,0 0,0 Z", "M -6.9168,-1.0166 l 13.8336,0 c 0,0 0,0 0,0 l 0,2.0333 c 0,0 0,0 0,0 l -13.8336,0 c 0,0 0,0 0,0 l 0,-2.0333 c 0,0 0,0 0,0 Z", "M -7,-1 l 14,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -14,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"],
	    ["M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z", "M -4.0951,-1.3095 l 8.1901,0 c 0.1776,0 0.3216,0.1440 0.3216,0.3216 l 0,1.9758 c 0,0.1776 -0.1440,0.3216 -0.3216,0.3216 l -8.1901,0 c -0.1776,0 -0.3216,-0.1440 -0.3216,-0.3216 l 0,-1.9758 c 0,-0.1776 0.1440,-0.3216 0.3216,-0.3216 Z", "M -5.1145,-1.1101 l 10.2291,0 c 0,0 0,0 0,0 l 0,2.2203 c 0,0 0,0 0,0 l -10.2291,0 c 0,0 0,0 0,0 l 0,-2.2203 c 0,0 0,0 0,0 Z", "M -5.4176,-1.0236 l 10.8351,0 c 0,0 0,0 0,0 l 0,2.0471 c 0,0 0,0 0,0 l -10.8351,0 c 0,0 0,0 0,0 l 0,-2.0471 c 0,0 0,0 0,0 Z", "M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"]
	  ];

	  var arrowToOverflowPaths = [
	    ["M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z", "M -5.3496,-1.0430 l 10.6992,0 c 0,0 0,0 0,0 l 0,2.0859 c 0,0 0,0 0,0 l -10.6992,0 c 0,0 0,0 0,0 l 0,-2.0859 c 0,0 0,0 0,0 Z", "M -4.5733,-1.2500 l 9.1465,0 c 0.0286,0 0.0517,0.0232 0.0517,0.0517 l 0,2.3965 c 0,0.0286 -0.0232,0.0517 -0.0517,0.0517 l -9.1465,0 c -0.0286,0 -0.0517,-0.0232 -0.0517,-0.0517 l 0,-2.3965 c 0,-0.0286 0.0232,-0.0517 0.0517,-0.0517 Z", "M -3.0414,-1.5596 l 6.0827,0 c 0.2761,0 0.5,0.2239 0.5,0.5 l 0,2.1192 c 0,0.2761 -0.2239,0.5 -0.5,0.5 l -6.0827,0 c -0.2761,0 -0.5,-0.2239 -0.5,-0.5 l 0,-2.1192 c 0,-0.2761 0.2239,-0.5 0.5,-0.5 Z", "M -1.5586,-1.7755 l 3.1172,0 c 0.6777,0 1.2271,0.5494 1.2271,1.2271 l 0,1.0969 c 0,0.6777 -0.5494,1.2271 -1.2271,1.2271 l -3.1172,0 c -0.6777,0 -1.2271,-0.5494 -1.2271,-1.2271 l 0,-1.0969 c 0,-0.6777 0.5494,-1.2271 1.2271,-1.2271 Z", "M -0.7060,-1.8945 l 1.4120,0 c 0.9186,0 1.6633,0.7447 1.6633,1.6633 l 0,0.4623 c 0,0.9186 -0.7447,1.6633 -1.6633,1.6633 l -1.4120,0 c -0.9186,0 -1.6633,-0.7447 -1.6633,-1.6633 l 0,-0.4623 c 0,-0.9186 0.7447,-1.6633 1.6633,-1.6633 Z", "M -0.2657,-1.9594 l 0.5315,0 c 1.0364,0 1.8765,0.8401 1.8765,1.8765 l 0,0.1658 c 0,1.0364 -0.8401,1.8765 -1.8765,1.8765 l -0.5315,0 c -1.0364,0 -1.8765,-0.8401 -1.8765,-1.8765 l 0,-0.1658 c 0,-1.0364 0.8401,-1.8765 1.8765,-1.8765 Z", "M -0.0581,-1.9910 l 0.1162,0 c 1.0899,0 1.9734,0.8835 1.9734,1.9734 l 0,0.0351 c 0,1.0899 -0.8835,1.9734 -1.9734,1.9734 l -0.1162,0 c -1.0899,0 -1.9734,-0.8835 -1.9734,-1.9734 l 0,-0.0351 c 0,-1.0899 0.8835,-1.9734 1.9734,-1.9734 Z", "M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z"],
	    ["M -7,-1 l 14,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -14,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z", " M -4.3684,-1.4999 l 8.7369,0 c 0.0729,0 0.1320,0.0591 0.1320,0.1320 l 0,2.7359 c 0,0.0729 -0.0591,0.1320 -0.1320,0.1320 l -8.7369,0 c -0.0729,0 -0.1320,-0.0591 -0.1320,-0.1320 l 0,-2.7359 c 0,-0.0729 0.0591,-0.1320 0.1320,-0.1320 Z", "M -2.7976,-1.6905 l 5.5952,0 c 0.4142,0 0.7500,0.3358 0.7500,0.7500 l 0,1.8810 c 0,0.4142 -0.3358,0.7500 -0.7500,0.7500 l -5.5952,0 c -0.4142,0 -0.7500,-0.3358 -0.7500,-0.7500 l 0,-1.8810 c 0,-0.4142 0.3358,-0.7500 0.7500,-0.7500 Z", "M -1.5413,-1.8100 l 3.0826,0 c 0.7779,0 1.4085,0.6306 1.4085,1.4085 l 0,0.8031 c 0,0.7779 -0.6306,1.4085 -1.4085,1.4085 l -3.0826,0 c -0.7779,0 -1.4085,-0.6306 -1.4085,-1.4085 l 0,-0.8031 c 0,-0.7779 0.6306,-1.4085 1.4085,-1.4085 Z", "M -0.7987,-1.8899 l 1.5974,0 c 0.9676,0 1.7519,0.7844 1.7519,1.7519 l 0,0.2759 c 0,0.9676 -0.7844,1.7519 -1.7519,1.7519 l -1.5974,0 c -0.9676,0 -1.7519,-0.7844 -1.7519,-1.7519 l 0,-0.2759 c 0,-0.9676 0.7844,-1.7519 1.7519,-1.7519 Z", "M -0.3662,-1.9430 l 0.7324,0 c 1.0597,0 1.9187,0.8590 1.9187,1.9187 l 0,0.0486 c 0,1.0597 -0.8590,1.9187 -1.9187,1.9187 l -0.7324,0 c -1.0597,0 -1.9187,-0.8590 -1.9187,-1.9187 l 0,-0.0486 c 0,-1.0597 0.8590,-1.9187 1.9187,-1.9187 Z", "M -0.1413,-1.9764 l 0.2827,0 c 1.0916,0 1.9764,0.8849 1.9764,1.9764 l 0,0 c 0,1.0916 -0.8849,1.9764 -1.9764,1.9764 l -0.2827,0 c -1.0916,0 -1.9764,-0.8849 -1.9764,-1.9764 l 0,0 c 0,-1.0916 0.8849,-1.9764 1.9764,-1.9764 Z", "M -0.0331,-1.9945 l 0.0663,0 c 1.1015,0 1.9945,0.8930 1.9945,1.9945 l 0,0 c 0,1.1015 -0.8930,1.9945 -1.9945,1.9945 l -0.0663,0 c -1.1015,0 -1.9945,-0.8930 -1.9945,-1.9945 l 0,0 c 0,-1.1015 0.8930,-1.9945 1.9945,-1.9945 Z", "M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z"],
	    ["M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z", "M -5.3496,-1.0430 l 10.6992,0 c 0,0 0,0 0,0 l 0,2.0859 c 0,0 0,0 0,0 l -10.6992,0 c 0,0 0,0 0,0 l 0,-2.0859 c 0,0 0,0 0,0 Z", "M -4.5733,-1.2500 l 9.1465,0 c 0.0286,0 0.0517,0.0232 0.0517,0.0517 l 0,2.3965 c 0,0.0286 -0.0232,0.0517 -0.0517,0.0517 l -9.1465,0 c -0.0286,0 -0.0517,-0.0232 -0.0517,-0.0517 l 0,-2.3965 c 0,-0.0286 0.0232,-0.0517 0.0517,-0.0517 Z", "M -3.0414,-1.5596 l 6.0827,0 c 0.2761,0 0.5,0.2239 0.5,0.5 l 0,2.1192 c 0,0.2761 -0.2239,0.5 -0.5,0.5 l -6.0827,0 c -0.2761,0 -0.5,-0.2239 -0.5,-0.5 l 0,-2.1192 c 0,-0.2761 0.2239,-0.5 0.5,-0.5 Z", "M -1.5586,-1.7755 l 3.1172,0 c 0.6777,0 1.2271,0.5494 1.2271,1.2271 l 0,1.0969 c 0,0.6777 -0.5494,1.2271 -1.2271,1.2271 l -3.1172,0 c -0.6777,0 -1.2271,-0.5494 -1.2271,-1.2271 l 0,-1.0969 c 0,-0.6777 0.5494,-1.2271 1.2271,-1.2271 Z", "M -0.7060,-1.8945 l 1.4120,0 c 0.9186,0 1.6633,0.7447 1.6633,1.6633 l 0,0.4623 c 0,0.9186 -0.7447,1.6633 -1.6633,1.6633 l -1.4120,0 c -0.9186,0 -1.6633,-0.7447 -1.6633,-1.6633 l 0,-0.4623 c 0,-0.9186 0.7447,-1.6633 1.6633,-1.6633 Z", "M -0.2657,-1.9594 l 0.5315,0 c 1.0364,0 1.8765,0.8401 1.8765,1.8765 l 0,0.1658 c 0,1.0364 -0.8401,1.8765 -1.8765,1.8765 l -0.5315,0 c -1.0364,0 -1.8765,-0.8401 -1.8765,-1.8765 l 0,-0.1658 c 0,-1.0364 0.8401,-1.8765 1.8765,-1.8765 Z", "M -0.0581,-1.9910 l 0.1162,0 c 1.0899,0 1.9734,0.8835 1.9734,1.9734 l 0,0.0351 c 0,1.0899 -0.8835,1.9734 -1.9734,1.9734 l -0.1162,0 c -1.0899,0 -1.9734,-0.8835 -1.9734,-1.9734 l 0,-0.0351 c 0,-1.0899 0.8835,-1.9734 1.9734,-1.9734 Z", "M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z"],
	  ];

	  var digitPaths = [
	    "M 0.24585635359116,0.552486187845304" +
	    " C 0.24585635359116,0.331491712707182 0.370165745856354,0.0994475138121547 0.552486187845304,0.0994475138121547" +
	    " C 0.734806629834254,0.0994475138121547 0.861878453038674,0.331491712707182 0.861878453038674,0.552486187845304" +
	    " C 0.861878453038674,0.773480662983425 0.734806629834254,0.994475138121547 0.552486187845304,0.994475138121547" +
	    " C 0.370165745856354,0.994475138121547 0.24585635359116,0.773480662983425 0.24585635359116,0.552486187845304",
	    "M 0.425414364640884,0.113259668508287" +
	    " C 0.425414364640884,0.113259668508287 0.577348066298343,0.113259668508287 0.577348066298343,0.113259668508287" +
	    " C 0.577348066298343,0.113259668508287 0.577348066298343,1 0.577348066298343,1" +
	    " C 0.577348066298343,1 0.577348066298343,1 0.577348066298343,1" +
	    " C 0.577348066298343,1 0.577348066298343,1 0.577348066298343,1",
	    "M 0.30939226519337,0.331491712707182" +
	    " C 0.325966850828729,0.0110497237569061 0.790055248618785,0.0220994475138122 0.798342541436464,0.337016574585635" +
	    " C 0.798342541436464,0.430939226519337 0.718232044198895,0.541436464088398 0.596685082872928,0.674033149171271" +
	    " C 0.519337016574586,0.762430939226519 0.408839779005525,0.856353591160221 0.314917127071823,0.977900552486188" +
	    " C 0.314917127071823,0.977900552486188 0.812154696132597,0.977900552486188 0.812154696132597,0.977900552486188",
	    "M 0.361878453038674,0.298342541436464" +
	    " C 0.348066298342541,0.149171270718232 0.475138121546961,0.0994475138121547 0.549723756906077,0.0994475138121547" +
	    " C 0.861878453038674,0.0994475138121547 0.806629834254144,0.530386740331492 0.549723756906077,0.530386740331492" +
	    " C 0.87292817679558,0.530386740331492 0.828729281767956,0.994475138121547 0.552486187845304,0.994475138121547" +
	    " C 0.298342541436464,0.994475138121547 0.30939226519337,0.828729281767956 0.312154696132597,0.790055248618785",
	    "M 0.856353591160221,0.806629834254144" +
	    " C 0.856353591160221,0.806629834254144 0.237569060773481,0.806629834254144 0.237569060773481,0.806629834254144" +
	    " C 0.237569060773481,0.806629834254144 0.712707182320442,0.138121546961326 0.712707182320442,0.138121546961326" +
	    " C 0.712707182320442,0.138121546961326 0.712707182320442,0.806629834254144 0.712707182320442,0.806629834254144" +
	    " C 0.712707182320442,0.806629834254144 0.712707182320442,0.988950276243094 0.712707182320442,0.988950276243094",
	    "M 0.806629834254144,0.110497237569061" +
	    " C 0.502762430939227,0.110497237569061 0.502762430939227,0.110497237569061 0.502762430939227,0.110497237569061" +
	    " C 0.397790055248619,0.430939226519337 0.397790055248619,0.430939226519337 0.397790055248619,0.430939226519337" +
	    " C 0.535911602209945,0.364640883977901 0.801104972375691,0.469613259668508 0.801104972375691,0.712707182320442" +
	    " C 0.773480662983425,1.01104972375691 0.375690607734807,1.0939226519337 0.248618784530387,0.850828729281768",
	    "M 0.607734806629834,0.110497237569061" +
	    " C 0.607734806629834,0.110497237569061 0.607734806629834,0.110497237569061 0.607734806629834,0.110497237569061" +
	    " C 0.392265193370166,0.43646408839779 0.265193370165746,0.50828729281768 0.25414364640884,0.696132596685083" +
	    " C 0.287292817679558,1.13017127071823 0.87292817679558,1.06077348066298 0.845303867403315,0.696132596685083" +
	    " C 0.806629834254144,0.364640883977901 0.419889502762431,0.353591160220994 0.295580110497238,0.552486187845304",
	    "M 0.259668508287293,0.116022099447514" +
	    " C 0.259668508287293,0.116022099447514 0.87292817679558,0.116022099447514 0.87292817679558,0.116022099447514" +
	    " C 0.87292817679558,0.116022099447514 0.66666666666667,0.41068139962 0.66666666666667,0.41068139962" +
	    " C 0.66666666666667,0.41068139962 0.460405157,0.7053406998 0.460405157,0.7053406998" +
	    " C 0.460405157,0.7053406998 0.25414364640884,1 0.25414364640884,1",
	    "M 0.558011049723757,0.530386740331492" +
	    " C 0.243093922651934,0.524861878453039 0.243093922651934,0.104972375690608 0.558011049723757,0.104972375690608" +
	    " C 0.850828729281768,0.104972375690608 0.850828729281768,0.530386740331492 0.558011049723757,0.530386740331492" +
	    " C 0.243093922651934,0.530386740331492 0.198895027624309,0.988950276243094 0.558011049723757,0.988950276243094" +
	    " C 0.850828729281768,0.988950276243094 0.850828729281768,0.530386740331492 0.558011049723757,0.530386740331492",
	    "M 0.80939226519337,0.552486187845304" +
	    " C 0.685082872928177,0.751381215469613 0.298342541436464,0.740331491712707 0.259668508287293,0.408839779005525" +
	    " C 0.232044198895028,0.0441988950276243 0.81767955801105,-0.0441988950276243 0.850828729281768,0.408839779005525" +
	    " C 0.839779005524862,0.596685082872928 0.712707182320442,0.668508287292818 0.497237569060773,0.994475138121547" +
	    " C 0.497237569060773,0.994475138121547 0.497237569060773,0.994475138121547 0.497237569060773,0.994475138121547"
	  ];

	  var playPauseStopPaths = [
	    "M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5",
	    "M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5",
	    "M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5"
	  ];

	  var playPauseStopTranslationX = [0.75, 0, 0];

	  function getScaledAnimationDuration(durationMillis) {
	    var slowAnimationSelector = document.querySelector("input[id=pathMorphSlowAnimationCheckbox]");
	    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
	    return durationMillis * currentAnimationDurationFactor;
	  }

	  function animateTranslationX(elementId, durationMillis, fromTranslationX, toTranslationX) {
	    animateTranslationXWithEasing(elementId, durationMillis, fromTranslationX, toTranslationX, "cubic-bezier(0.4, 0, 0.2, 1)");
	  }

	  function animateTranslationXWithEasing(elementId, durationMillis, fromTranslationX, toTranslationX, easingFunction) {
	    document.getElementById(elementId).animate([{
	      transform: ("translateX(" + fromTranslationX + "px)"),
	      offset: 0,
	      easing: easingFunction
	    }, {
	      transform: ("translateX(" + toTranslationX + "px)"),
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(durationMillis),
	      fill: "forwards"
	    });
	  }

	  function maybeAnimateRotation(elementId, durationMillis, fromDegrees, toDegrees) {
	    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
	    if (!rotateSelector.checked) {
	      return;
	    }
	    animateRotation(elementId, durationMillis, fromDegrees, toDegrees);
	  }

	  function animateRotation(elementId, durationMillis, fromDegrees, toDegrees) {
	    animateRotationWithEasing(elementId, durationMillis, fromDegrees, toDegrees, "cubic-bezier(0.4, 0, 0.2, 1)");
	  }

	  function animateRotationWithEasing(elementId, durationMillis, fromDegrees, toDegrees, easingFunction) {
	    document.getElementById(elementId).animate([
	      { transform: ("rotate(" + fromDegrees + "deg)"), offset: 0, easing: easingFunction },
	      { transform: ("rotate(" + toDegrees + "deg)"), offset: 1 }
	    ], { duration: getScaledAnimationDuration(durationMillis), fill: "forwards" });
	  }

	  function animatePathMorph(animationElementId, durationMillis) {
	    var animation = document.getElementById(animationElementId);
	    animation.setAttributeNS(null, 'dur', getScaledAnimationDuration(durationMillis) + 'ms');
	    animation.beginElement();
	  }

	  function animatePathMorphWithValues(animationElementId, durationMillis, pathStringList) {
	    var animation = document.getElementById(animationElementId);
	    animation.setAttributeNS(null, 'dur', getScaledAnimationDuration(durationMillis) + 'ms');
	    animation.setAttributeNS(null, 'values', pathStringList.join(";"));
	    animation.beginElement();
	  }

	  function animatePoints(animationElementId, durationMillis, fromPathString, toPathString, dotRadius) {
	    var listOfPathStrings = [fromPathString, toPathString];
	    animatePointsWithList(animationElementId, durationMillis, listOfPathStrings, dotRadius);
	  }

	  function animatePointsWithList(animationElementId, durationMillis, listOfPathStrings, dotRadius) {
	    var valuesString = "";
	    for (var i = 0; i < listOfPathStrings.length; i += 1) {
	      valuesString = valuesString + common.createPathDotString(listOfPathStrings[i], dotRadius);
	      if (i + 1 !== listOfPathStrings.length) {
	        valuesString = valuesString + ";";
	      }
	    }
	    var animation = document.getElementById(animationElementId);
	    animation.setAttributeNS(null, 'dur', getScaledAnimationDuration(durationMillis) + 'ms');
	    animation.setAttributeNS(null, 'values', valuesString, dotRadius);
	    animation.beginElement();
	  }

	  // ================ Plus to minus.
	  var isIconMinus = false;
	  document.getElementById("ic_plus_minus").addEventListener("click", function () {
	    if (isIconMinus) {
	      animateMinusToPlus();
	    } else {
	      animatePlusToMinus();
	    }
	    isIconMinus = !isIconMinus;
	  });

	  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function () {
	    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
	    var shouldShowPathPoints = pathPointsSelector.checked;
	    var visibility = shouldShowPathPoints ? "visible" : "hidden";
	    var endPointsPath = document.getElementById("plus_minus_end_points_path");
	    endPointsPath.style.visibility = visibility;
	    if (shouldShowPathPoints) {
	      var dotPathString = common.createPathDotString(plusMinusPaths[isIconMinus ? 1 : 0], 0.4);
	      endPointsPath.setAttribute('d', dotPathString);
	    }
	  });

	  function animatePlusToMinus() {
	    maybeAnimateRotation("plus_minus_container_rotate", 300, 180, 360);
	    animatePathMorph("plus_to_minus_path_animation", 250);
	    animatePoints("plus_minus_end_points_animation", 250, plusMinusPaths[0], plusMinusPaths[1], 0.4);
	  }

	  function animateMinusToPlus() {
	    maybeAnimateRotation("plus_minus_container_rotate", 300, 0, 180);
	    animatePathMorph("minus_to_plus_path_animation", 250);
	    animatePoints("plus_minus_end_points_animation", 250, plusMinusPaths[1], plusMinusPaths[0], 0.4);
	  }

	  // ================ Cross to tick.
	  var isIconTick = false;
	  document.getElementById("ic_cross_tick").addEventListener("click", function () {
	    if (isIconTick) {
	      animateTickToCross();
	    } else {
	      animateCrossToTick();
	    }
	    isIconTick = !isIconTick;
	  });

	  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function () {
	    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
	    var shouldShowPathPoints = pathPointsSelector.checked;
	    var visibility = shouldShowPathPoints ? "visible" : "hidden";
	    var endPointsPath = document.getElementById("cross_tick_end_points_path");
	    endPointsPath.style.visibility = visibility;
	    if (shouldShowPathPoints) {
	      var dotPathString = common.createPathDotString(crossTickPaths[isIconTick ? 1 : 0], 0.4);
	      endPointsPath.setAttribute('d', dotPathString);
	    }
	  });

	  function animateCrossToTick() {
	    maybeAnimateRotation("cross_tick_container_rotate", 300, 180, 360);
	    animatePathMorph("cross_to_tick_path_animation", 250);
	    animatePoints("cross_tick_end_points_animation", 250, crossTickPaths[0], crossTickPaths[1], 0.4);
	  }

	  function animateTickToCross() {
	    maybeAnimateRotation("cross_tick_container_rotate", 300, 0, 180);
	    animatePathMorph("tick_to_cross_path_animation", 250);
	    animatePoints("cross_tick_end_points_animation", 250, crossTickPaths[1], crossTickPaths[0], 0.4);
	  }

	  // ================ Drawer to arrow.
	  var isIconDrawer = true;
	  document.getElementById("ic_arrow_drawer").addEventListener("click", function () {
	    if (isIconDrawer) {
	      animateDrawerToArrow();
	    } else {
	      animateArrowToDrawer();
	    }
	    isIconDrawer = !isIconDrawer;
	  });

	  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function () {
	    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
	    var shouldShowPathPoints = pathPointsSelector.checked;
	    var visibility = shouldShowPathPoints ? "visible" : "hidden";
	    var endPointsPath = document.getElementById("arrow_drawer_end_points_path");
	    endPointsPath.style.visibility = visibility;
	    if (shouldShowPathPoints) {
	      var dotPathString = common.createPathDotString(drawerArrowPaths[isIconDrawer ? 0 : 1], 0.4);
	      endPointsPath.setAttribute('d', dotPathString);
	    }
	  });

	  function animateDrawerToArrow() {
	    maybeAnimateRotation("arrow_drawer_container_rotate", 300, 0, 180);
	    animatePathMorph("drawer_to_arrow_path_animation", 300);
	    animatePoints("drawer_arrow_end_points_animation", 300, drawerArrowPaths[0], drawerArrowPaths[1], 0.4);
	  }

	  function animateArrowToDrawer() {
	    maybeAnimateRotation("arrow_drawer_container_rotate", 300, 180, 360);
	    animatePathMorph("arrow_to_drawer_path_animation", 300);
	    animatePoints("drawer_arrow_end_points_animation", 300, drawerArrowPaths[1], drawerArrowPaths[0], 0.4);
	  }

	  // ================ Overflow to arrow.
	  var isIconOverflow = true;
	  var overflowArrowDotRadius = 0.3;
	  document.getElementById("ic_arrow_overflow").addEventListener("click", function () {
	    if (isIconOverflow) {
	      animateOverflowToArrow();
	    } else {
	      animateArrowToOverflow();
	    }
	    isIconOverflow = !isIconOverflow;
	  });
	  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function () {
	    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
	    var shouldShowPathPoints = pathPointsSelector.checked;
	    var visibility = shouldShowPathPoints ? "visible" : "hidden";
	    var endPointsPath1 = document.getElementById("arrow_overflow_end_points_path1");
	    var endPointsPath2 = document.getElementById("arrow_overflow_end_points_path2");
	    var endPointsPath3 = document.getElementById("arrow_overflow_end_points_path3");
	    endPointsPath1.style.visibility = visibility;
	    endPointsPath2.style.visibility = visibility;
	    endPointsPath3.style.visibility = visibility;
	    if (shouldShowPathPoints) {
	      var dotPathString1 = common.createPathDotString(isIconOverflow ? overflowToArrowPaths[0][0] : arrowToOverflowPaths[0][0], overflowArrowDotRadius);
	      var dotPathString2 = common.createPathDotString(isIconOverflow ? overflowToArrowPaths[1][0] : arrowToOverflowPaths[1][0], overflowArrowDotRadius);
	      var dotPathString3 = common.createPathDotString(isIconOverflow ? overflowToArrowPaths[2][0] : arrowToOverflowPaths[2][0], overflowArrowDotRadius);
	      endPointsPath1.setAttribute('d', dotPathString1);
	      endPointsPath2.setAttribute('d', dotPathString2);
	      endPointsPath3.setAttribute('d', dotPathString3);
	    }
	  });

	  function animateOverflowToArrow() {
	    animateRotationWithEasing("arrow_overflow_rotate_dot1", 400, 0, -45, "cubic-bezier(0, 0, 0, 1)");
	    document.getElementById("arrow_overflow_translate_dot1").animate([{
	      transform: "translateX(0px) translateY(-6px)",
	      offset: 0,
	      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
	    }, {
	      transform: "translateX(-6.5px) translateY(0px)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(300),
	      fill: "forwards"
	    });
	    animateTranslationXWithEasing("arrow_overflow_pivot_dot1", 200, 0, 4.5, "cubic-bezier(0, 0, 0, 1)");
	    animateTranslationX("arrow_overflow_translate_dot2", 250, 0, -8);
	    document.getElementById("arrow_overflow_pivot_dot2").animate([{
	      transform: "translateX(0px)",
	      offset: 0,
	      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
	    }, {
	      transform: "translateX(8.18181818182px)",
	      offset: 0.4
	    }, {
	      transform: "translateX(9px)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(200),
	      fill: "forwards"
	    });
	    animateRotationWithEasing("arrow_overflow_rotate_dot3", 400, 0, 45, "cubic-bezier(0, 0, 0, 1)");
	    document.getElementById("arrow_overflow_translate_dot3").animate([{
	      transform: "translateX(0px) translateY(6px)",
	      offset: 0,
	      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
	    }, {
	      transform: "translateX(-6.5px) translateY(0px)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(300),
	      fill: "forwards"
	    });
	    animateTranslationXWithEasing("arrow_overflow_pivot_dot3", 200, 0, 4.5, "cubic-bezier(0, 0, 0, 1)");
	    animatePathMorphWithValues("overflow_to_arrow_path1_animation", 300, overflowToArrowPaths[0]);
	    animatePathMorphWithValues("overflow_to_arrow_path2_animation", 300, overflowToArrowPaths[1]);
	    animatePathMorphWithValues("overflow_to_arrow_path3_animation", 300, overflowToArrowPaths[2]);
	    var endPointsAnimation1 = document.getElementById("arrow_overflow_end_points1_animation");
	    endPointsAnimation1.setAttributeNS(null, 'begin', '0ms');
	    endPointsAnimation1.setAttributeNS(null, 'keyTimes', '0;0.25;0.5;0.75;1');
	    endPointsAnimation1.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
	    var endPointsAnimation2 = document.getElementById("arrow_overflow_end_points2_animation");
	    endPointsAnimation2.setAttributeNS(null, 'keyTimes', '0;0.1667;0.3333;0.5;0.6666;0.83333;1');
	    endPointsAnimation2.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
	    endPointsAnimation2.setAttributeNS(null, 'values', overflowToArrowPaths[1]);
	    var endPointsAnimation3 = document.getElementById("arrow_overflow_end_points3_animation");
	    endPointsAnimation3.setAttributeNS(null, 'begin', '0ms');
	    endPointsAnimation3.setAttributeNS(null, 'keyTimes', '0;0.25;0.5;0.75;1');
	    endPointsAnimation3.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
	    animatePointsWithList("arrow_overflow_end_points1_animation", 300, overflowToArrowPaths[0], overflowArrowDotRadius);
	    animatePointsWithList("arrow_overflow_end_points2_animation", 300, overflowToArrowPaths[1], overflowArrowDotRadius);
	    animatePointsWithList("arrow_overflow_end_points3_animation", 300, overflowToArrowPaths[2], overflowArrowDotRadius);
	  }

	  function animateArrowToOverflow() {
	    animateRotation("arrow_overflow_rotate_dot1", 400, -45, 0);
	    document.getElementById("arrow_overflow_translate_dot1").animate([{
	      transform: "translateX(-6.5px) translateY(0px)",
	      offset: 0,
	      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
	    }, {
	      transform: "translateX(0px) translateY(-6px)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(400),
	      fill: "forwards"
	    });
	    animateTranslationX("arrow_overflow_pivot_dot1", 300, 4.5, 0);
	    animateTranslationX("arrow_overflow_translate_dot2", 300, -8, 0);
	    animateTranslationX("arrow_overflow_pivot_dot2", 216, 9, 0);
	    animateRotation("arrow_overflow_rotate_dot3", 400, 45, 0);
	    document.getElementById("arrow_overflow_translate_dot3").animate([{
	      transform: "translateX(-6.5px) translateY(0px)",
	      offset: 0,
	      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
	    }, {
	      transform: "translateX(0px) translateY(6px)",
	      offset: 1
	    }], {
	      duration: getScaledAnimationDuration(400),
	      fill: "forwards"
	    });
	    animateTranslationX("arrow_overflow_pivot_dot3", 300, 4.5, 0);
	    document.getElementById("arrow_to_overflow_path1_animation").setAttributeNS(null, 'begin', '50ms');
	    document.getElementById("arrow_to_overflow_path3_animation").setAttributeNS(null, 'begin', '50ms');
	    animatePathMorphWithValues("arrow_to_overflow_path1_animation", 300, arrowToOverflowPaths[0]);
	    animatePathMorphWithValues("arrow_to_overflow_path2_animation", 300, arrowToOverflowPaths[1]);
	    animatePathMorphWithValues("arrow_to_overflow_path3_animation", 300, arrowToOverflowPaths[2]);

	    var endPointsAnimation1 = document.getElementById("arrow_overflow_end_points1_animation");
	    endPointsAnimation1.setAttributeNS(null, 'begin', '50ms');
	    endPointsAnimation1.setAttributeNS(null, 'keyTimes', '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1');
	    endPointsAnimation1.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
	    var endPointsAnimation2 = document.getElementById("arrow_overflow_end_points2_animation");
	    endPointsAnimation2.setAttributeNS(null, 'keyTimes', '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1');
	    endPointsAnimation2.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
	    var endPointsAnimation3 = document.getElementById("arrow_overflow_end_points3_animation");
	    endPointsAnimation3.setAttributeNS(null, 'begin', '50ms');
	    endPointsAnimation3.setAttributeNS(null, 'keyTimes', '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1');
	    endPointsAnimation3.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
	    animatePointsWithList("arrow_overflow_end_points1_animation", 300, arrowToOverflowPaths[0], overflowArrowDotRadius);
	    animatePointsWithList("arrow_overflow_end_points2_animation", 300, arrowToOverflowPaths[1], overflowArrowDotRadius);
	    animatePointsWithList("arrow_overflow_end_points3_animation", 300, arrowToOverflowPaths[2], overflowArrowDotRadius);
	  }

	  // ================ Play/pause/stop.
	  var currentPlayPauseStopIconIndex = 0;
	  document.getElementById("ic_play_pause_stop").addEventListener("click", function () {
	    var previousPlayPauseStopIconIndex = currentPlayPauseStopIconIndex;
	    currentPlayPauseStopIconIndex = (currentPlayPauseStopIconIndex + 1) % 3;
	    animatePlayPauseStop(previousPlayPauseStopIconIndex, currentPlayPauseStopIconIndex);
	  });

	  document.querySelector("input[id=pathMorphRotateCheckbox]").addEventListener("change", function () {
	    var animateRotationSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
	    var currentRotation = animateRotationSelector.checked && currentPlayPauseStopIconIndex === 0 ? 90 : 0;
	    // TODO(alockwood): fix this hack...
	    document.getElementById("play_pause_stop_rotate").animate([{
	      transform: "rotate(" + currentRotation + "deg)",
	      offset: 0,
	    }, {
	      transform: "rotate(" + currentRotation + "deg)",
	      offset: 1,
	    }], {
	      duration: 0,
	      fill: "forwards"
	    });
	  });

	  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function () {
	    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
	    var shouldShowPathPoints = pathPointsSelector.checked;
	    var visibility = shouldShowPathPoints ? "visible" : "hidden";
	    var endPointsPath = document.getElementById("play_pause_stop_end_points_path");
	    endPointsPath.style.visibility = visibility;
	    if (shouldShowPathPoints) {
	      var dotPathString = common.createPathDotString(playPauseStopPaths[currentPlayPauseStopIconIndex], 0.4);
	      endPointsPath.setAttribute('d', dotPathString);
	    }
	  });

	  function animatePlayPauseStop(oldIconIndex, newIconIndex) {
	    var startingRotation = 0;
	    if (oldIconIndex === 0) {
	      startingRotation = 90;
	    } else if (oldIconIndex === 1) {
	      startingRotation = 0;
	    } else if (newIconIndex === 0) {
	      startingRotation = 0;
	    } else if (newIconIndex === 1) {
	      startingRotation = 90;
	    }
	    maybeAnimateRotation("play_pause_stop_rotate", 200, startingRotation, startingRotation + 90);
	    var oldPathString = playPauseStopPaths[oldIconIndex];
	    var newPathString = playPauseStopPaths[newIconIndex];
	    animatePathMorphWithValues("play_pause_stop_animation", 200, [oldPathString, newPathString]);
	    animateTranslationX("play_pause_stop_translateX", 200, playPauseStopTranslationX[oldIconIndex], playPauseStopTranslationX[newIconIndex]);
	    animatePoints("play_pause_stop_end_points_animation", 200, oldPathString, newPathString, 0.4);
	  }

	  // =============== Animated digits.
	  var numDigitClicks = 0;
	  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function () {
	    var currentPoints = getPointsInPath(0);
	    var countdownDigitsCp1Path = document.getElementById("countdown_digits_cp1");
	    var countdownDigitsCp2Path = document.getElementById("countdown_digits_cp2");
	    var countdownDigitsEndPath = document.getElementById("countdown_digits_end");
	    countdownDigitsCp1Path.setAttribute("d", currentPoints[0]);
	    countdownDigitsCp2Path.setAttribute("d", currentPoints[1]);
	    countdownDigitsEndPath.setAttribute("d", currentPoints[2]);
	    var visibility = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").checked ? "visible" : "hidden";
	    countdownDigitsCp1Path.style.visibility = visibility;
	    countdownDigitsCp2Path.style.visibility = visibility;
	    countdownDigitsEndPath.style.visibility = visibility;
	    animateCount(numDigitClicks % 10, numDigitClicks % 10);
	  });

	  document.getElementById("ic_countdown").addEventListener("click", function () {
	    animateCount(numDigitClicks % 10, (numDigitClicks + 1) % 10);
	    numDigitClicks += 1;
	  });

	  function createEllipsePath(radius) {
	    var r = radius;
	    var d = radius * 2;
	    return "m-" + r + ",0a" + r + "," + r + ",0,1,0," + d + ",0a " + r + "," + r + ",0,1,0-" + d + ",0z";
	  }

	  function createControlPointPath() {
	    return createEllipsePath(0.015);
	  }

	  function createEndPointPath() {
	    return createEllipsePath(0.025);
	  }

	  function getPointsInPath(digit) {
	    var digitPath = digitPaths[digit];
	    var numbers = digitPath.split(" ");
	    var xcoords = [];
	    var ycoords = [];
	    var numPoints = 0;
	    var i;
	    for (i = 0; i < numbers.length; i++) {
	      var xy = numbers[i].split(",");
	      if (xy.length == 2) {
	        xcoords.push(xy[0]);
	        ycoords.push(xy[1]);
	        numPoints++;
	      }
	    }
	    var cp1Path = "";
	    var cp2Path = "";
	    var endPath = "";
	    var controlPointPath = createControlPointPath();
	    var endPointPath = createEndPointPath();
	    for (i = 0; i < numPoints; i++) {
	      var point = "M" + xcoords[i] + "," + ycoords[i];
	      if (i % 3 === 0) {
	        endPath += point + endPointPath;
	      } else if (i % 3 == 1) {
	        cp1Path += point + controlPointPath;
	      } else {
	        cp2Path += point + controlPointPath;
	      }
	    }
	    return [cp1Path, cp2Path, endPath];
	  }

	  function animateCount(currentDigit, nextDigit) {
	    var duration = getScaledAnimationDuration(300);

	    var countdownDigitsAnimation = document.getElementById("countdown_digits_animation");
	    countdownDigitsAnimation.setAttributeNS(null, 'dur', duration + 'ms');
	    countdownDigitsAnimation.setAttributeNS(null, 'values', digitPaths[currentDigit] + ";" + digitPaths[nextDigit]);
	    countdownDigitsAnimation.beginElement();

	    var currentPoints = getPointsInPath(currentDigit);
	    var nextPoints = getPointsInPath(nextDigit);

	    var cp1Animation = document.getElementById("countdown_digits_cp1_animation");
	    cp1Animation.setAttributeNS(null, 'dur', duration + 'ms');
	    cp1Animation.setAttributeNS(null, 'values', currentPoints[0] + ";" + nextPoints[0]);
	    cp1Animation.beginElement();

	    var cp2Animation = document.getElementById("countdown_digits_cp2_animation");
	    cp2Animation.setAttributeNS(null, 'dur', duration + 'ms');
	    cp2Animation.setAttributeNS(null, 'values', currentPoints[1] + ";" + nextPoints[1]);
	    cp2Animation.beginElement();

	    var endAnimation = document.getElementById("countdown_digits_end_animation");
	    endAnimation.setAttributeNS(null, 'dur', duration + 'ms');
	    endAnimation.setAttributeNS(null, 'values', currentPoints[2] + ";" + nextPoints[2]);
	    endAnimation.beginElement();
	  }
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: clip path animated icon demos (hourglass, eye visibility, heart)
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
	  var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

	  function getScaledAnimationDuration(durationMillis) {
	    var slowAnimationSelector = document.querySelector("input[id=clipPathSlowAnimationCheckbox]");
	    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
	    return durationMillis * currentAnimationDurationFactor;
	  }

	  function shouldShowDebugClipMasks() {
	    return document.querySelector("input[id=clipPathShowClipMaskCheckbox]").checked;
	  }

	  document.querySelector("input[id=clipPathShowClipMaskCheckbox]").addEventListener("change", function () {
	    if (shouldShowDebugClipMasks()) {
	      document.getElementById("eye_mask_clip_path_debug").style.visibility = "visible";
	      document.getElementById("heart_clip_path_debug").style.visibility = "visible";
	      document.getElementById("hourglass_clip_mask_debug").style.visibility = "visible";
	    } else {
	      document.getElementById("eye_mask_clip_path_debug").style.visibility = "hidden";
	      document.getElementById("heart_clip_path_debug").style.visibility = "hidden";
	      document.getElementById("hourglass_clip_mask_debug").style.visibility = "hidden";
	    }
	  });

	  // =============== Hourglass icon.
	  var isHourglassRotated = false;
	  var startHourglassClipPath = "M 24,13.4 c 0,0 -24,0 -24,0 c 0,0 0,10.6 0,10.6 c 0,0 24,0 24,0 c 0,0 0,-10.6 0,-10.6 Z";
	  var endHourglassClipPath = "M 24,0 c 0,0 -24,0 -24,0 c 0,0 0,10.7 0,10.7 c 0,0 24,0 24,0 c 0,0 0,-10.7 0,-10.7 Z";
	  document.getElementById("ic_timer").addEventListener("click", function () {
	    animateHourglass();
	    isHourglassRotated = !isHourglassRotated;
	  });

	  function animateHourglass() {
	    var startClip = isHourglassRotated ? endHourglassClipPath : startHourglassClipPath;
	    var endClip = isHourglassRotated ? startHourglassClipPath : endHourglassClipPath;
	    var startRotate = isHourglassRotated ? "rotate(180deg)" : "rotate(0deg)";
	    var endRotate = isHourglassRotated ? "rotate(360deg)" : "rotate(180deg)";
	    var clipPathValues = startClip + ";" + endClip;

	    document.getElementById("hourglass_fill_rotation").animate([
	      { transform: startRotate, offset: 0, easing: fastOutSlowIn },
	      { transform: endRotate, offset: 1 }
	    ], { duration: getScaledAnimationDuration(333), fill: "forwards" });
	    document.getElementById("hourglass_frame_rotation").animate([
	      { transform: startRotate, offset: 0, easing: fastOutSlowIn },
	      { transform: endRotate, offset: 1 }
	    ], { duration: getScaledAnimationDuration(333), fill: "forwards" });

	    var startDelay = getScaledAnimationDuration(333);
	    var duration = getScaledAnimationDuration(1000);
	    var hourglassClipAnimation = document.getElementById("hourglass_clip_mask_animation");
	    hourglassClipAnimation.setAttributeNS(null, "begin", startDelay + "ms");
	    hourglassClipAnimation.setAttributeNS(null, "dur", duration + "ms");
	    hourglassClipAnimation.setAttributeNS(null, "values", clipPathValues);
	    hourglassClipAnimation.beginElement();
	    var hourglassClipDebugAnimation = document.getElementById("hourglass_clip_mask_debug_animation");
	    hourglassClipDebugAnimation.setAttributeNS(null, "begin", startDelay + "ms");
	    hourglassClipDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
	    hourglassClipDebugAnimation.setAttributeNS(null, "values", clipPathValues);
	    hourglassClipDebugAnimation.beginElement();
	  }

	  // =============== Eye visibility icon.
	  var eyeMaskCrossedOut = "M2,4.27 L19.73,22 L22.27,19.46 L4.54,1.73 L4.54,1 L23,1 L23,23 L1,23 L1,4.27 Z";
	  var eyeMaskVisible = "M2,4.27 L2,4.27 L4.54,1.73 L4.54,1.73 L4.54,1 L23,1 L23,23 L1,23 L1,4.27 Z";

	  var isCrossedOut = true;
	  document.getElementById("ic_visibility").addEventListener("click", function () {
	    if (isCrossedOut) {
	      animateReverseCrossOut();
	    } else {
	      animateCrossOut();
	    }
	    isCrossedOut = !isCrossedOut;
	  });

	  function animateCrossOut() {
	    var duration = getScaledAnimationDuration(320);

	    var eyeClipAnimation = document.getElementById("eye_mask_animation");
	    eyeClipAnimation.setAttributeNS(null, "dur", duration + "ms");
	    eyeClipAnimation.setAttributeNS(null, "values", eyeMaskVisible + ";" + eyeMaskCrossedOut);
	    eyeClipAnimation.beginElement();

	    var eyeClipDebugAnimation = document.getElementById("eye_mask_debug_animation");
	    eyeClipDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
	    eyeClipDebugAnimation.setAttributeNS(null, "values", eyeMaskVisible + ";" + eyeMaskCrossedOut);
	    eyeClipDebugAnimation.beginElement();

	    var crossOutPath = document.getElementById("cross_out_path");
	    var pathLength = crossOutPath.getTotalLength();
	    crossOutPath.animate([
	      { strokeDasharray: pathLength, strokeDashoffset: pathLength, offset: 0, easing: fastOutSlowIn },
	      { strokeDasharray: pathLength, strokeDashoffset: 0, offset: 1 }
	    ], { duration: duration, fill: "forwards" });
	  }

	  function animateReverseCrossOut() {
	    var duration = getScaledAnimationDuration(200);

	    var eyeClipAnimation = document.getElementById("eye_mask_animation");
	    eyeClipAnimation.setAttributeNS(null, "dur", duration + "ms");
	    eyeClipAnimation.setAttributeNS(null, "values", eyeMaskCrossedOut + ";" + eyeMaskVisible);
	    eyeClipAnimation.beginElement();

	    var eyeClipDebugAnimation = document.getElementById("eye_mask_debug_animation");
	    eyeClipDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
	    eyeClipDebugAnimation.setAttributeNS(null, "values", eyeMaskCrossedOut + ";" + eyeMaskVisible);
	    eyeClipDebugAnimation.beginElement();

	    var crossOutPath = document.getElementById("cross_out_path");
	    var pathLength = crossOutPath.getTotalLength();
	    crossOutPath.animate([
	      { strokeDasharray: pathLength, strokeDashoffset: 0, offset: 0, easing: fastOutSlowIn },
	      { strokeDasharray: pathLength, strokeDashoffset: pathLength, offset: 1 }
	    ], { duration: duration, fill: "forwards" });
	  }

	  // =============== Heart break icon.
	  var isHeartFull = false;
	  document.getElementById("ic_heart").addEventListener("click", function () {
	    if (isHeartFull) {
	      animateHeartToBroken();
	    } else {
	      animateHeartToFull();
	    }
	    isHeartFull = !isHeartFull;
	  });

	  function animateHeartToFull() {
	    document.getElementById("heart_full_path").style.visibility = "visible";

	    var duration = getScaledAnimationDuration(300);
	    var heartFillAnimation = document.getElementById("heart_fill_animation");
	    heartFillAnimation.setAttributeNS(null, "dur", duration + "ms");
	    heartFillAnimation.beginElement();

	    if (shouldShowDebugClipMasks()) {
	      document.getElementById("heart_clip_path_debug").style.visibility = "visible";
	      var heartFillDebugAnimation = document.getElementById("heart_fill_debug_animation");
	      heartFillDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
	      heartFillDebugAnimation.beginElement();
	    }
	  }

	  function animateHeartBreak() {
	    document.getElementById("heart_clip_path_debug").style.visibility = "hidden";

	    document.getElementById("broken_heart_rotate_left_group").animate([
	      { transform: "rotate(0deg)", offset: 0, easing: linearOutSlowIn },
	      { transform: "rotate(-20deg)", offset: 1 }
	    ], { duration: getScaledAnimationDuration(400), fill: "forwards" });
	    document.getElementById("broken_heart_rotate_right_group").animate([
	      { transform: "rotate(0deg)", offset: 0, easing: linearOutSlowIn },
	      { transform: "rotate(20deg)", offset: 1 }
	    ], { duration: getScaledAnimationDuration(400), fill: "forwards" });

	    var heartBreakLeftPath = document.getElementById("broken_heart_left_path");
	    var heartBreakRightPath = document.getElementById("broken_heart_right_path");
	    heartBreakLeftPath.animate([
	      { fillOpacity: 1, offset: 0 },
	      { fillOpacity: 1, offset: 1 }
	    ], { duration: 0, fill: "forwards" });
	    heartBreakRightPath.animate([
	      { fillOpacity: 1, offset: 0 },
	      { fillOpacity: 1, offset: 1 }
	    ], { duration: 0, fill: "forwards" });
	    heartBreakLeftPath.animate([
	      { fillOpacity: 1, offset: 0, easing: linearOutSlowIn },
	      { fillOpacity: 0, offset: 1 }
	    ], { duration: getScaledAnimationDuration(300), fill: "forwards", delay: getScaledAnimationDuration(100) });
	    heartBreakRightPath.animate([
	      { fillOpacity: 1, offset: 0, easing: linearOutSlowIn },
	      { fillOpacity: 0, offset: 1 }
	    ], { duration: getScaledAnimationDuration(300), fill: "forwards", delay: getScaledAnimationDuration(100) });
	  }

	  function animateHeartToBroken() {
	    animateHeartBreak();

	    var heartStrokeLeftPath = document.getElementById("heart_stroke_left");
	    var heartStrokeRightPath = document.getElementById("heart_stroke_right");
	    var pathLeftLength = heartStrokeLeftPath.getTotalLength();
	    var pathRightLength = heartStrokeRightPath.getTotalLength();
	    heartStrokeLeftPath.animate([
	      { strokeDasharray: pathLeftLength, strokeDashoffset: pathLeftLength, strokeOpacity: 0, offset: 0 },
	      { strokeDasharray: pathLeftLength, strokeDashoffset: pathLeftLength, strokeOpacity: 0, offset: 1 }
	    ], { duration: 0, fill: "forwards" });
	    heartStrokeRightPath.animate([{ strokeDasharray: pathRightLength, strokeDashoffset: pathRightLength, strokeOpacity: 0, offset: 0 },
	      { strokeDasharray: pathRightLength, strokeDashoffset: pathRightLength, strokeOpacity: 0, offset: 1 }
	    ], { duration: 0, fill: "forwards" });
	    heartStrokeLeftPath.animate([
	      { strokeDasharray: pathLeftLength, strokeDashoffset: pathLeftLength, strokeOpacity: 0.4, offset: 0, easing: fastOutSlowIn },
	      { strokeDasharray: pathLeftLength, strokeDashoffset: 0, strokeOpacity: 1, offset: 1 }
	    ], { duration: getScaledAnimationDuration(300), fill: "forwards", delay: getScaledAnimationDuration(400) });
	    heartStrokeRightPath.animate([
	      { strokeDasharray: pathRightLength, strokeDashoffset: pathRightLength, strokeOpacity: 0.4, offset: 0, easing: fastOutSlowIn },
	      { strokeDasharray: pathRightLength, strokeDashoffset: 0, strokeOpacity: 1, offset: 1 }
	    ], { duration: getScaledAnimationDuration(300), fill: "forwards", delay: getScaledAnimationDuration(400) });

	    document.getElementById("heart_full_path").style.visibility = "hidden";
	  }
	});

	// =======================================================================================
	// =======================================================================================
	// =======================================================================================
	// =============== DEMO: downloading animated icon demo
	// =======================================================================================
	// =======================================================================================
	// =======================================================================================

	document.addEventListener("DOMContentLoaded", function () {
	  var root = document.getElementById("includes10");
	  var fastOutSlowIn = common.fastOutSlowIn;
	  var linearOutSlowIn = common.linearOutSlowIn;
	  var downloadingAnimations = [];
	  var isDownloading = false;
	  var lastKnownTimeMillis = 0;
	  var isCompleteAnimationPending = false;
	  var downloadingClipMaskDebug = document.getElementById("downloading_arrow_fill_clip_debug");
	  var downloadingClipMaskAnimationDebug = document.getElementById("downloading_arrow_fill_clip_animation_debug");
	  var downloadingLinePointsPath = document.getElementById("downloading_line_points_path");
	  var downloadingLinePointsPathAnimation = document.getElementById("downloading_line_points_path_animation");
	  var downloadingCheckArrowPointsPath = document.getElementById("downloading_check_arrow_points_path");
	  var downloadingCheckArrowPointsPathAnimation = document.getElementById("downloading_check_arrow_points_path_animation");

	  // Setup path morph point paths.
	  (function () {
	    var i;
	    var downloadingLinePaths = [
	      "M 50,190 c 0,0 47.66,0 70,0 c 22.34,0 70,0 70,0",
	      "M 50,190 c 0,0 47.66,0 70,0 c 22.34,0 70,0 70,0",
	      "M 50,190 c 0,0 32.34,19.79 70,19.79 c 37.66,0 70,-19.79 70,-19.79",
	      "M 50,190 c 0,0 26.45,-7.98 69.67,-7.98 c 43.21,0 70.33,7.98 70.33,7.98",
	      "M 50,190 c 0,0 47.66,0 70,0 c 22.34,0 70,0 70,0"
	    ];
	    downloadingLinePointsPath.setAttribute("d", common.createPathDotString(downloadingLinePaths[0], 4));
	    var downloadingLinePointsValues = [];
	    for (i = 0; i < downloadingLinePaths.length; i += 1) {
	      downloadingLinePointsValues.push(common.createPathDotString(downloadingLinePaths[i], 4));
	    }
	    downloadingLinePointsPathAnimation.setAttributeNS(null, "values", downloadingLinePointsValues.join(";"));
	    var downloadingCheckArrowPaths = [
	      "M 129.12,164 c 0,0 0.88,0 0.88,0 c 0,0 0,-134 0,-134 c 0,0 -20,0 -20,0 c 0,0 -0.1,114.38 -0.1,114.38 c 0,0 -51.8,-0.13 -51.8,-0.13 c 0,0 0.01,19.87 0.01,19.87 c 0,0 68.02,-0.11 68.02,-0.11 c 0,0 2.98,0 2.98,0 Z",
	      "M 129.12,164 c 0,0 0.88,0 0.88,0 c 0,0 0,-134 0,-134 c 0,0 -20,0 -20,0 c 0,0 -0.1,114.38 -0.1,114.38 c 0,0 0,-0.02 0,-0.02 c 0,0 0.01,19.87 0.01,19.87 c 0,0 18.4,-0.21 18.4,-0.21 c 0,0 0.81,-0.01 0.81,-0.01 Z",
	      "M 119.5,164 c 0,0 10.5,0 10.5,0 c 0,0 0,-134 0,-134 c 0,0 -20,0 -20,0 c 0,0 0,134 0,134 c 0,0 9.5,0 9.5,0 c 0,0 0,0 0,0 c 0,0 0,0 0,0 c 0,0 0,0 0,0 Z",
	      "M 119.5,90 c 0,0 30.5,0 30.5,0 c 0,0 0,-60 0,-60 c 0,0 -60,0 -60,0 c 0,0 0,60 0,60 c 0,0 29.5,0 29.5,0 c 0,0 0,0 0,0 c 0,0 0,0 0,0 c 0,0 0,0 0,0 Z",
	      "M 119.5,90 c 0,0 30.5,0 30.5,0 c 0,0 0,-60 0,-60 c 0,0 -60,0 -60,0 c 0,0 0,60 0,60 c 0,0 29.5,0 29.5,0 c 0,0 0,0 0,0 c 0,0 0,0 0,0 c 0,0 0,0 0,0 Z",
	      "M 190,90 c 0,0 -40,0 -40,0 c 0,0 0,-60 0,-60 c 0,0 -60,0 -60,0 c 0,0 0,60 0,60 c 0,0 -40,0 -40,0 c 0,0 70,70 70,70 c 0,0 70,-70 70,-70 c 0,0 0,0 0,0 Z"
	    ];
	    downloadingCheckArrowPointsPath.setAttribute("d", common.createPathDotString(downloadingCheckArrowPaths[0], 4));
	    var downloadingCheckArrowPointsValues = [];
	    for (i = 0; i < downloadingCheckArrowPaths.length; i += 1) {
	      downloadingCheckArrowPointsValues.push(common.createPathDotString(downloadingCheckArrowPaths[i], 4));
	    }
	    downloadingCheckArrowPointsPathAnimation.setAttributeNS(null, "values", downloadingCheckArrowPointsValues.join(";"));
	  })();

	  document.querySelector(root.nodeName + "#" + root.id + " input[id=includes10_showPathPointsCheckbox]").addEventListener("change", function () {
	    var visibility = document.querySelector(root.nodeName + "#" + root.id + " input[id=includes10_showPathPointsCheckbox]").checked ? "visible" : "hidden";
	    downloadingLinePointsPath.style.visibility = visibility;
	    downloadingCheckArrowPointsPath.style.visibility = visibility;
	  });

	  document.querySelector(root.nodeName + "#" + root.id + " input[id=includes10_showTrimPathsCheckbox]").addEventListener("change", function () {
	    var visibility = document.querySelector(root.nodeName + "#" + root.id + " input[id=includes10_showTrimPathsCheckbox]").checked ? "visible" : "hidden";
	    document.getElementById("downloading_progress_bar_check_debug").style.visibility = visibility;
	  });

	  function shouldShowDebugClipMasks() {
	    return document.querySelector(root.nodeName + "#" + root.id + " input[id=includes10_showClipMaskCheckbox]").checked;
	  }

	  document.querySelector(root.nodeName + "#" + root.id + " input[id=includes10_showClipMaskCheckbox]").addEventListener("change", function () {
	    var visibility = (isDownloading && shouldShowDebugClipMasks()) ? "visible" : "hidden";
	    downloadingClipMaskDebug.style.visibility = visibility;
	  });

	  function createProgressBarOuterRotationAnimation() {
	    return document.getElementById("downloading_progress_bar_outer_rotation").animate([
	      { transform: "rotate(0deg)", offset: 0, easing: 'linear' },
	      { transform: "rotate(720deg)", offset: 1 }
	    ], { duration: common.getDuration(root, 5332), fill: "forwards", iterations: "Infinity" });
	  }

	  function createTrimPathOffsetAnimation() {
	    return document.getElementById("downloading_progress_bar_inner_rotation").animate([
	      { transform: "rotate(0deg)", offset: 0, easing: 'linear' },
	      { transform: "rotate(90deg)", offset: 1 }
	    ], { duration: common.getDuration(root, 1333), fill: "forwards", iterations: "Infinity" });
	  }

	  function createTrimPathStartEndAnimation() {
	    var downloadingProgressBar = document.getElementById("downloading_progress_bar");
	    var fastOutSlowInFunction = bezierEasing(0.4, 0, 0.2, 1);
	    var trimPathEndFunction = function (t) {
	      if (t <= 0.5) {
	        return fastOutSlowInFunction(t * 2) * 0.96;
	      } else {
	        return 0.08 * t + 0.92;
	      }
	    };
	    var pathLength = downloadingProgressBar.getTotalLength();
	    var keyFrames = [];
	    for (var i = 0; i < 1344; i += 16) {
	      var trimPathStart = 0;
	      if (i >= 672) {
	        trimPathStart = fastOutSlowInFunction(((i - 672) / 672)) * 0.75;
	      }
	      var trimPathEnd = trimPathEndFunction(i / 1344) * 0.75 + 0.03;
	      var trimPathLength = trimPathEnd - trimPathStart;
	      keyFrames.push({
	        strokeDasharray: (trimPathLength * pathLength) + "," + (1 - trimPathLength) * pathLength,
	        strokeDashoffset: (-trimPathStart * pathLength),
	        easing: "linear",
	        offset: (i / 1344)
	      });
	    }
	    keyFrames.push({
	      strokeDasharray: (0.03 * pathLength) + "," + pathLength,
	      strokeDashoffset: (-0.75 * pathLength),
	      offset: 1
	    });
	    return downloadingProgressBar.animate(keyFrames, {
	      duration: common.getDuration(root, 1333),
	      fill: "forwards",
	      iterations: "Infinity"
	    });
	  }

	  function createLineAnimation() {
	    var animation = document.getElementById("downloading_line_path_animation");
	    animation.setAttributeNS(null, "dur", common.getDuration(root, 714) + "ms");
	    animation.beginElement();
	    downloadingLinePointsPathAnimation.setAttributeNS(null, "dur", common.getDuration(root, 714) + "ms");
	    downloadingLinePointsPathAnimation.beginElement();
	    return animation;
	  }

	  function createCheckToArrowPathMorphAnimation() {
	    var animation = document.getElementById("downloading_check_arrow_path_animation");
	    animation.setAttributeNS(null, "dur", common.getDuration(root, 833) + "ms");
	    animation.beginElement();
	    downloadingCheckArrowPointsPathAnimation.setAttributeNS(null, "dur", common.getDuration(root, 833) + "ms");
	    downloadingCheckArrowPointsPathAnimation.beginElement();
	    return animation;
	  }

	  function createCheckToArrowPathMotionAnimation() {
	    var animation = document.getElementById("downloading_check_arrow_path_motion_animation");
	    animation.setAttributeNS(null, "dur", common.getDuration(root, 517) + "ms");
	    animation.beginElement();
	    return animation;
	  }

	  function createCheckToArrowRotateAnimation() {
	    var checkarrow_rotation = document.getElementById("downloading_check_arrow_group_rotate");
	    checkarrow_rotation.animate([
	      { transform: "rotate(45deg)", offset: 0, easing: "cubic-bezier(0.2, 0, 0, 1)" },
	      { transform: "rotate(0deg)", offset: 1 }
	    ], { duration: common.getDuration(root, 517), fill: "forwards", delay: common.getDuration(root, 1800) });
	  }

	  function createArrowTranslateAnimation() {
	    return document.getElementById("downloading_arrow_group_translate").animate([
	      { transform: "translate(0px,0px)", easing: "linear", offset: 0 },
	      { transform: "translate(0px,-16.38px)", easing: "linear", offset: 0.1525 },
	      { transform: "translate(0px,-20px)", easing: "linear", offset: 0.2830 },
	      { transform: "translate(0px,-28.98px)", easing: "linear", offset: 0.3364 },
	      { transform: "translate(0px,-20px)", easing: "linear", offset: 0.3911 },
	      { transform: "translate(0px,32px)", easing: "linear", offset: 0.5437 },
	      { transform: "translate(0px,15px)", easing: "linear", offset: 0.6519 },
	      { transform: "translate(0px,0px)", offset: 1 }
	    ], { duration: common.getDuration(root, 767), fill: "forwards" });
	  }

	  function createArrowRotateAnimation() {
	    return document.getElementById("downloading_arrow_group_rotate").animate([
	      { transform: "rotate(0deg)", easing: "linear", offset: 0 },
	      { transform: "rotate(0deg)", easing: "cubic-bezier(0.32, 0, 0.23, 1)", offset: 0.1205 },
	      { transform: "rotate(10deg)", easing: "linear", offset: 0.4410 },
	      { transform: "rotate(10deg)", easing: "cubic-bezier(0.16, 0, 0.23, 1)", offset: 0.7205 },
	      { transform: "rotate(0deg)", offset: 1 }
	    ], { duration: common.getDuration(root, 415), fill: "forwards" });
	  }

	  function createFadeFillAnimation(path, durationMillis, startDelayMillis, startOpacity, endOpacity) {
	    return path.animate([
	      { fillOpacity: startOpacity, offset: 0, easing: fastOutSlowIn },
	      { fillOpacity: endOpacity, offset: 1 }
	    ], { duration: common.getDuration(root, durationMillis), fill: "forwards", delay: common.getDuration(root, startDelayMillis) });
	  }

	  function createFadeStrokeAnimation(path, durationMillis, startOpacity, endOpacity) {
	    return path.animate([
	      { strokeOpacity: startOpacity, offset: 0, easing: fastOutSlowIn },
	      { strokeOpacity: endOpacity, offset: 1 }
	    ], { duration: common.getDuration(root, durationMillis), fill: "forwards" });
	  }

	  function createStrokeWidthAnimation(path, durationMillis, startDelayMillis, startWidth, endWidth) {
	    return path.animate([
	      { strokeWidth: startWidth, offset: 0, easing: linearOutSlowIn },
	      { strokeWidth: endWidth, offset: 1 }
	    ], { duration: common.getDuration(root, durationMillis), fill: "forwards", delay: common.getDuration(root, startDelayMillis) });
	  }

	  function createArrowFillAnimation() {
	    var duration = common.getDuration(root, 1333);
	    var startDelay = common.getDuration(root, 333);
	    var animation = document.getElementById("downloading_arrow_fill_clip_animation");
	    animation.setAttributeNS(null, 'dur', duration + 'ms');
	    animation.setAttributeNS(null, 'begin', startDelay + 'ms');
	    animation.beginElement();
	    return animation;
	  }

	  function createArrowFillDebugAnimation() {
	    downloadingClipMaskDebug.style.visibility = shouldShowDebugClipMasks() ? "visible" : "hidden";
	    var duration = common.getDuration(root, 1333);
	    var startDelay = common.getDuration(root, 333);
	    var animation = document.getElementById("downloading_arrow_fill_clip_animation_debug");
	    animation.setAttributeNS(null, 'dur', duration + 'ms');
	    animation.setAttributeNS(null, 'begin', startDelay + 'ms');
	    animation.beginElement();
	    return animation;
	  }

	  function createProgressToCheckTrimAnimation(strokePath) {
	    var linearOutSlowInFunction = bezierEasing(0, 0, 0.2, 1);
	    var pathLength = strokePath.getTotalLength();
	    var keyFrames = [];
	    for (var i = 0; i <= 1024; i += 16) {
	      var trimPathStart = 0;
	      var trimPathEnd = linearOutSlowInFunction(i / 1024);
	      if (i >= 400) {
	        trimPathStart = linearOutSlowInFunction((i - 400) / 624) * 0.88047672583;
	      }
	      keyFrames.push({
	        strokeDasharray: ((trimPathEnd - trimPathStart) * pathLength) + "," + pathLength,
	        strokeDashoffset: (-trimPathStart * pathLength),
	        easing: "linear",
	        offset: (i / 1024)
	      });
	    }
	    return strokePath.animate(keyFrames, {
	      duration: common.getDuration(root, 1024),
	      fill: "forwards"
	    });
	  }

	  function beginDownloadingAnimation() {
	    var arrowPathLight = document.getElementById("downloading_arrow_path");
	    var arrowPathDark = document.getElementById("downloading_arrow_filling");
	    createFadeFillAnimation(arrowPathLight, 0, 0, 1, 1);
	    createFadeFillAnimation(arrowPathDark, 0, 0, 1, 1);
	    var checkArrowPath = document.getElementById("downloading_check_arrow_path");
	    createFadeFillAnimation(checkArrowPath, 0, 0, 0, 0);
	    createFadeFillAnimation(downloadingCheckArrowPointsPath, 0, 0, 0, 0);
	    var progressBarPath = document.getElementById("downloading_progress_bar");
	    createFadeStrokeAnimation(progressBarPath, 0, 1, 1);
	    var progressBarCheckPath = document.getElementById("downloading_progress_bar_check");
	    createFadeStrokeAnimation(progressBarCheckPath, 0, 0, 0);
	    downloadingAnimations.push(createProgressBarOuterRotationAnimation());
	    downloadingAnimations.push(createTrimPathStartEndAnimation());
	    downloadingAnimations.push(createTrimPathOffsetAnimation());
	    createLineAnimation();
	    createArrowTranslateAnimation();
	    createArrowRotateAnimation();
	    createArrowFillAnimation();
	    createArrowFillDebugAnimation();
	  }

	  function cancelDownloadingAnimations() {
	    downloadingClipMaskDebug.style.visibility = "hidden";
	    downloadingClipMaskAnimationDebug.endElement();
	    for (var i = 0; i < downloadingAnimations.length; i += 1) {
	      downloadingAnimations[i].cancel();
	    }
	    downloadingAnimations = [];
	  }

	  function beginCompleteAnimation() {
	    var progressBarPath = document.getElementById("downloading_progress_bar");
	    createFadeStrokeAnimation(progressBarPath, 0, 0, 0);
	    var progressBarCheckPath = document.getElementById("downloading_progress_bar_check");
	    createFadeStrokeAnimation(progressBarCheckPath, 0, 1, 1);
	    var arrowPathLight = document.getElementById("downloading_arrow_path");
	    var arrowPathDark = document.getElementById("downloading_arrow_filling");
	    createFadeFillAnimation(arrowPathLight, 500, 0, 1, 0);
	    createFadeFillAnimation(arrowPathDark, 500, 0, 1, 0);
	    // TODO(alockwood): figure out why SMIL won't respect these start delays... :/
	    setTimeout(function () {
	      isCompleteAnimationPending = false;
	      var checkArrowPath = document.getElementById("downloading_check_arrow_path");
	      createFadeFillAnimation(checkArrowPath, 0, 0, 1, 1);
	      createFadeFillAnimation(downloadingCheckArrowPointsPath, 0, 0, 1, 1);
	      createFadeStrokeAnimation(progressBarCheckPath, 0, 0, 0);
	      createCheckToArrowPathMorphAnimation();
	      createCheckToArrowPathMotionAnimation();
	    }, common.getDuration(root, 1800));
	    createCheckToArrowRotateAnimation();
	    var strokePath = document.getElementById("downloading_progress_bar_check");
	    createProgressToCheckTrimAnimation(strokePath);
	    createStrokeWidthAnimation(strokePath, 0, 0, 20, 20);
	    createStrokeWidthAnimation(strokePath, 500, 800, 20, 14.5);
	  }

	  document.getElementById("ic_downloading").addEventListener("click", function () {
	    if (isCompleteAnimationPending) {
	      return;
	    }
	    if (isDownloading) {
	      var scaledDuration = common.getDuration(root, 2666);
	      var elapsedTimeMillis = new Date().getTime() - lastKnownTimeMillis;
	      var delayTime = scaledDuration - (elapsedTimeMillis % scaledDuration);
	      isCompleteAnimationPending = true;
	      setTimeout(function () {
	        cancelDownloadingAnimations();
	        beginCompleteAnimation();
	      }, delayTime);
	    } else {
	      lastKnownTimeMillis = new Date().getTime();
	      beginDownloadingAnimation();
	    }
	    isDownloading = !isDownloading;
	  });
	});

	var common = (function () {
	  function getDuration(root, durationMillis) {
	    return getScaledDuration(root, durationMillis, 5);
	  }

	  function getScaledDuration(root, durationMillis, scaleFactor) {
	    var selector = document.querySelector(root.nodeName + "#" + root.id + " input[id=" + root.id + "_slowAnimationCheckbox]");
	    return durationMillis * (selector.checked ? scaleFactor : 1);
	  }

	  function addDotToList(pathDataDots, x, y, r) {
	    pathDataDots.push({ type: "M", values: [x, y] });
	    pathDataDots.push({ type: "m", values: [-r, 0] });
	    pathDataDots.push({ type: "a", values: [r, r, 0, 1, 0, r * 2, 0] });
	    pathDataDots.push({ type: "a", values: [r, r, 0, 1, 0, -r * 2, 0] });
	    pathDataDots.push({ type: "z" });
	  }

	  function createPathDotString(pathString, dotRadius) {
	    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	    path.setAttribute('d', pathString);
	    var pathData = path.getPathData({ normalize: true });
	    var pathDataDots = [];
	    var r = dotRadius;
	    for (var i = 0; i < pathData.length; i += 1) {
	      var seg = pathData[i];
	      if (seg.type === "M" || seg.type === "L") {
	        addDotToList(pathDataDots, seg.values[0], seg.values[1], r);
	      } else if (seg.type === "C") {
	        addDotToList(pathDataDots, seg.values[0], seg.values[1], r);
	        addDotToList(pathDataDots, seg.values[2], seg.values[3], r);
	        addDotToList(pathDataDots, seg.values[4], seg.values[5], r);
	      }
	    }
	    path.setPathData(pathDataDots);
	    return path.getAttribute('d');
	  }
	  return {
	    fastOutSlowIn: "cubic-bezier(0.4, 0, 0.2, 1)",
	    fastOutLinearIn: "cubic-bezier(0.4, 0, 1, 1)",
	    linearOutSlowIn: "cubic-bezier(0, 0, 0.2, 1)",
	    getDuration: getDuration,
	    getScaledDuration: getScaledDuration,
	    createPathDotString: createPathDotString
	  };
	})();


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * https://github.com/gre/bezier-easing
	 * BezierEasing - use bezier curve for transition easing function
	 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
	 */

	// These values are established by empiricism with tests (tradeoff: performance VS precision)
	var NEWTON_ITERATIONS = 4;
	var NEWTON_MIN_SLOPE = 0.001;
	var SUBDIVISION_PRECISION = 0.0000001;
	var SUBDIVISION_MAX_ITERATIONS = 10;

	var kSplineTableSize = 11;
	var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

	var float32ArraySupported = typeof Float32Array === 'function';

	function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
	function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
	function C (aA1)      { return 3.0 * aA1; }

	// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
	function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

	// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
	function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

	function binarySubdivide (aX, aA, aB, mX1, mX2) {
	  var currentX, currentT, i = 0;
	  do {
	    currentT = aA + (aB - aA) / 2.0;
	    currentX = calcBezier(currentT, mX1, mX2) - aX;
	    if (currentX > 0.0) {
	      aB = currentT;
	    } else {
	      aA = currentT;
	    }
	  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
	  return currentT;
	}

	function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
	 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
	   var currentSlope = getSlope(aGuessT, mX1, mX2);
	   if (currentSlope === 0.0) {
	     return aGuessT;
	   }
	   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
	   aGuessT -= currentX / currentSlope;
	 }
	 return aGuessT;
	}

	module.exports = function bezier (mX1, mY1, mX2, mY2) {
	  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
	    throw new Error('bezier x values must be in [0, 1] range');
	  }

	  // Precompute samples table
	  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
	  if (mX1 !== mY1 || mX2 !== mY2) {
	    for (var i = 0; i < kSplineTableSize; ++i) {
	      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
	    }
	  }

	  function getTForX (aX) {
	    var intervalStart = 0.0;
	    var currentSample = 1;
	    var lastSample = kSplineTableSize - 1;

	    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
	      intervalStart += kSampleStepSize;
	    }
	    --currentSample;

	    // Interpolate to provide an initial guess for t
	    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
	    var guessForT = intervalStart + dist * kSampleStepSize;

	    var initialSlope = getSlope(guessForT, mX1, mX2);
	    if (initialSlope >= NEWTON_MIN_SLOPE) {
	      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
	    } else if (initialSlope === 0.0) {
	      return guessForT;
	    } else {
	      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
	    }
	  }

	  return function BezierEasing (x) {
	    if (mX1 === mY1 && mX2 === mY2) {
	      return x; // linear
	    }
	    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
	    if (x === 0) {
	      return 0;
	    }
	    if (x === 1) {
	      return 1;
	    }
	    return calcBezier(getTForX(x), mY1, mY2);
	  };
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	// Copyright 2014 Google Inc. All rights reserved.
	//
	// Licensed under the Apache License, Version 2.0 (the "License");
	// you may not use this file except in compliance with the License.
	//     You may obtain a copy of the License at
	//
	// http://www.apache.org/licenses/LICENSE-2.0
	//
	// Unless required by applicable law or agreed to in writing, software
	// distributed under the License is distributed on an "AS IS" BASIS,
	// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	//     See the License for the specific language governing permissions and
	// limitations under the License.

	!function(a,b){var c={},d={},e={},f=null;!function(a,b){function c(a){if("number"==typeof a)return a;var b={};for(var c in a)b[c]=a[c];return b}function d(){this._delay=0,this._endDelay=0,this._fill="none",this._iterationStart=0,this._iterations=1,this._duration=0,this._playbackRate=1,this._direction="normal",this._easing="linear",this._easingFunction=x}function e(){return a.isDeprecated("Invalid timing inputs","2016-03-02","TypeError exceptions will be thrown instead.",!0)}function f(b,c,e){var f=new d;return c&&(f.fill="both",f.duration="auto"),"number"!=typeof b||isNaN(b)?void 0!==b&&Object.getOwnPropertyNames(b).forEach(function(c){if("auto"!=b[c]){if(("number"==typeof f[c]||"duration"==c)&&("number"!=typeof b[c]||isNaN(b[c])))return;if("fill"==c&&v.indexOf(b[c])==-1)return;if("direction"==c&&w.indexOf(b[c])==-1)return;if("playbackRate"==c&&1!==b[c]&&a.isDeprecated("AnimationEffectTiming.playbackRate","2014-11-28","Use Animation.playbackRate instead."))return;f[c]=b[c]}}):f.duration=b,f}function g(a){return"number"==typeof a&&(a=isNaN(a)?{duration:0}:{duration:a}),a}function h(b,c){return b=a.numericTimingToObject(b),f(b,c)}function i(a,b,c,d){return a<0||a>1||c<0||c>1?x:function(e){function f(a,b,c){return 3*a*(1-c)*(1-c)*c+3*b*(1-c)*c*c+c*c*c}if(e<=0){var g=0;return a>0?g=b/a:!b&&c>0&&(g=d/c),g*e}if(e>=1){var h=0;return c<1?h=(d-1)/(c-1):1==c&&a<1&&(h=(b-1)/(a-1)),1+h*(e-1)}for(var i=0,j=1;i<j;){var k=(i+j)/2,l=f(a,c,k);if(Math.abs(e-l)<1e-5)return f(b,d,k);l<e?i=k:j=k}return f(b,d,k)}}function j(a,b){return function(c){if(c>=1)return 1;var d=1/a;return c+=b*d,c-c%d}}function k(a){C||(C=document.createElement("div").style),C.animationTimingFunction="",C.animationTimingFunction=a;var b=C.animationTimingFunction;if(""==b&&e())throw new TypeError(a+" is not a valid value for easing");return b}function l(a){if("linear"==a)return x;var b=E.exec(a);if(b)return i.apply(this,b.slice(1).map(Number));var c=F.exec(a);if(c)return j(Number(c[1]),{start:y,middle:z,end:A}[c[2]]);var d=B[a];return d?d:x}function m(a){return Math.abs(n(a)/a.playbackRate)}function n(a){return 0===a.duration||0===a.iterations?0:a.duration*a.iterations}function o(a,b,c){if(null==b)return G;var d=c.delay+a+c.endDelay;return b<Math.min(c.delay,d)?H:b>=Math.min(c.delay+a,d)?I:J}function p(a,b,c,d,e){switch(d){case H:return"backwards"==b||"both"==b?0:null;case J:return c-e;case I:return"forwards"==b||"both"==b?a:null;case G:return null}}function q(a,b,c,d,e){var f=e;return 0===a?b!==H&&(f+=c):f+=d/a,f}function r(a,b,c,d,e,f){var g=a===1/0?b%1:a%1;return 0!==g||c!==I||0===d||0===e&&0!==f||(g=1),g}function s(a,b,c,d){return a===I&&b===1/0?1/0:1===c?Math.floor(d)-1:Math.floor(d)}function t(a,b,c){var d=a;if("normal"!==a&&"reverse"!==a){var e=b;"alternate-reverse"===a&&(e+=1),d="normal",e!==1/0&&e%2!==0&&(d="reverse")}return"normal"===d?c:1-c}function u(a,b,c){var d=o(a,b,c),e=p(a,c.fill,b,d,c.delay);if(null===e)return null;var f=q(c.duration,d,c.iterations,e,c.iterationStart),g=r(f,c.iterationStart,d,c.iterations,e,c.duration),h=s(d,c.iterations,g,f),i=t(c.direction,h,g);return c._easingFunction(i)}var v="backwards|forwards|both|none".split("|"),w="reverse|alternate|alternate-reverse".split("|"),x=function(a){return a};d.prototype={_setMember:function(b,c){this["_"+b]=c,this._effect&&(this._effect._timingInput[b]=c,this._effect._timing=a.normalizeTimingInput(this._effect._timingInput),this._effect.activeDuration=a.calculateActiveDuration(this._effect._timing),this._effect._animation&&this._effect._animation._rebuildUnderlyingAnimation())},get playbackRate(){return this._playbackRate},set delay(a){this._setMember("delay",a)},get delay(){return this._delay},set endDelay(a){this._setMember("endDelay",a)},get endDelay(){return this._endDelay},set fill(a){this._setMember("fill",a)},get fill(){return this._fill},set iterationStart(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterationStart must be a non-negative number, received: "+timing.iterationStart);this._setMember("iterationStart",a)},get iterationStart(){return this._iterationStart},set duration(a){if("auto"!=a&&(isNaN(a)||a<0)&&e())throw new TypeError("duration must be non-negative or auto, received: "+a);this._setMember("duration",a)},get duration(){return this._duration},set direction(a){this._setMember("direction",a)},get direction(){return this._direction},set easing(a){this._easingFunction=l(k(a)),this._setMember("easing",a)},get easing(){return this._easing},set iterations(a){if((isNaN(a)||a<0)&&e())throw new TypeError("iterations must be non-negative, received: "+a);this._setMember("iterations",a)},get iterations(){return this._iterations}};var y=1,z=.5,A=0,B={ease:i(.25,.1,.25,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1),"step-start":j(1,y),"step-middle":j(1,z),"step-end":j(1,A)},C=null,D="\\s*(-?\\d+\\.?\\d*|-?\\.\\d+)\\s*",E=new RegExp("cubic-bezier\\("+D+","+D+","+D+","+D+"\\)"),F=/steps\(\s*(\d+)\s*,\s*(start|middle|end)\s*\)/,G=0,H=1,I=2,J=3;a.cloneTimingInput=c,a.makeTiming=f,a.numericTimingToObject=g,a.normalizeTimingInput=h,a.calculateActiveDuration=m,a.calculateIterationProgress=u,a.calculatePhase=o,a.normalizeEasing=k,a.parseEasingFunction=l}(c,f),function(a,b){function c(a,b){return a in k?k[a][b]||b:b}function d(a){return"display"===a||0===a.lastIndexOf("animation",0)||0===a.lastIndexOf("transition",0)}function e(a,b,e){if(!d(a)){var f=h[a];if(f){i.style[a]=b;for(var g in f){var j=f[g],k=i.style[j];e[j]=c(j,k)}}else e[a]=c(a,b)}}function f(a){var b=[];for(var c in a)if(!(c in["easing","offset","composite"])){var d=a[c];Array.isArray(d)||(d=[d]);for(var e,f=d.length,g=0;g<f;g++)e={},"offset"in a?e.offset=a.offset:1==f?e.offset=1:e.offset=g/(f-1),"easing"in a&&(e.easing=a.easing),"composite"in a&&(e.composite=a.composite),e[c]=d[g],b.push(e)}return b.sort(function(a,b){return a.offset-b.offset}),b}function g(b){function c(){var a=d.length;null==d[a-1].offset&&(d[a-1].offset=1),a>1&&null==d[0].offset&&(d[0].offset=0);for(var b=0,c=d[0].offset,e=1;e<a;e++){var f=d[e].offset;if(null!=f){for(var g=1;g<e-b;g++)d[b+g].offset=c+(f-c)*g/(e-b);b=e,c=f}}}if(null==b)return[];window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||(b=f(b));for(var d=b.map(function(b){var c={};for(var d in b){var f=b[d];if("offset"==d){if(null!=f){if(f=Number(f),!isFinite(f))throw new TypeError("Keyframe offsets must be numbers.");if(f<0||f>1)throw new TypeError("Keyframe offsets must be between 0 and 1.")}}else if("composite"==d){if("add"==f||"accumulate"==f)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"add compositing is not supported"};if("replace"!=f)throw new TypeError("Invalid composite mode "+f+".")}else f="easing"==d?a.normalizeEasing(f):""+f;e(d,f,c)}return void 0==c.offset&&(c.offset=null),void 0==c.easing&&(c.easing="linear"),c}),g=!0,h=-(1/0),i=0;i<d.length;i++){var j=d[i].offset;if(null!=j){if(j<h)throw new TypeError("Keyframes are not loosely sorted by offset. Sort or specify offsets.");h=j}else g=!1}return d=d.filter(function(a){return a.offset>=0&&a.offset<=1}),g||c(),d}var h={background:["backgroundImage","backgroundPosition","backgroundSize","backgroundRepeat","backgroundAttachment","backgroundOrigin","backgroundClip","backgroundColor"],border:["borderTopColor","borderTopStyle","borderTopWidth","borderRightColor","borderRightStyle","borderRightWidth","borderBottomColor","borderBottomStyle","borderBottomWidth","borderLeftColor","borderLeftStyle","borderLeftWidth"],borderBottom:["borderBottomWidth","borderBottomStyle","borderBottomColor"],borderColor:["borderTopColor","borderRightColor","borderBottomColor","borderLeftColor"],borderLeft:["borderLeftWidth","borderLeftStyle","borderLeftColor"],borderRadius:["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],borderRight:["borderRightWidth","borderRightStyle","borderRightColor"],borderTop:["borderTopWidth","borderTopStyle","borderTopColor"],borderWidth:["borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth"],flex:["flexGrow","flexShrink","flexBasis"],font:["fontFamily","fontSize","fontStyle","fontVariant","fontWeight","lineHeight"],margin:["marginTop","marginRight","marginBottom","marginLeft"],outline:["outlineColor","outlineStyle","outlineWidth"],padding:["paddingTop","paddingRight","paddingBottom","paddingLeft"]},i=document.createElementNS("http://www.w3.org/1999/xhtml","div"),j={thin:"1px",medium:"3px",thick:"5px"},k={borderBottomWidth:j,borderLeftWidth:j,borderRightWidth:j,borderTopWidth:j,fontSize:{"xx-small":"60%","x-small":"75%",small:"89%",medium:"100%",large:"120%","x-large":"150%","xx-large":"200%"},fontWeight:{normal:"400",bold:"700"},outlineWidth:j,textShadow:{none:"0px 0px 0px transparent"},boxShadow:{none:"0px 0px 0px 0px transparent"}};a.convertToArrayForm=f,a.normalizeKeyframes=g}(c,f),function(a){var b={};a.isDeprecated=function(a,c,d,e){var f=e?"are":"is",g=new Date,h=new Date(c);return h.setMonth(h.getMonth()+3),!(g<h&&(a in b||console.warn("Web Animations: "+a+" "+f+" deprecated and will stop working on "+h.toDateString()+". "+d),b[a]=!0,1))},a.deprecated=function(b,c,d,e){var f=e?"are":"is";if(a.isDeprecated(b,c,d,e))throw new Error(b+" "+f+" no longer supported. "+d)}}(c),function(){if(document.documentElement.animate){var a=document.documentElement.animate([],0),b=!0;if(a&&(b=!1,"play|currentTime|pause|reverse|playbackRate|cancel|finish|startTime|playState".split("|").forEach(function(c){void 0===a[c]&&(b=!0)})),!b)return}!function(a,b,c){function d(a){for(var b={},c=0;c<a.length;c++)for(var d in a[c])if("offset"!=d&&"easing"!=d&&"composite"!=d){var e={offset:a[c].offset,easing:a[c].easing,value:a[c][d]};b[d]=b[d]||[],b[d].push(e)}for(var f in b){var g=b[f];if(0!=g[0].offset||1!=g[g.length-1].offset)throw{type:DOMException.NOT_SUPPORTED_ERR,name:"NotSupportedError",message:"Partial keyframes are not supported"}}return b}function e(c){var d=[];for(var e in c)for(var f=c[e],g=0;g<f.length-1;g++){var h=g,i=g+1,j=f[h].offset,k=f[i].offset,l=j,m=k;0==g&&(l=-(1/0),0==k&&(i=h)),g==f.length-2&&(m=1/0,1==j&&(h=i)),d.push({applyFrom:l,applyTo:m,startOffset:f[h].offset,endOffset:f[i].offset,easingFunction:a.parseEasingFunction(f[h].easing),property:e,interpolation:b.propertyInterpolation(e,f[h].value,f[i].value)})}return d.sort(function(a,b){return a.startOffset-b.startOffset}),d}b.convertEffectInput=function(c){var f=a.normalizeKeyframes(c),g=d(f),h=e(g);return function(a,c){if(null!=c)h.filter(function(a){return c>=a.applyFrom&&c<a.applyTo}).forEach(function(d){var e=c-d.startOffset,f=d.endOffset-d.startOffset,g=0==f?0:d.easingFunction(e/f);b.apply(a,d.property,d.interpolation(g))});else for(var d in g)"offset"!=d&&"easing"!=d&&"composite"!=d&&b.clear(a,d)}}}(c,d,f),function(a,b,c){function d(a){return a.replace(/-(.)/g,function(a,b){return b.toUpperCase()})}function e(a,b,c){h[c]=h[c]||[],h[c].push([a,b])}function f(a,b,c){for(var f=0;f<c.length;f++){var g=c[f];e(a,b,d(g))}}function g(c,e,f){var g=c;/-/.test(c)&&!a.isDeprecated("Hyphenated property names","2016-03-22","Use camelCase instead.",!0)&&(g=d(c)),"initial"!=e&&"initial"!=f||("initial"==e&&(e=i[g]),"initial"==f&&(f=i[g]));for(var j=e==f?[]:h[g],k=0;j&&k<j.length;k++){var l=j[k][0](e),m=j[k][0](f);if(void 0!==l&&void 0!==m){var n=j[k][1](l,m);if(n){var o=b.Interpolation.apply(null,n);return function(a){return 0==a?e:1==a?f:o(a)}}}}return b.Interpolation(!1,!0,function(a){return a?f:e})}var h={};b.addPropertiesHandler=f;var i={backgroundColor:"transparent",backgroundPosition:"0% 0%",borderBottomColor:"currentColor",borderBottomLeftRadius:"0px",borderBottomRightRadius:"0px",borderBottomWidth:"3px",borderLeftColor:"currentColor",borderLeftWidth:"3px",borderRightColor:"currentColor",borderRightWidth:"3px",borderSpacing:"2px",borderTopColor:"currentColor",borderTopLeftRadius:"0px",borderTopRightRadius:"0px",borderTopWidth:"3px",bottom:"auto",clip:"rect(0px, 0px, 0px, 0px)",color:"black",fontSize:"100%",fontWeight:"400",height:"auto",left:"auto",letterSpacing:"normal",lineHeight:"120%",marginBottom:"0px",marginLeft:"0px",marginRight:"0px",marginTop:"0px",maxHeight:"none",maxWidth:"none",minHeight:"0px",minWidth:"0px",opacity:"1.0",outlineColor:"invert",outlineOffset:"0px",outlineWidth:"3px",paddingBottom:"0px",paddingLeft:"0px",paddingRight:"0px",paddingTop:"0px",right:"auto",textIndent:"0px",textShadow:"0px 0px 0px transparent",top:"auto",transform:"",verticalAlign:"0px",visibility:"visible",width:"auto",wordSpacing:"normal",zIndex:"auto"};b.propertyInterpolation=g}(c,d,f),function(a,b,c){function d(b){var c=a.calculateActiveDuration(b),d=function(d){return a.calculateIterationProgress(c,d,b)};return d._totalDuration=b.delay+c+b.endDelay,d}b.KeyframeEffect=function(c,e,f,g){var h,i=d(a.normalizeTimingInput(f)),j=b.convertEffectInput(e),k=function(){j(c,h)};return k._update=function(a){return h=i(a),null!==h},k._clear=function(){j(c,null)},k._hasSameTarget=function(a){return c===a},k._target=c,k._totalDuration=i._totalDuration,k._id=g,k},b.NullEffect=function(a){var b=function(){a&&(a(),a=null)};return b._update=function(){return null},b._totalDuration=0,b._hasSameTarget=function(){return!1},b}}(c,d,f),function(a,b){function c(a,b,c){c.enumerable=!0,c.configurable=!0,Object.defineProperty(a,b,c)}function d(a){this._surrogateStyle=document.createElementNS("http://www.w3.org/1999/xhtml","div").style,this._style=a.style,this._length=0,this._isAnimatedProperty={};for(var b=0;b<this._style.length;b++){var c=this._style[b];this._surrogateStyle[c]=this._style[c]}this._updateIndices()}function e(a){if(!a._webAnimationsPatchedStyle){var b=new d(a);try{c(a,"style",{get:function(){return b}})}catch(b){a.style._set=function(b,c){a.style[b]=c},a.style._clear=function(b){a.style[b]=""}}a._webAnimationsPatchedStyle=a.style}}var f={cssText:1,length:1,parentRule:1},g={getPropertyCSSValue:1,getPropertyPriority:1,getPropertyValue:1,item:1,removeProperty:1,setProperty:1},h={removeProperty:1,setProperty:1};d.prototype={get cssText(){return this._surrogateStyle.cssText},set cssText(a){for(var b={},c=0;c<this._surrogateStyle.length;c++)b[this._surrogateStyle[c]]=!0;this._surrogateStyle.cssText=a,this._updateIndices();for(var c=0;c<this._surrogateStyle.length;c++)b[this._surrogateStyle[c]]=!0;for(var d in b)this._isAnimatedProperty[d]||this._style.setProperty(d,this._surrogateStyle.getPropertyValue(d))},get length(){return this._surrogateStyle.length},get parentRule(){return this._style.parentRule},_updateIndices:function(){for(;this._length<this._surrogateStyle.length;)Object.defineProperty(this,this._length,{configurable:!0,enumerable:!1,get:function(a){return function(){return this._surrogateStyle[a]}}(this._length)}),this._length++;for(;this._length>this._surrogateStyle.length;)this._length--,Object.defineProperty(this,this._length,{configurable:!0,enumerable:!1,value:void 0})},_set:function(a,b){this._style[a]=b,this._isAnimatedProperty[a]=!0},_clear:function(a){this._style[a]=this._surrogateStyle[a],delete this._isAnimatedProperty[a]}};for(var i in g)d.prototype[i]=function(a,b){return function(){var c=this._surrogateStyle[a].apply(this._surrogateStyle,arguments);return b&&(this._isAnimatedProperty[arguments[0]]||this._style[a].apply(this._style,arguments),this._updateIndices()),c}}(i,i in h);for(var j in document.documentElement.style)j in f||j in g||!function(a){c(d.prototype,a,{get:function(){return this._surrogateStyle[a]},set:function(b){this._surrogateStyle[a]=b,this._updateIndices(),this._isAnimatedProperty[a]||(this._style[a]=b)}})}(j);a.apply=function(b,c,d){e(b),b.style._set(a.propertyName(c),d)},a.clear=function(b,c){b._webAnimationsPatchedStyle&&b.style._clear(a.propertyName(c))}}(d,f),function(a){window.Element.prototype.animate=function(b,c){var d="";return c&&c.id&&(d=c.id),a.timeline._play(a.KeyframeEffect(this,b,c,d))}}(d),function(a,b){function c(a,b,d){if("number"==typeof a&&"number"==typeof b)return a*(1-d)+b*d;if("boolean"==typeof a&&"boolean"==typeof b)return d<.5?a:b;if(a.length==b.length){for(var e=[],f=0;f<a.length;f++)e.push(c(a[f],b[f],d));return e}throw"Mismatched interpolation arguments "+a+":"+b}a.Interpolation=function(a,b,d){return function(e){return d(c(a,b,e))}}}(d,f),function(a,b){function c(a,b,c){return Math.max(Math.min(a,c),b)}function d(b,d,e){var f=a.dot(b,d);f=c(f,-1,1);var g=[];if(1===f)g=b;else for(var h=Math.acos(f),i=1*Math.sin(e*h)/Math.sqrt(1-f*f),j=0;j<4;j++)g.push(b[j]*(Math.cos(e*h)-f*i)+d[j]*i);return g}var e=function(){function a(a,b){for(var c=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],d=0;d<4;d++)for(var e=0;e<4;e++)for(var f=0;f<4;f++)c[d][e]+=b[d][f]*a[f][e];return c}function b(a){return 0==a[0][2]&&0==a[0][3]&&0==a[1][2]&&0==a[1][3]&&0==a[2][0]&&0==a[2][1]&&1==a[2][2]&&0==a[2][3]&&0==a[3][2]&&1==a[3][3]}function c(c,d,e,f,g){for(var h=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],i=0;i<4;i++)h[i][3]=g[i];for(var i=0;i<3;i++)for(var j=0;j<3;j++)h[3][i]+=c[j]*h[j][i];var k=f[0],l=f[1],m=f[2],n=f[3],o=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];o[0][0]=1-2*(l*l+m*m),o[0][1]=2*(k*l-m*n),o[0][2]=2*(k*m+l*n),o[1][0]=2*(k*l+m*n),o[1][1]=1-2*(k*k+m*m),o[1][2]=2*(l*m-k*n),o[2][0]=2*(k*m-l*n),o[2][1]=2*(l*m+k*n),o[2][2]=1-2*(k*k+l*l),h=a(h,o);var p=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];e[2]&&(p[2][1]=e[2],h=a(h,p)),e[1]&&(p[2][1]=0,p[2][0]=e[0],h=a(h,p)),e[0]&&(p[2][0]=0,p[1][0]=e[0],h=a(h,p));for(var i=0;i<3;i++)for(var j=0;j<3;j++)h[i][j]*=d[i];return b(h)?[h[0][0],h[0][1],h[1][0],h[1][1],h[3][0],h[3][1]]:h[0].concat(h[1],h[2],h[3])}return c}();a.composeMatrix=e,a.quat=d}(d,f),function(a,b,c){a.sequenceNumber=0;var d=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="finish",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()};b.Animation=function(b){this.id="",b&&b._id&&(this.id=b._id),this._sequenceNumber=a.sequenceNumber++,this._currentTime=0,this._startTime=null,this._paused=!1,this._playbackRate=1,this._inTimeline=!0,this._finishedFlag=!0,this.onfinish=null,this._finishHandlers=[],this._effect=b,this._inEffect=this._effect._update(0),this._idle=!0,this._currentTimePending=!1},b.Animation.prototype={_ensureAlive:function(){this.playbackRate<0&&0===this.currentTime?this._inEffect=this._effect._update(-1):this._inEffect=this._effect._update(this.currentTime),this._inTimeline||!this._inEffect&&this._finishedFlag||(this._inTimeline=!0,b.timeline._animations.push(this))},_tickCurrentTime:function(a,b){a!=this._currentTime&&(this._currentTime=a,this._isFinished&&!b&&(this._currentTime=this._playbackRate>0?this._totalDuration:0),this._ensureAlive())},get currentTime(){return this._idle||this._currentTimePending?null:this._currentTime},set currentTime(a){a=+a,isNaN(a)||(b.restart(),this._paused||null==this._startTime||(this._startTime=this._timeline.currentTime-a/this._playbackRate),this._currentTimePending=!1,this._currentTime!=a&&(this._idle&&(this._idle=!1,this._paused=!0),this._tickCurrentTime(a,!0),b.applyDirtiedAnimation(this)))},get startTime(){return this._startTime},set startTime(a){a=+a,isNaN(a)||this._paused||this._idle||(this._startTime=a,this._tickCurrentTime((this._timeline.currentTime-this._startTime)*this.playbackRate),b.applyDirtiedAnimation(this))},get playbackRate(){return this._playbackRate},set playbackRate(a){if(a!=this._playbackRate){var c=this.currentTime;this._playbackRate=a,this._startTime=null,"paused"!=this.playState&&"idle"!=this.playState&&(this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)),null!=c&&(this.currentTime=c)}},get _isFinished(){return!this._idle&&(this._playbackRate>0&&this._currentTime>=this._totalDuration||this._playbackRate<0&&this._currentTime<=0)},get _totalDuration(){return this._effect._totalDuration},get playState(){return this._idle?"idle":null==this._startTime&&!this._paused&&0!=this.playbackRate||this._currentTimePending?"pending":this._paused?"paused":this._isFinished?"finished":"running"},_rewind:function(){if(this._playbackRate>=0)this._currentTime=0;else{if(!(this._totalDuration<1/0))throw new DOMException("Unable to rewind negative playback rate animation with infinite duration","InvalidStateError");this._currentTime=this._totalDuration}},play:function(){this._paused=!1,(this._isFinished||this._idle)&&(this._rewind(),this._startTime=null),this._finishedFlag=!1,this._idle=!1,this._ensureAlive(),b.applyDirtiedAnimation(this)},pause:function(){this._isFinished||this._paused||this._idle?this._idle&&(this._rewind(),this._idle=!1):this._currentTimePending=!0,this._startTime=null,this._paused=!0},finish:function(){this._idle||(this.currentTime=this._playbackRate>0?this._totalDuration:0,this._startTime=this._totalDuration-this.currentTime,this._currentTimePending=!1,b.applyDirtiedAnimation(this))},cancel:function(){this._inEffect&&(this._inEffect=!1,this._idle=!0,this._paused=!1,this._isFinished=!0,this._finishedFlag=!0,this._currentTime=0,this._startTime=null,this._effect._update(null),b.applyDirtiedAnimation(this))},reverse:function(){this.playbackRate*=-1,this.play()},addEventListener:function(a,b){"function"==typeof b&&"finish"==a&&this._finishHandlers.push(b)},removeEventListener:function(a,b){if("finish"==a){var c=this._finishHandlers.indexOf(b);c>=0&&this._finishHandlers.splice(c,1)}},_fireEvents:function(a){if(this._isFinished){if(!this._finishedFlag){var b=new d(this,this._currentTime,a),c=this._finishHandlers.concat(this.onfinish?[this.onfinish]:[]);setTimeout(function(){c.forEach(function(a){a.call(b.target,b)})},0),this._finishedFlag=!0}}else this._finishedFlag=!1},_tick:function(a,b){this._idle||this._paused||(null==this._startTime?b&&(this.startTime=a-this._currentTime/this.playbackRate):this._isFinished||this._tickCurrentTime((a-this._startTime)*this.playbackRate)),b&&(this._currentTimePending=!1,this._fireEvents(a))},get _needsTick(){return this.playState in{pending:1,running:1}||!this._finishedFlag},_targetAnimations:function(){var a=this._effect._target;return a._activeAnimations||(a._activeAnimations=[]),a._activeAnimations},_markTarget:function(){var a=this._targetAnimations();a.indexOf(this)===-1&&a.push(this)},_unmarkTarget:function(){var a=this._targetAnimations(),b=a.indexOf(this);b!==-1&&a.splice(b,1)}}}(c,d,f),function(a,b,c){function d(a){var b=j;j=[],a<q.currentTime&&(a=q.currentTime),q._animations.sort(e),q._animations=h(a,!0,q._animations)[0],b.forEach(function(b){b[1](a)}),g(),l=void 0}function e(a,b){return a._sequenceNumber-b._sequenceNumber}function f(){this._animations=[],this.currentTime=window.performance&&performance.now?performance.now():0}function g(){o.forEach(function(a){a()}),o.length=0}function h(a,c,d){p=!0,n=!1;var e=b.timeline;e.currentTime=a,m=!1;var f=[],g=[],h=[],i=[];return d.forEach(function(b){b._tick(a,c),b._inEffect?(g.push(b._effect),b._markTarget()):(f.push(b._effect),b._unmarkTarget()),b._needsTick&&(m=!0);var d=b._inEffect||b._needsTick;b._inTimeline=d,d?h.push(b):i.push(b)}),o.push.apply(o,f),o.push.apply(o,g),m&&requestAnimationFrame(function(){}),p=!1,[h,i]}var i=window.requestAnimationFrame,j=[],k=0;window.requestAnimationFrame=function(a){var b=k++;return 0==j.length&&i(d),j.push([b,a]),b},window.cancelAnimationFrame=function(a){j.forEach(function(b){b[0]==a&&(b[1]=function(){})})},f.prototype={_play:function(c){c._timing=a.normalizeTimingInput(c.timing);var d=new b.Animation(c);return d._idle=!1,d._timeline=this,this._animations.push(d),b.restart(),b.applyDirtiedAnimation(d),d}};var l=void 0,m=!1,n=!1;b.restart=function(){return m||(m=!0,requestAnimationFrame(function(){}),n=!0),n},b.applyDirtiedAnimation=function(a){if(!p){a._markTarget();var c=a._targetAnimations();c.sort(e);var d=h(b.timeline.currentTime,!1,c.slice())[1];d.forEach(function(a){var b=q._animations.indexOf(a);b!==-1&&q._animations.splice(b,1)}),g()}};var o=[],p=!1,q=new f;b.timeline=q}(c,d,f),function(a,b){function c(a,b){for(var c=0,d=0;d<a.length;d++)c+=a[d]*b[d];return c}function d(a,b){return[a[0]*b[0]+a[4]*b[1]+a[8]*b[2]+a[12]*b[3],a[1]*b[0]+a[5]*b[1]+a[9]*b[2]+a[13]*b[3],a[2]*b[0]+a[6]*b[1]+a[10]*b[2]+a[14]*b[3],a[3]*b[0]+a[7]*b[1]+a[11]*b[2]+a[15]*b[3],a[0]*b[4]+a[4]*b[5]+a[8]*b[6]+a[12]*b[7],a[1]*b[4]+a[5]*b[5]+a[9]*b[6]+a[13]*b[7],a[2]*b[4]+a[6]*b[5]+a[10]*b[6]+a[14]*b[7],a[3]*b[4]+a[7]*b[5]+a[11]*b[6]+a[15]*b[7],a[0]*b[8]+a[4]*b[9]+a[8]*b[10]+a[12]*b[11],a[1]*b[8]+a[5]*b[9]+a[9]*b[10]+a[13]*b[11],a[2]*b[8]+a[6]*b[9]+a[10]*b[10]+a[14]*b[11],a[3]*b[8]+a[7]*b[9]+a[11]*b[10]+a[15]*b[11],a[0]*b[12]+a[4]*b[13]+a[8]*b[14]+a[12]*b[15],a[1]*b[12]+a[5]*b[13]+a[9]*b[14]+a[13]*b[15],a[2]*b[12]+a[6]*b[13]+a[10]*b[14]+a[14]*b[15],a[3]*b[12]+a[7]*b[13]+a[11]*b[14]+a[15]*b[15]]}function e(a){var b=a.rad||0,c=a.deg||0,d=a.grad||0,e=a.turn||0,f=(c/360+d/400+e)*(2*Math.PI)+b;return f}function f(a){switch(a.t){case"rotatex":var b=e(a.d[0]);return[1,0,0,0,0,Math.cos(b),Math.sin(b),0,0,-Math.sin(b),Math.cos(b),0,0,0,0,1];case"rotatey":var b=e(a.d[0]);return[Math.cos(b),0,-Math.sin(b),0,0,1,0,0,Math.sin(b),0,Math.cos(b),0,0,0,0,1];case"rotate":case"rotatez":var b=e(a.d[0]);return[Math.cos(b),Math.sin(b),0,0,-Math.sin(b),Math.cos(b),0,0,0,0,1,0,0,0,0,1];case"rotate3d":var c=a.d[0],d=a.d[1],f=a.d[2],b=e(a.d[3]),g=c*c+d*d+f*f;if(0===g)c=1,d=0,f=0;else if(1!==g){var h=Math.sqrt(g);c/=h,d/=h,f/=h}var i=Math.sin(b/2),j=i*Math.cos(b/2),k=i*i;return[1-2*(d*d+f*f)*k,2*(c*d*k+f*j),2*(c*f*k-d*j),0,2*(c*d*k-f*j),1-2*(c*c+f*f)*k,2*(d*f*k+c*j),0,2*(c*f*k+d*j),2*(d*f*k-c*j),1-2*(c*c+d*d)*k,0,0,0,0,1];case"scale":return[a.d[0],0,0,0,0,a.d[1],0,0,0,0,1,0,0,0,0,1];case"scalex":return[a.d[0],0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];case"scaley":return[1,0,0,0,0,a.d[0],0,0,0,0,1,0,0,0,0,1];case"scalez":return[1,0,0,0,0,1,0,0,0,0,a.d[0],0,0,0,0,1];case"scale3d":return[a.d[0],0,0,0,0,a.d[1],0,0,0,0,a.d[2],0,0,0,0,1];case"skew":var l=e(a.d[0]),m=e(a.d[1]);return[1,Math.tan(m),0,0,Math.tan(l),1,0,0,0,0,1,0,0,0,0,1];case"skewx":var b=e(a.d[0]);return[1,0,0,0,Math.tan(b),1,0,0,0,0,1,0,0,0,0,1];case"skewy":var b=e(a.d[0]);return[1,Math.tan(b),0,0,0,1,0,0,0,0,1,0,0,0,0,1];case"translate":var c=a.d[0].px||0,d=a.d[1].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,c,d,0,1];case"translatex":var c=a.d[0].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,c,0,0,1];case"translatey":var d=a.d[0].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,0,d,0,1];case"translatez":var f=a.d[0].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,f,1];case"translate3d":var c=a.d[0].px||0,d=a.d[1].px||0,f=a.d[2].px||0;return[1,0,0,0,0,1,0,0,0,0,1,0,c,d,f,1];case"perspective":var n=a.d[0].px?-1/a.d[0].px:0;return[1,0,0,0,0,1,0,0,0,0,1,n,0,0,0,1];case"matrix":return[a.d[0],a.d[1],0,0,a.d[2],a.d[3],0,0,0,0,1,0,a.d[4],a.d[5],0,1];case"matrix3d":return a.d}}function g(a){return 0===a.length?[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]:a.map(f).reduce(d)}function h(a){return[i(g(a))]}var i=function(){function a(a){return a[0][0]*a[1][1]*a[2][2]+a[1][0]*a[2][1]*a[0][2]+a[2][0]*a[0][1]*a[1][2]-a[0][2]*a[1][1]*a[2][0]-a[1][2]*a[2][1]*a[0][0]-a[2][2]*a[0][1]*a[1][0]}function b(b){for(var c=1/a(b),d=b[0][0],e=b[0][1],f=b[0][2],g=b[1][0],h=b[1][1],i=b[1][2],j=b[2][0],k=b[2][1],l=b[2][2],m=[[(h*l-i*k)*c,(f*k-e*l)*c,(e*i-f*h)*c,0],[(i*j-g*l)*c,(d*l-f*j)*c,(f*g-d*i)*c,0],[(g*k-h*j)*c,(j*e-d*k)*c,(d*h-e*g)*c,0]],n=[],o=0;o<3;o++){for(var p=0,q=0;q<3;q++)p+=b[3][q]*m[q][o];n.push(p)}return n.push(1),m.push(n),m}function d(a){return[[a[0][0],a[1][0],a[2][0],a[3][0]],[a[0][1],a[1][1],a[2][1],a[3][1]],[a[0][2],a[1][2],a[2][2],a[3][2]],[a[0][3],a[1][3],a[2][3],a[3][3]]]}function e(a,b){for(var c=[],d=0;d<4;d++){for(var e=0,f=0;f<4;f++)e+=a[f]*b[f][d];c.push(e)}return c}function f(a){var b=g(a);return[a[0]/b,a[1]/b,a[2]/b]}function g(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])}function h(a,b,c,d){return[c*a[0]+d*b[0],c*a[1]+d*b[1],c*a[2]+d*b[2]]}function i(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function j(j){var k=[j.slice(0,4),j.slice(4,8),j.slice(8,12),j.slice(12,16)];if(1!==k[3][3])return null;for(var l=[],m=0;m<4;m++)l.push(k[m].slice());for(var m=0;m<3;m++)l[m][3]=0;if(0===a(l))return!1;var n,o=[];if(k[0][3]||k[1][3]||k[2][3]){o.push(k[0][3]),o.push(k[1][3]),o.push(k[2][3]),o.push(k[3][3]);var p=b(l),q=d(p);n=e(o,q)}else n=[0,0,0,1];var r=k[3].slice(0,3),s=[];s.push(k[0].slice(0,3));var t=[];t.push(g(s[0])),s[0]=f(s[0]);var u=[];s.push(k[1].slice(0,3)),u.push(c(s[0],s[1])),s[1]=h(s[1],s[0],1,-u[0]),t.push(g(s[1])),s[1]=f(s[1]),u[0]/=t[1],s.push(k[2].slice(0,3)),u.push(c(s[0],s[2])),s[2]=h(s[2],s[0],1,-u[1]),u.push(c(s[1],s[2])),s[2]=h(s[2],s[1],1,-u[2]),t.push(g(s[2])),s[2]=f(s[2]),u[1]/=t[2],u[2]/=t[2];var v=i(s[1],s[2]);if(c(s[0],v)<0)for(var m=0;m<3;m++)t[m]*=-1,s[m][0]*=-1,s[m][1]*=-1,s[m][2]*=-1;var w,x,y=s[0][0]+s[1][1]+s[2][2]+1;return y>1e-4?(w=.5/Math.sqrt(y),x=[(s[2][1]-s[1][2])*w,(s[0][2]-s[2][0])*w,(s[1][0]-s[0][1])*w,.25/w]):s[0][0]>s[1][1]&&s[0][0]>s[2][2]?(w=2*Math.sqrt(1+s[0][0]-s[1][1]-s[2][2]),x=[.25*w,(s[0][1]+s[1][0])/w,(s[0][2]+s[2][0])/w,(s[2][1]-s[1][2])/w]):s[1][1]>s[2][2]?(w=2*Math.sqrt(1+s[1][1]-s[0][0]-s[2][2]),x=[(s[0][1]+s[1][0])/w,.25*w,(s[1][2]+s[2][1])/w,(s[0][2]-s[2][0])/w]):(w=2*Math.sqrt(1+s[2][2]-s[0][0]-s[1][1]),x=[(s[0][2]+s[2][0])/w,(s[1][2]+s[2][1])/w,.25*w,(s[1][0]-s[0][1])/w]),[r,t,u,x,n]}return j}();a.dot=c,a.makeMatrixDecomposition=h}(d,f),function(a){function b(a,b){var c=a.exec(b);if(c)return c=a.ignoreCase?c[0].toLowerCase():c[0],[c,b.substr(c.length)]}function c(a,b){b=b.replace(/^\s*/,"");var c=a(b);if(c)return[c[0],c[1].replace(/^\s*/,"")]}function d(a,d,e){a=c.bind(null,a);for(var f=[];;){var g=a(e);if(!g)return[f,e];if(f.push(g[0]),e=g[1],g=b(d,e),!g||""==g[1])return[f,e];e=g[1]}}function e(a,b){for(var c=0,d=0;d<b.length&&(!/\s|,/.test(b[d])||0!=c);d++)if("("==b[d])c++;else if(")"==b[d]&&(c--,0==c&&d++,c<=0))break;var e=a(b.substr(0,d));return void 0==e?void 0:[e,b.substr(d)]}function f(a,b){for(var c=a,d=b;c&&d;)c>d?c%=d:d%=c;return c=a*b/(c+d)}function g(a){return function(b){var c=a(b);return c&&(c[0]=void 0),c}}function h(a,b){return function(c){var d=a(c);return d?d:[b,c]}}function i(b,c){for(var d=[],e=0;e<b.length;e++){var f=a.consumeTrimmed(b[e],c);if(!f||""==f[0])return;void 0!==f[0]&&d.push(f[0]),c=f[1]}if(""==c)return d}function j(a,b,c,d,e){for(var g=[],h=[],i=[],j=f(d.length,e.length),k=0;k<j;k++){var l=b(d[k%d.length],e[k%e.length]);if(!l)return;g.push(l[0]),h.push(l[1]),i.push(l[2])}return[g,h,function(b){var d=b.map(function(a,b){return i[b](a)}).join(c);return a?a(d):d}]}function k(a,b,c){for(var d=[],e=[],f=[],g=0,h=0;h<c.length;h++)if("function"==typeof c[h]){var i=c[h](a[g],b[g++]);d.push(i[0]),e.push(i[1]),f.push(i[2])}else!function(a){d.push(!1),e.push(!1),f.push(function(){return c[a]})}(h);return[d,e,function(a){for(var b="",c=0;c<a.length;c++)b+=f[c](a[c]);return b}]}a.consumeToken=b,a.consumeTrimmed=c,a.consumeRepeated=d,a.consumeParenthesised=e,a.ignore=g,a.optional=h,a.consumeList=i,a.mergeNestedRepeated=j.bind(null,null),a.mergeWrappedNestedRepeated=j,a.mergeList=k}(d),function(a){function b(b){function c(b){var c=a.consumeToken(/^inset/i,b);if(c)return d.inset=!0,c;var c=a.consumeLengthOrPercent(b);if(c)return d.lengths.push(c[0]),c;var c=a.consumeColor(b);return c?(d.color=c[0],c):void 0}var d={inset:!1,lengths:[],color:null},e=a.consumeRepeated(c,/^/,b);if(e&&e[0].length)return[d,e[1]]}function c(c){var d=a.consumeRepeated(b,/^,/,c);if(d&&""==d[1])return d[0]}function d(b,c){for(;b.lengths.length<Math.max(b.lengths.length,c.lengths.length);)b.lengths.push({px:0});for(;c.lengths.length<Math.max(b.lengths.length,c.lengths.length);)c.lengths.push({px:0});if(b.inset==c.inset&&!!b.color==!!c.color){for(var d,e=[],f=[[],0],g=[[],0],h=0;h<b.lengths.length;h++){var i=a.mergeDimensions(b.lengths[h],c.lengths[h],2==h);f[0].push(i[0]),g[0].push(i[1]),e.push(i[2])}if(b.color&&c.color){var j=a.mergeColors(b.color,c.color);f[1]=j[0],g[1]=j[1],d=j[2];
	}return[f,g,function(a){for(var c=b.inset?"inset ":" ",f=0;f<e.length;f++)c+=e[f](a[0][f])+" ";return d&&(c+=d(a[1])),c}]}}function e(b,c,d,e){function f(a){return{inset:a,color:[0,0,0,0],lengths:[{px:0},{px:0},{px:0},{px:0}]}}for(var g=[],h=[],i=0;i<d.length||i<e.length;i++){var j=d[i]||f(e[i].inset),k=e[i]||f(d[i].inset);g.push(j),h.push(k)}return a.mergeNestedRepeated(b,c,g,h)}var f=e.bind(null,d,", ");a.addPropertiesHandler(c,f,["box-shadow","text-shadow"])}(d),function(a,b){function c(a){return a.toFixed(3).replace(".000","")}function d(a,b,c){return Math.min(b,Math.max(a,c))}function e(a){if(/^\s*[-+]?(\d*\.)?\d+\s*$/.test(a))return Number(a)}function f(a,b){return[a,b,c]}function g(a,b){if(0!=a)return i(0,1/0)(a,b)}function h(a,b){return[a,b,function(a){return Math.round(d(1,1/0,a))}]}function i(a,b){return function(e,f){return[e,f,function(e){return c(d(a,b,e))}]}}function j(a,b){return[a,b,Math.round]}a.clamp=d,a.addPropertiesHandler(e,i(0,1/0),["border-image-width","line-height"]),a.addPropertiesHandler(e,i(0,1),["opacity","shape-image-threshold"]),a.addPropertiesHandler(e,g,["flex-grow","flex-shrink"]),a.addPropertiesHandler(e,h,["orphans","widows"]),a.addPropertiesHandler(e,j,["z-index"]),a.parseNumber=e,a.mergeNumbers=f,a.numberToString=c}(d,f),function(a,b){function c(a,b){if("visible"==a||"visible"==b)return[0,1,function(c){return c<=0?a:c>=1?b:"visible"}]}a.addPropertiesHandler(String,c,["visibility"])}(d),function(a,b){function c(a){a=a.trim(),f.fillStyle="#000",f.fillStyle=a;var b=f.fillStyle;if(f.fillStyle="#fff",f.fillStyle=a,b==f.fillStyle){f.fillRect(0,0,1,1);var c=f.getImageData(0,0,1,1).data;f.clearRect(0,0,1,1);var d=c[3]/255;return[c[0]*d,c[1]*d,c[2]*d,d]}}function d(b,c){return[b,c,function(b){function c(a){return Math.max(0,Math.min(255,a))}if(b[3])for(var d=0;d<3;d++)b[d]=Math.round(c(b[d]/b[3]));return b[3]=a.numberToString(a.clamp(0,1,b[3])),"rgba("+b.join(",")+")"}]}var e=document.createElementNS("http://www.w3.org/1999/xhtml","canvas");e.width=e.height=1;var f=e.getContext("2d");a.addPropertiesHandler(c,d,["background-color","border-bottom-color","border-left-color","border-right-color","border-top-color","color","outline-color","text-decoration-color"]),a.consumeColor=a.consumeParenthesised.bind(null,c),a.mergeColors=d}(d,f),function(a,b){function c(a,b){if(b=b.trim().toLowerCase(),"0"==b&&"px".search(a)>=0)return{px:0};if(/^[^(]*$|^calc/.test(b)){b=b.replace(/calc\(/g,"(");var c={};b=b.replace(a,function(a){return c[a]=null,"U"+a});for(var d="U("+a.source+")",e=b.replace(/[-+]?(\d*\.)?\d+/g,"N").replace(new RegExp("N"+d,"g"),"D").replace(/\s[+-]\s/g,"O").replace(/\s/g,""),f=[/N\*(D)/g,/(N|D)[*\/]N/g,/(N|D)O\1/g,/\((N|D)\)/g],g=0;g<f.length;)f[g].test(e)?(e=e.replace(f[g],"$1"),g=0):g++;if("D"==e){for(var h in c){var i=eval(b.replace(new RegExp("U"+h,"g"),"").replace(new RegExp(d,"g"),"*0"));if(!isFinite(i))return;c[h]=i}return c}}}function d(a,b){return e(a,b,!0)}function e(b,c,d){var e,f=[];for(e in b)f.push(e);for(e in c)f.indexOf(e)<0&&f.push(e);return b=f.map(function(a){return b[a]||0}),c=f.map(function(a){return c[a]||0}),[b,c,function(b){var c=b.map(function(c,e){return 1==b.length&&d&&(c=Math.max(c,0)),a.numberToString(c)+f[e]}).join(" + ");return b.length>1?"calc("+c+")":c}]}var f="px|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc",g=c.bind(null,new RegExp(f,"g")),h=c.bind(null,new RegExp(f+"|%","g")),i=c.bind(null,/deg|rad|grad|turn/g);a.parseLength=g,a.parseLengthOrPercent=h,a.consumeLengthOrPercent=a.consumeParenthesised.bind(null,h),a.parseAngle=i,a.mergeDimensions=e;var j=a.consumeParenthesised.bind(null,g),k=a.consumeRepeated.bind(void 0,j,/^/),l=a.consumeRepeated.bind(void 0,k,/^,/);a.consumeSizePairList=l;var m=function(a){var b=l(a);if(b&&""==b[1])return b[0]},n=a.mergeNestedRepeated.bind(void 0,d," "),o=a.mergeNestedRepeated.bind(void 0,n,",");a.mergeNonNegativeSizePair=n,a.addPropertiesHandler(m,o,["background-size"]),a.addPropertiesHandler(h,d,["border-bottom-width","border-image-width","border-left-width","border-right-width","border-top-width","flex-basis","font-size","height","line-height","max-height","max-width","outline-width","width"]),a.addPropertiesHandler(h,e,["border-bottom-left-radius","border-bottom-right-radius","border-top-left-radius","border-top-right-radius","bottom","left","letter-spacing","margin-bottom","margin-left","margin-right","margin-top","min-height","min-width","outline-offset","padding-bottom","padding-left","padding-right","padding-top","perspective","right","shape-margin","text-indent","top","vertical-align","word-spacing"])}(d,f),function(a,b){function c(b){return a.consumeLengthOrPercent(b)||a.consumeToken(/^auto/,b)}function d(b){var d=a.consumeList([a.ignore(a.consumeToken.bind(null,/^rect/)),a.ignore(a.consumeToken.bind(null,/^\(/)),a.consumeRepeated.bind(null,c,/^,/),a.ignore(a.consumeToken.bind(null,/^\)/))],b);if(d&&4==d[0].length)return d[0]}function e(b,c){return"auto"==b||"auto"==c?[!0,!1,function(d){var e=d?b:c;if("auto"==e)return"auto";var f=a.mergeDimensions(e,e);return f[2](f[0])}]:a.mergeDimensions(b,c)}function f(a){return"rect("+a+")"}var g=a.mergeWrappedNestedRepeated.bind(null,f,e,", ");a.parseBox=d,a.mergeBoxes=g,a.addPropertiesHandler(d,g,["clip"])}(d,f),function(a,b){function c(a){return function(b){var c=0;return a.map(function(a){return a===k?b[c++]:a})}}function d(a){return a}function e(b){if(b=b.toLowerCase().trim(),"none"==b)return[];for(var c,d=/\s*(\w+)\(([^)]*)\)/g,e=[],f=0;c=d.exec(b);){if(c.index!=f)return;f=c.index+c[0].length;var g=c[1],h=n[g];if(!h)return;var i=c[2].split(","),j=h[0];if(j.length<i.length)return;for(var k=[],o=0;o<j.length;o++){var p,q=i[o],r=j[o];if(p=q?{A:function(b){return"0"==b.trim()?m:a.parseAngle(b)},N:a.parseNumber,T:a.parseLengthOrPercent,L:a.parseLength}[r.toUpperCase()](q):{a:m,n:k[0],t:l}[r],void 0===p)return;k.push(p)}if(e.push({t:g,d:k}),d.lastIndex==b.length)return e}}function f(a){return a.toFixed(6).replace(".000000","")}function g(b,c){if(b.decompositionPair!==c){b.decompositionPair=c;var d=a.makeMatrixDecomposition(b)}if(c.decompositionPair!==b){c.decompositionPair=b;var e=a.makeMatrixDecomposition(c)}return null==d[0]||null==e[0]?[[!1],[!0],function(a){return a?c[0].d:b[0].d}]:(d[0].push(0),e[0].push(1),[d,e,function(b){var c=a.quat(d[0][3],e[0][3],b[5]),g=a.composeMatrix(b[0],b[1],b[2],c,b[4]),h=g.map(f).join(",");return h}])}function h(a){return a.replace(/[xy]/,"")}function i(a){return a.replace(/(x|y|z|3d)?$/,"3d")}function j(b,c){var d=a.makeMatrixDecomposition&&!0,e=!1;if(!b.length||!c.length){b.length||(e=!0,b=c,c=[]);for(var f=0;f<b.length;f++){var j=b[f].t,k=b[f].d,l="scale"==j.substr(0,5)?1:0;c.push({t:j,d:k.map(function(a){if("number"==typeof a)return l;var b={};for(var c in a)b[c]=l;return b})})}}var m=function(a,b){return"perspective"==a&&"perspective"==b||("matrix"==a||"matrix3d"==a)&&("matrix"==b||"matrix3d"==b)},o=[],p=[],q=[];if(b.length!=c.length){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]]}else for(var f=0;f<b.length;f++){var j,s=b[f].t,t=c[f].t,u=b[f].d,v=c[f].d,w=n[s],x=n[t];if(m(s,t)){if(!d)return;var r=g([b[f]],[c[f]]);o.push(r[0]),p.push(r[1]),q.push(["matrix",[r[2]]])}else{if(s==t)j=s;else if(w[2]&&x[2]&&h(s)==h(t))j=h(s),u=w[2](u),v=x[2](v);else{if(!w[1]||!x[1]||i(s)!=i(t)){if(!d)return;var r=g(b,c);o=[r[0]],p=[r[1]],q=[["matrix",[r[2]]]];break}j=i(s),u=w[1](u),v=x[1](v)}for(var y=[],z=[],A=[],B=0;B<u.length;B++){var C="number"==typeof u[B]?a.mergeNumbers:a.mergeDimensions,r=C(u[B],v[B]);y[B]=r[0],z[B]=r[1],A.push(r[2])}o.push(y),p.push(z),q.push([j,A])}}if(e){var D=o;o=p,p=D}return[o,p,function(a){return a.map(function(a,b){var c=a.map(function(a,c){return q[b][1][c](a)}).join(",");return"matrix"==q[b][0]&&16==c.split(",").length&&(q[b][0]="matrix3d"),q[b][0]+"("+c+")"}).join(" ")}]}var k=null,l={px:0},m={deg:0},n={matrix:["NNNNNN",[k,k,0,0,k,k,0,0,0,0,1,0,k,k,0,1],d],matrix3d:["NNNNNNNNNNNNNNNN",d],rotate:["A"],rotatex:["A"],rotatey:["A"],rotatez:["A"],rotate3d:["NNNA"],perspective:["L"],scale:["Nn",c([k,k,1]),d],scalex:["N",c([k,1,1]),c([k,1])],scaley:["N",c([1,k,1]),c([1,k])],scalez:["N",c([1,1,k])],scale3d:["NNN",d],skew:["Aa",null,d],skewx:["A",null,c([k,m])],skewy:["A",null,c([m,k])],translate:["Tt",c([k,k,l]),d],translatex:["T",c([k,l,l]),c([k,l])],translatey:["T",c([l,k,l]),c([l,k])],translatez:["L",c([l,l,k])],translate3d:["TTL",d]};a.addPropertiesHandler(e,j,["transform"])}(d,f),function(a){function b(a){var b=Number(a);if(!(isNaN(b)||b<100||b>900||b%100!==0))return b}function c(b){return b=100*Math.round(b/100),b=a.clamp(100,900,b),400===b?"normal":700===b?"bold":String(b)}function d(a,b){return[a,b,c]}a.addPropertiesHandler(b,d,["font-weight"])}(d),function(a){function b(a){var b={};for(var c in a)b[c]=-a[c];return b}function c(b){return a.consumeToken(/^(left|center|right|top|bottom)\b/i,b)||a.consumeLengthOrPercent(b)}function d(b,d){var e=a.consumeRepeated(c,/^/,d);if(e&&""==e[1]){var f=e[0];if(f[0]=f[0]||"center",f[1]=f[1]||"center",3==b&&(f[2]=f[2]||{px:0}),f.length==b){if(/top|bottom/.test(f[0])||/left|right/.test(f[1])){var h=f[0];f[0]=f[1],f[1]=h}if(/left|right|center|Object/.test(f[0])&&/top|bottom|center|Object/.test(f[1]))return f.map(function(a){return"object"==typeof a?a:g[a]})}}}function e(d){var e=a.consumeRepeated(c,/^/,d);if(e){for(var f=e[0],h=[{"%":50},{"%":50}],i=0,j=!1,k=0;k<f.length;k++){var l=f[k];"string"==typeof l?(j=/bottom|right/.test(l),i={left:0,right:0,center:i,top:1,bottom:1}[l],h[i]=g[l],"center"==l&&i++):(j&&(l=b(l),l["%"]=(l["%"]||0)+100),h[i]=l,i++,j=!1)}return[h,e[1]]}}function f(b){var c=a.consumeRepeated(e,/^,/,b);if(c&&""==c[1])return c[0]}var g={left:{"%":0},center:{"%":50},right:{"%":100},top:{"%":0},bottom:{"%":100}},h=a.mergeNestedRepeated.bind(null,a.mergeDimensions," ");a.addPropertiesHandler(d.bind(null,3),h,["transform-origin"]),a.addPropertiesHandler(d.bind(null,2),h,["perspective-origin"]),a.consumePosition=e,a.mergeOffsetList=h;var i=a.mergeNestedRepeated.bind(null,h,", ");a.addPropertiesHandler(f,i,["background-position","object-position"])}(d),function(a){function b(b){var c=a.consumeToken(/^circle/,b);if(c&&c[0])return["circle"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0,/^\(/)),d,a.ignore(a.consumeToken.bind(void 0,/^at/)),a.consumePosition,a.ignore(a.consumeToken.bind(void 0,/^\)/))],c[1]));var f=a.consumeToken(/^ellipse/,b);if(f&&f[0])return["ellipse"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0,/^\(/)),e,a.ignore(a.consumeToken.bind(void 0,/^at/)),a.consumePosition,a.ignore(a.consumeToken.bind(void 0,/^\)/))],f[1]));var g=a.consumeToken(/^polygon/,b);return g&&g[0]?["polygon"].concat(a.consumeList([a.ignore(a.consumeToken.bind(void 0,/^\(/)),a.optional(a.consumeToken.bind(void 0,/^nonzero\s*,|^evenodd\s*,/),"nonzero,"),a.consumeSizePairList,a.ignore(a.consumeToken.bind(void 0,/^\)/))],g[1])):void 0}function c(b,c){if(b[0]===c[0])return"circle"==b[0]?a.mergeList(b.slice(1),c.slice(1),["circle(",a.mergeDimensions," at ",a.mergeOffsetList,")"]):"ellipse"==b[0]?a.mergeList(b.slice(1),c.slice(1),["ellipse(",a.mergeNonNegativeSizePair," at ",a.mergeOffsetList,")"]):"polygon"==b[0]&&b[1]==c[1]?a.mergeList(b.slice(2),c.slice(2),["polygon(",b[1],g,")"]):void 0}var d=a.consumeParenthesised.bind(null,a.parseLengthOrPercent),e=a.consumeRepeated.bind(void 0,d,/^/),f=a.mergeNestedRepeated.bind(void 0,a.mergeDimensions," "),g=a.mergeNestedRepeated.bind(void 0,f,",");a.addPropertiesHandler(b,c,["shape-outside"])}(d),function(a,b){function c(a,b){b.concat([a]).forEach(function(b){b in document.documentElement.style&&(d[a]=b)})}var d={};c("transform",["webkitTransform","msTransform"]),c("transformOrigin",["webkitTransformOrigin"]),c("perspective",["webkitPerspective"]),c("perspectiveOrigin",["webkitPerspectiveOrigin"]),a.propertyName=function(a){return d[a]||a}}(d,f)}(),!function(){if(void 0===document.createElement("div").animate([]).oncancel){var a;if(window.performance&&performance.now)var a=function(){return performance.now()};else var a=function(){return Date.now()};var b=function(a,b,c){this.target=a,this.currentTime=b,this.timelineTime=c,this.type="cancel",this.bubbles=!1,this.cancelable=!1,this.currentTarget=a,this.defaultPrevented=!1,this.eventPhase=Event.AT_TARGET,this.timeStamp=Date.now()},c=window.Element.prototype.animate;window.Element.prototype.animate=function(d,e){var f=c.call(this,d,e);f._cancelHandlers=[],f.oncancel=null;var g=f.cancel;f.cancel=function(){g.call(this);var c=new b(this,null,a()),d=this._cancelHandlers.concat(this.oncancel?[this.oncancel]:[]);setTimeout(function(){d.forEach(function(a){a.call(c.target,c)})},0)};var h=f.addEventListener;f.addEventListener=function(a,b){"function"==typeof b&&"cancel"==a?this._cancelHandlers.push(b):h.call(this,a,b)};var i=f.removeEventListener;return f.removeEventListener=function(a,b){if("cancel"==a){var c=this._cancelHandlers.indexOf(b);c>=0&&this._cancelHandlers.splice(c,1)}else i.call(this,a,b)},f}}}(),function(a){var b=document.documentElement,c=null,d=!1;try{var e=getComputedStyle(b).getPropertyValue("opacity"),f="0"==e?"1":"0";c=b.animate({opacity:[f,f]},{duration:1}),c.currentTime=0,d=getComputedStyle(b).getPropertyValue("opacity")==f}catch(a){}finally{c&&c.cancel()}if(!d){var g=window.Element.prototype.animate;window.Element.prototype.animate=function(b,c){return window.Symbol&&Symbol.iterator&&Array.prototype.from&&b[Symbol.iterator]&&(b=Array.from(b)),Array.isArray(b)||null===b||(b=a.convertToArrayForm(b)),g.call(this,b,c)}}}(c),b.true=a}({},function(){return this}());
	//# sourceMappingURL=web-animations.min.js.map

/***/ },
/* 3 */
/***/ function(module, exports) {

	
	// @info
	//   Polyfill for SVG 2 getPathData() and setPathData() methods. Based on:
	//   - SVGPathSeg polyfill by Philip Rogers (MIT License)
	//     https://github.com/progers/pathseg
	//   - SVGPathNormalizer by Tadahisa Motooka (MIT License)
	//     https://github.com/motooka/SVGPathNormalizer/tree/master/src
	//   - arcToCubicCurves() by Dmitry Baranovskiy (MIT License)
	//     https://github.com/DmitryBaranovskiy/raphael/blob/v2.1.1/raphael.core.js#L1837
	// @author
	//   Jarosław Foksa
	// @license
	//   MIT License
	if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) {
	  (function() {
	    var commandsMap = {
	      "Z":"Z", "M":"M", "L":"L", "C":"C", "Q":"Q", "A":"A", "H":"H", "V":"V", "S":"S", "T":"T",
	      "z":"Z", "m":"m", "l":"l", "c":"c", "q":"q", "a":"a", "h":"h", "v":"v", "s":"s", "t":"t"
	    };

	    var Source = function(string) {
	      this._string = string;
	      this._currentIndex = 0;
	      this._endIndex = this._string.length;
	      this._prevCommand = null;
	      this._skipOptionalSpaces();
	    };

	    var isIE = window.navigator.userAgent.indexOf("MSIE ") !== -1;

	    Source.prototype = {
	      parseSegment: function() {
	        var char = this._string[this._currentIndex];
	        var command = commandsMap[char] ? commandsMap[char] : null;

	        if (command === null) {
	          // Possibly an implicit command. Not allowed if this is the first command.
	          if (this._prevCommand === null) {
	            return null;
	          }

	          // Check for remaining coordinates in the current command.
	          if (
	            (char === "+" || char === "-" || char === "." || (char >= "0" && char <= "9")) && this._prevCommand !== "Z"
	          ) {
	            if (this._prevCommand === "M") {
	              command = "L";
	            }
	            else if (this._prevCommand === "m") {
	              command = "l";
	            }
	            else {
	              command = this._prevCommand;
	            }
	          }
	          else {
	            command = null;
	          }

	          if (command === null) {
	            return null;
	          }
	        }
	        else {
	          this._currentIndex += 1;
	        }

	        this._prevCommand = command;

	        var values = null;
	        var cmd = command.toUpperCase();

	        if (cmd === "H" || cmd === "V") {
	          values = [this._parseNumber()];
	        }
	        else if (cmd === "M" || cmd === "L" || cmd === "T") {
	          values = [this._parseNumber(), this._parseNumber()];
	        }
	        else if (cmd === "S" || cmd === "Q") {
	          values = [this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber()];
	        }
	        else if (cmd === "C") {
	          values = [
	            this._parseNumber(),
	            this._parseNumber(),
	            this._parseNumber(),
	            this._parseNumber(),
	            this._parseNumber(),
	            this._parseNumber()
	          ];
	        }
	        else if (cmd === "A") {
	          values = [
	            this._parseNumber(),
	            this._parseNumber(),
	            this._parseNumber(),
	            this._parseArcFlag(),
	            this._parseArcFlag(),
	            this._parseNumber(),
	            this._parseNumber()
	          ];
	        }
	        else if (cmd === "Z") {
	          this._skipOptionalSpaces();
	          values = [];
	        }

	        if (values === null || values.indexOf(null) >= 0) {
	          // Unknown command or known command with invalid values
	          return null;
	        }
	        else {
	          return {type: command, values: values};
	        }
	      },

	      hasMoreData: function() {
	        return this._currentIndex < this._endIndex;
	      },

	      peekSegmentType: function() {
	        var char = this._string[this._currentIndex];
	        return commandsMap[char] ? commandsMap[char] : null;
	      },

	      initialCommandIsMoveTo: function() {
	        // If the path is empty it is still valid, so return true.
	        if (!this.hasMoreData()) {
	          return true;
	        }

	        var command = this.peekSegmentType();
	        // Path must start with moveTo.
	        return command === "M" || command === "m";
	      },

	      _isCurrentSpace: function() {
	        var char = this._string[this._currentIndex];
	        return char <= " " && (char === " " || char === "\n" || char === "\t" || char === "\r" || char === "\f");
	      },

	      _skipOptionalSpaces: function() {
	        while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
	          this._currentIndex += 1;
	        }

	        return this._currentIndex < this._endIndex;
	      },

	      _skipOptionalSpacesOrDelimiter: function() {
	        if (
	          this._currentIndex < this._endIndex &&
	          !this._isCurrentSpace() &&
	          this._string[this._currentIndex] !== ","
	        ) {
	          return false;
	        }

	        if (this._skipOptionalSpaces()) {
	          if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ",") {
	            this._currentIndex += 1;
	            this._skipOptionalSpaces();
	          }
	        }
	        return this._currentIndex < this._endIndex;
	      },

	      // Parse a number from an SVG path. This very closely follows genericParseNumber(...) from
	      // Source/core/svg/SVGParserUtilities.cpp.
	      // Spec: http://www.w3.org/TR/SVG11/single-page.html#paths-PathDataBNF
	      _parseNumber: function() {
	        var exponent = 0;
	        var integer = 0;
	        var frac = 1;
	        var decimal = 0;
	        var sign = 1;
	        var expsign = 1;
	        var startIndex = this._currentIndex;

	        this._skipOptionalSpaces();

	        // Read the sign.
	        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "+") {
	          this._currentIndex += 1;
	        }
	        else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "-") {
	          this._currentIndex += 1;
	          sign = -1;
	        }

	        if (
	          this._currentIndex === this._endIndex ||
	          (
	            (this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") &&
	            this._string[this._currentIndex] !== "."
	          )
	        ) {
	          // The first character of a number must be one of [0-9+-.].
	          return null;
	        }

	        // Read the integer part, build right-to-left.
	        var startIntPartIndex = this._currentIndex;

	        while (
	          this._currentIndex < this._endIndex &&
	          this._string[this._currentIndex] >= "0" &&
	          this._string[this._currentIndex] <= "9"
	        ) {
	          this._currentIndex += 1; // Advance to first non-digit.
	        }

	        if (this._currentIndex !== startIntPartIndex) {
	          var scanIntPartIndex = this._currentIndex - 1;
	          var multiplier = 1;

	          while (scanIntPartIndex >= startIntPartIndex) {
	            integer += multiplier * (this._string[scanIntPartIndex] - "0");
	            scanIntPartIndex -= 1;
	            multiplier *= 10;
	          }
	        }

	        // Read the decimals.
	        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ".") {
	          this._currentIndex += 1;

	          // There must be a least one digit following the .
	          if (
	            this._currentIndex >= this._endIndex ||
	            this._string[this._currentIndex] < "0" ||
	            this._string[this._currentIndex] > "9"
	          ) {
	            return null;
	          }

	          while (
	            this._currentIndex < this._endIndex &&
	            this._string[this._currentIndex] >= "0" &&
	            this._string[this._currentIndex] <= "9"
	          ) {
	            frac *= 10;
	            decimal += (this._string.charAt(this._currentIndex) - "0") / frac;
	            this._currentIndex += 1;
	          }
	        }

	        // Read the exponent part.
	        if (
	          this._currentIndex !== startIndex &&
	          this._currentIndex + 1 < this._endIndex &&
	          (this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") &&
	          (this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m")
	        ) {
	          this._currentIndex += 1;

	          // Read the sign of the exponent.
	          if (this._string[this._currentIndex] === "+") {
	            this._currentIndex += 1;
	          }
	          else if (this._string[this._currentIndex] === "-") {
	            this._currentIndex += 1;
	            expsign = -1;
	          }

	          // There must be an exponent.
	          if (
	            this._currentIndex >= this._endIndex ||
	            this._string[this._currentIndex] < "0" ||
	            this._string[this._currentIndex] > "9"
	          ) {
	            return null;
	          }

	          while (
	            this._currentIndex < this._endIndex &&
	            this._string[this._currentIndex] >= "0" &&
	            this._string[this._currentIndex] <= "9"
	          ) {
	            exponent *= 10;
	            exponent += (this._string[this._currentIndex] - "0");
	            this._currentIndex += 1;
	          }
	        }

	        var number = integer + decimal;
	        number *= sign;

	        if (exponent) {
	          number *= Math.pow(10, expsign * exponent);
	        }

	        if (startIndex === this._currentIndex) {
	          return null;
	        }

	        this._skipOptionalSpacesOrDelimiter();

	        return number;
	      },

	      _parseArcFlag: function() {
	        if (this._currentIndex >= this._endIndex) {
	          return null;
	        }

	        var flag = null;
	        var flagChar = this._string[this._currentIndex];

	        this._currentIndex += 1;

	        if (flagChar === "0") {
	          flag = 0;
	        }
	        else if (flagChar === "1") {
	          flag = 1;
	        }
	        else {
	          return null;
	        }

	        this._skipOptionalSpacesOrDelimiter();
	        return flag;
	      }
	    };

	    var parsePathDataString = function(string) {
	      if (!string || string.length === 0) return [];

	      var source = new Source(string);
	      var pathData = [];

	      if (source.initialCommandIsMoveTo()) {
	        while (source.hasMoreData()) {
	          var pathSeg = source.parseSegment();

	          if (pathSeg === null) {
	            break;
	          }
	          else {
	            pathData.push(pathSeg);
	          }
	        }
	      }

	      return pathData;
	    }

	    var setAttribute = SVGPathElement.prototype.setAttribute;
	    var removeAttribute = SVGPathElement.prototype.removeAttribute;

	    var $cachedPathData = window.Symbol ? Symbol() : "__cachedPathData";
	    var $cachedNormalizedPathData = window.Symbol ? Symbol() : "__cachedNormalizedPathData";

	    // @info
	    //   Get an array of corresponding cubic bezier curve parameters for given arc curve paramters.
	    var arcToCubicCurves = function(x1, y1, x2, y2, r1, r2, angle, largeArcFlag, sweepFlag, _recursive) {
	      var degToRad = function(degrees) {
	        return (Math.PI * degrees) / 180;
	      };

	      var rotate = function(x, y, angleRad) {
	        var X = x * Math.cos(angleRad) - y * Math.sin(angleRad);
	        var Y = x * Math.sin(angleRad) + y * Math.cos(angleRad);
	        return {x: X, y: Y};
	      };

	      var angleRad = degToRad(angle);
	      var params = [];
	      var f1, f2, cx, cy;

	      if (_recursive) {
	        f1 = _recursive[0];
	        f2 = _recursive[1];
	        cx = _recursive[2];
	        cy = _recursive[3];
	      }
	      else {
	        var p1 = rotate(x1, y1, -angleRad);
	        x1 = p1.x;
	        y1 = p1.y;

	        var p2 = rotate(x2, y2, -angleRad);
	        x2 = p2.x;
	        y2 = p2.y;

	        var x = (x1 - x2) / 2;
	        var y = (y1 - y2) / 2;
	        var h = (x * x) / (r1 * r1) + (y * y) / (r2 * r2);

	        if (h > 1) {
	          h = Math.sqrt(h);
	          r1 = h * r1;
	          r2 = h * r2;
	        }

	        var sign;

	        if (largeArcFlag === sweepFlag) {
	          sign = -1;
	        }
	        else {
	          sign = 1;
	        }

	        var r1Pow = r1 * r1;
	        var r2Pow = r2 * r2;

	        var left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
	        var right = r1Pow * y * y + r2Pow * x * x;

	        var k = sign * Math.sqrt(Math.abs(left/right));

	        cx = k * r1 * y / r2 + (x1 + x2) / 2;
	        cy = k * -r2 * x / r1 + (y1 + y2) / 2;

	        f1 = Math.asin(((y1 - cy) / r2).toFixed(9));
	        f2 = Math.asin(((y2 - cy) / r2).toFixed(9));

	        if (x1 < cx) {
	          f1 = Math.PI - f1;
	        }
	        if (x2 < cx) {
	          f2 = Math.PI - f2;
	        }

	        if (f1 < 0) {
	          f1 = Math.PI * 2 + f1;
	        }
	        if (f2 < 0) {
	          f2 = Math.PI * 2 + f2;
	        }

	        if (sweepFlag && f1 > f2) {
	          f1 = f1 - Math.PI * 2;
	        }
	        if (!sweepFlag && f2 > f1) {
	          f2 = f2 - Math.PI * 2;
	        }
	      }

	      var df = f2 - f1;

	      if (Math.abs(df) > (Math.PI * 120 / 180)) {
	        var f2old = f2;
	        var x2old = x2;
	        var y2old = y2;

	        if (sweepFlag && f2 > f1) {
	          f2 = f1 + (Math.PI * 120 / 180) * (1);
	        }
	        else {
	          f2 = f1 + (Math.PI * 120 / 180) * (-1);
	        }

	        x2 = cx + r1 * Math.cos(f2);
	        y2 = cy + r2 * Math.sin(f2);
	        params = arcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [f2, f2old, cx, cy]);
	      }

	      df = f2 - f1;

	      var c1 = Math.cos(f1);
	      var s1 = Math.sin(f1);
	      var c2 = Math.cos(f2);
	      var s2 = Math.sin(f2);
	      var t = Math.tan(df / 4);
	      var hx = 4 / 3 * r1 * t;
	      var hy = 4 / 3 * r2 * t;

	      var m1 = [x1, y1];
	      var m2 = [x1 + hx * s1, y1 - hy * c1];
	      var m3 = [x2 + hx * s2, y2 - hy * c2];
	      var m4 = [x2, y2];

	      m2[0] = 2 * m1[0] - m2[0];
	      m2[1] = 2 * m1[1] - m2[1];

	      if (_recursive) {
	        return [m2, m3, m4].concat(params);
	      }
	      else {
	        params = [m2, m3, m4].concat(params).join().split(",");

	        var curves = [];
	        var curveParams = [];

	        params.forEach( function(param, i) {
	          if (i % 2) {
	            curveParams.push(rotate(params[i - 1], params[i], angleRad).y);
	          }
	          else {
	            curveParams.push(rotate(params[i], params[i + 1], angleRad).x);
	          }

	          if (curveParams.length === 6) {
	            curves.push(curveParams);
	            curveParams = [];
	          }
	        });

	        return curves;
	      }
	    };

	    var clonePathData = function(pathData) {
	      return pathData.map( function(seg) {
	        return {type: seg.type, values: Array.prototype.slice.call(seg.values)}
	      });
	    };

	    // @info
	    //   Takes any path data, returns path data that consists only from absolute commands.
	    var absolutizePathData = function(pathData) {
	      var absolutizedPathData = [];

	      var currentX = null;
	      var currentY = null;

	      var subpathX = null;
	      var subpathY = null;

	      pathData.forEach( function(seg) {
	        var type = seg.type;

	        if (type === "M") {
	          var x = seg.values[0];
	          var y = seg.values[1];

	          absolutizedPathData.push({type: "M", values: [x, y]});

	          subpathX = x;
	          subpathY = y;

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "m") {
	          var x = currentX + seg.values[0];
	          var y = currentY + seg.values[1];

	          absolutizedPathData.push({type: "M", values: [x, y]});

	          subpathX = x;
	          subpathY = y;

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "L") {
	          var x = seg.values[0];
	          var y = seg.values[1];

	          absolutizedPathData.push({type: "L", values: [x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "l") {
	          var x = currentX + seg.values[0];
	          var y = currentY + seg.values[1];

	          absolutizedPathData.push({type: "L", values: [x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "C") {
	          var x1 = seg.values[0];
	          var y1 = seg.values[1];
	          var x2 = seg.values[2];
	          var y2 = seg.values[3];
	          var x = seg.values[4];
	          var y = seg.values[5];

	          absolutizedPathData.push({type: "C", values: [x1, y1, x2, y2, x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "c") {
	          var x1 = currentX + seg.values[0];
	          var y1 = currentY + seg.values[1];
	          var x2 = currentX + seg.values[2];
	          var y2 = currentY + seg.values[3];
	          var x = currentX + seg.values[4];
	          var y = currentY + seg.values[5];

	          absolutizedPathData.push({type: "C", values: [x1, y1, x2, y2, x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "Q") {
	          var x1 = seg.values[0];
	          var y1 = seg.values[1];
	          var x = seg.values[2];
	          var y = seg.values[3];

	          absolutizedPathData.push({type: "Q", values: [x1, y1, x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "q") {
	          var x1 = currentX + seg.values[0];
	          var y1 = currentY + seg.values[1];
	          var x = currentX + seg.values[2];
	          var y = currentY + seg.values[3];

	          absolutizedPathData.push({type: "Q", values: [x1, y1, x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "A") {
	          var x = seg.values[5];
	          var y = seg.values[6];

	          absolutizedPathData.push({
	            type: "A",
	            values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
	          });

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "a") {
	          var x = currentX + seg.values[5];
	          var y = currentY + seg.values[6];

	          absolutizedPathData.push({
	            type: "A",
	            values: [seg.values[0], seg.values[1], seg.values[2], seg.values[3], seg.values[4], x, y]
	          });

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "H") {
	          var x = seg.values[0];
	          absolutizedPathData.push({type: "H", values: [x]});
	          currentX = x;
	        }

	        else if (type === "h") {
	          var x = currentX + seg.values[0];
	          absolutizedPathData.push({type: "H", values: [x]});
	          currentX = x;
	        }

	        else if (type === "V") {
	          var y = seg.values[0];
	          absolutizedPathData.push({type: "V", values: [y]});
	          currentY = y;
	        }

	        else if (type === "v") {
	          var y = currentY + seg.values[0];
	          absolutizedPathData.push({type: "V", values: [y]});
	          currentY = y;
	        }

	        else if (type === "S") {
	          var x2 = seg.values[0];
	          var y2 = seg.values[1];
	          var x = seg.values[2];
	          var y = seg.values[3];

	          absolutizedPathData.push({type: "S", values: [x2, y2, x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "s") {
	          var x2 = currentX + seg.values[0];
	          var y2 = currentY + seg.values[1];
	          var x = currentX + seg.values[2];
	          var y = currentY + seg.values[3];

	          absolutizedPathData.push({type: "S", values: [x2, y2, x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "T") {
	          var x = seg.values[0];
	          var y = seg.values[1]

	          absolutizedPathData.push({type: "T", values: [x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "t") {
	          var x = currentX + seg.values[0];
	          var y = currentY + seg.values[1]

	          absolutizedPathData.push({type: "T", values: [x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (type === "Z" || type === "z") {
	          absolutizedPathData.push({type: "Z", values: []});

	          currentX = subpathX;
	          currentY = subpathY;
	        }
	      });

	      return absolutizedPathData;
	    };

	    // @info
	    //   Takes path data that consists only from absolute commands, returns path data that consists only from
	    //   "M", "L", "C" and "Z" commands.
	    var reducePathData = function(pathData) {
	      var reducedPathData = [];
	      var lastType = null;

	      var lastControlX = null;
	      var lastControlY = null;

	      var currentX = null;
	      var currentY = null;

	      var subpathX = null;
	      var subpathY = null;

	      pathData.forEach( function(seg) {
	        if (seg.type === "M") {
	          var x = seg.values[0];
	          var y = seg.values[1];

	          reducedPathData.push({type: "M", values: [x, y]});

	          subpathX = x;
	          subpathY = y;

	          currentX = x;
	          currentY = y;
	        }

	        else if (seg.type === "C") {
	          var x1 = seg.values[0];
	          var y1 = seg.values[1];
	          var x2 = seg.values[2];
	          var y2 = seg.values[3];
	          var x = seg.values[4];
	          var y = seg.values[5];

	          reducedPathData.push({type: "C", values: [x1, y1, x2, y2, x, y]});

	          lastControlX = x2;
	          lastControlY = y2;

	          currentX = x;
	          currentY = y;
	        }

	        else if (seg.type === "L") {
	          var x = seg.values[0];
	          var y = seg.values[1];

	          reducedPathData.push({type: "L", values: [x, y]});

	          currentX = x;
	          currentY = y;
	        }

	        else if (seg.type === "H") {
	          var x = seg.values[0];

	          reducedPathData.push({type: "L", values: [x, currentY]});

	          currentX = x;
	        }

	        else if (seg.type === "V") {
	          var y = seg.values[0];

	          reducedPathData.push({type: "L", values: [currentX, y]});

	          currentY = y;
	        }

	        else if (seg.type === "S") {
	          var x2 = seg.values[0];
	          var y2 = seg.values[1];
	          var x = seg.values[2];
	          var y = seg.values[3];

	          var cx1, cy1;

	          if (lastType === "C" || lastType === "S") {
	            cx1 = currentX + (currentX - lastControlX);
	            cy1 = currentY + (currentY - lastControlY);
	          }
	          else {
	            cx1 = currentX;
	            cy1 = currentY;
	          }

	          reducedPathData.push({type: "C", values: [cx1, cy1, x2, y2, x, y]});

	          lastControlX = x2;
	          lastControlY = y2;

	          currentX = x;
	          currentY = y;
	        }

	        else if (seg.type === "T") {
	          var x = seg.values[0];
	          var y = seg.values[1];

	          var x1, y1;

	          if (lastType === "Q" || lastType === "T") {
	            x1 = currentX + (currentX - lastControlX);
	            y1 = currentY + (currentY - lastControlY);
	          }
	          else {
	            x1 = currentX;
	            y1 = currentY;
	          }

	          var cx1 = currentX + 2 * (x1 - currentX) / 3;
	          var cy1 = currentY + 2 * (y1 - currentY) / 3;
	          var cx2 = x + 2 * (x1 - x) / 3;
	          var cy2 = y + 2 * (y1 - y) / 3;

	          reducedPathData.push({type: "C", values: [cx1, cy1, cx2, cy2, x, y]});

	          lastControlX = x1;
	          lastControlY = y1;

	          currentX = x;
	          currentY = y;
	        }

	        else if (seg.type === "Q") {
	          var x1 = seg.values[0];
	          var y1 = seg.values[1];
	          var x = seg.values[2];
	          var y = seg.values[3];

	          var cx1 = currentX + 2 * (x1 - currentX) / 3;
	          var cy1 = currentY + 2 * (y1 - currentY) / 3;
	          var cx2 = x + 2 * (x1 - x) / 3;
	          var cy2 = y + 2 * (y1 - y) / 3;

	          reducedPathData.push({type: "C", values: [cx1, cy1, cx2, cy2, x, y]});

	          lastControlX = x1;
	          lastControlY = y1;

	          currentX = x;
	          currentY = y;
	        }

	        else if (seg.type === "A") {
	          var r1 = seg.values[0];
	          var r2 = seg.values[1];
	          var angle = seg.values[2];
	          var largeArcFlag = seg.values[3];
	          var sweepFlag = seg.values[4];
	          var x = seg.values[5];
	          var y = seg.values[6];

	          if (r1 === 0 || r2 === 0) {
	            reducedPathData.push({type: "C", values: [currentX, currentY, x, y, x, y]});

	            currentX = x;
	            currentY = y;
	          }
	          else {
	            if (currentX !== x || currentY !== y) {
	              var curves = arcToCubicCurves(currentX, currentY, x, y, r1, r2, angle, largeArcFlag, sweepFlag);

	              curves.forEach( function(curve) {
	                reducedPathData.push({type: "C", values: curve});

	                currentX = x;
	                currentY = y;
	              });
	            }
	          }
	        }

	        else if (seg.type === "Z") {
	          reducedPathData.push(seg);

	          currentX = subpathX;
	          currentY = subpathY;
	        }

	        lastType = seg.type;
	      });

	      return reducedPathData;
	    };

	    SVGPathElement.prototype.setAttribute = function(name, value) {
	      if (name === "d") {
	        this[$cachedPathData] = null;
	        this[$cachedNormalizedPathData] = null;
	      }

	      setAttribute.call(this, name, value);
	    };

	    SVGPathElement.prototype.removeAttribute = function(name, value) {
	      if (name === "d") {
	        this[$cachedPathData] = null;
	        this[$cachedNormalizedPathData] = null;
	      }

	      removeAttribute.call(this, name);
	    };

	    SVGPathElement.prototype.getPathData = function(options) {
	      if (options && options.normalize) {
	        if (this[$cachedNormalizedPathData]) {
	          return clonePathData(this[$cachedNormalizedPathData]);
	        }
	        else {
	          var pathData;

	          if (this[$cachedPathData]) {
	            pathData = clonePathData(this[$cachedPathData]);
	          }
	          else {
	            pathData = parsePathDataString(this.getAttribute("d") || "");
	            this[$cachedPathData] = clonePathData(pathData);
	          }

	          var normalizedPathData = reducePathData(absolutizePathData(pathData));
	          this[$cachedNormalizedPathData] = clonePathData(normalizedPathData);
	          return normalizedPathData;
	        }
	      }
	      else {
	        if (this[$cachedPathData]) {
	          return clonePathData(this[$cachedPathData]);
	        }
	        else {
	          var pathData = parsePathDataString(this.getAttribute("d") || "");
	          this[$cachedPathData] = clonePathData(pathData);
	          return pathData;
	        }
	      }
	    };

	    SVGPathElement.prototype.setPathData = function(pathData) {
	      if (pathData.length === 0) {
	        if (isIE) {
	          // @bugfix https://github.com/mbostock/d3/issues/1737
	          this.setAttribute("d", "");
	        }
	        else {
	          this.removeAttribute("d");
	        }
	      }
	      else {
	        var d = "";

	        for (var i = 0, l = pathData.length; i < l; i += 1) {
	          var seg = pathData[i];

	          if (i > 0) {
	            d += " ";
	          }

	          d += seg.type;

	          if (seg.values && seg.values.length > 0) {
	            d += " " + seg.values.join(" ");
	          }
	        }

	        this.setAttribute("d", d);
	      }
	    };
	  })();
	}


/***/ }
/******/ ]);