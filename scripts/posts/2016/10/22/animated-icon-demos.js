'use strict';

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
  var currentAnimationDuration = 2000;

  function createOuterRect1Animation() {
    return document.getElementById('progressBarOuterRect1').animate([{
      transform: 'translateX(-522.59998px)',
      offset: 0,
      easing: 'linear'
    }, {
      transform: 'translateX(-522.59998px)',
      offset: 0.2,
      easing: 'cubic-bezier(0.5, 0, 0.701732, 0.495818703)'
    }, {
      transform: 'translateX(-185.382686832px)',
      offset: 0.5915,
      easing: 'cubic-bezier(0.302435, 0.38135197, 0.55, 0.956352125)'
    }, {
      transform: 'translateX(235.600006104px)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  function createInnerRect1Animation() {
    return document.getElementById('progressBarInnerRect1').animate([{
      transform: 'scaleX(0.1)',
      offset: 0,
      easing: 'linear'
    }, {
      transform: 'scaleX(0.1)',
      offset: 0.3665,
      easing: 'cubic-bezier(0.334731432, 0.124819821, 0.785843996, 1)'
    }, {
      transform: 'scaleX(0.826849212646)',
      offset: 0.6915,
      easing: 'cubic-bezier(0.225732004, 0, 0.233648906, 1.3709798)'
    }, {
      transform: 'scaleX(0.1)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
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
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  function createInnerRect2Animation() {
    return document.getElementById('progressBarInnerRect2').animate([{
      transform: 'scaleX(0.1)',
      offset: 0,
      easing: 'cubic-bezier(0.205028172, 0.057050836, 0.57660995, 0.453970841)'
    }, {
      transform: 'scaleX(0.571379510698)',
      offset: 0.1915,
      easing: 'cubic-bezier(0.152312994, 0.196431957, 0.648373778, 1.00431535)'
    }, {
      transform: 'scaleX(0.909950256348)',
      offset: 0.4415,
      easing: 'cubic-bezier(0.25775882, -0.003163357, 0.211761916, 1.38178961)'
    }, {
      transform: 'scaleX(0.1)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  var outerRect1Animation = createOuterRect1Animation();
  var innerRect1Animation = createInnerRect1Animation();
  var outerRect2Animation = createOuterRect2Animation();
  var innerRect2Animation = createInnerRect2Animation();

  var scaleSelector = document.querySelector("input[id=linearProgressScaleCheckbox]");
  var translateSelector = document.querySelector("input[id=linearProgressTranslateCheckbox]");
  var slowAnimationSelector = document.querySelector("input[id=linearProgressSlowAnimationCheckbox]");

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
  slowAnimationSelector.addEventListener("change", function () {
    if (slowAnimationSelector.checked) {
      currentAnimationDuration *= 5;
    } else {
      currentAnimationDuration /= 5;
    }
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
  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
  var fastOutLinearIn = "cubic-bezier(0.4, 0, 1, 1)";
  var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

  function getScaledAnimationDuration(durationMillis) {
    var slowAnimationSelector = document.querySelector("input[id=trimPathSlowAnimationCheckbox]");
    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
    return durationMillis * currentAnimationDurationFactor;
  }

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
    ], { duration: getScaledAnimationDuration(durationMillis), fill: "forwards", delay: getScaledAnimationDuration(startDelayMillis) });
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
    ], { duration: getScaledAnimationDuration(durationMillis), fill: "forwards", delay: getScaledAnimationDuration(startDelayMillis) });
  }

  document.querySelector("input[id=trimPathShowTrimPathsCheckbox]").addEventListener("change", function () {
    var visibility = document.querySelector("input[id=trimPathShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
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
    var fastOutSlowInFunction = bezier.createEasingFunction(0.4, 0, 0.2, 1);
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
        duration: getScaledAnimationDuration(600),
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
        duration: getScaledAnimationDuration(600),
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
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration(isAnimatingIn ? 300 : 0)
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
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
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
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
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
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
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

  function animateHandwritingStroke(pathId, duration, startDelay, easingCurve) {
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
      duration: getScaledAnimationDuration(duration),
      fill: "forwards",
      delay: getScaledAnimationDuration(startDelay)
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

  // Google IO 2016 animation.
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
    var oneDurationMillis = getScaledAnimationDuration(4000);
    var sixDurationMillis = getScaledAnimationDuration(5000);
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
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards",
      iterations: "Infinity"
    });
  }

  document.querySelector("input[id=trimPathSlowAnimationCheckbox]").addEventListener("change", function () {
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
    var fastOutSlowInFunction = bezier.createEasingFunction(0.4, 0, 0.2, 1);
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

  document.querySelector("input[id=circularProgressOuterRotationCheckbox]").addEventListener("change", function () {
    if (document.querySelector("input[id=circularProgressOuterRotationCheckbox]").checked) {
      outerRotationAnimation.play();
    } else {
      outerRotationAnimation.pause();
    }
  });
  document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]").addEventListener("change", function () {
    if (!document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]").checked) {
      trimPathOffsetAnimation.pause();
      return;
    }
    if (!document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]").checked) {
      trimPathOffsetAnimation.play();
      return;
    }
    restartAnimation(trimPathStartEndAnimation);
    restartAnimation(trimPathOffsetAnimation);
  });
  document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]").addEventListener("change", function () {
    if (!document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]").checked) {
      trimPathStartEndAnimation.pause();
      return;
    }
    if (!document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]").checked) {
      trimPathStartEndAnimation.play();
      return;
    }
    restartAnimation(trimPathStartEndAnimation);
    restartAnimation(trimPathOffsetAnimation);
  });
  document.querySelector("input[id=circularProgressShowTrimPathsCheckbox]").addEventListener("change", function () {
    var visibility = document.querySelector("input[id=circularProgressShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
    document.getElementById("circular_progress_circle_path_debug").style.visibility = visibility;
  });
  document.querySelector("input[id=circularProgressSlowAnimationCheckbox]").addEventListener("change", function () {
    outerRotationAnimation.cancel();
    trimPathOffsetAnimation.cancel();
    trimPathStartEndAnimation.cancel();
    if (document.querySelector("input[id=circularProgressOuterRotationCheckbox]").checked) {
      outerRotationAnimation = createRotationAnimation();
    }
    if (document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]").checked) {
      trimPathOffsetAnimation = createTrimPathOffsetAnimation();
    }
    if (document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]").checked) {
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

  function animatePoints(animationElementId, durationMillis, fromPathString, toPathString, dotRadius) {
    var listOfPathStrings = [fromPathString, toPathString];
    animatePointsWithList(animationElementId, durationMillis, listOfPathStrings, dotRadius);
  }

  function animatePointsWithList(animationElementId, durationMillis, listOfPathStrings, dotRadius) {
    var valuesString = "";
    for (var i = 0; i < listOfPathStrings.length; i += 1) {
      valuesString = valuesString + createPathDotString(listOfPathStrings[i], dotRadius);
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
      var dotPathString = createPathDotString(plusMinusPaths[isIconMinus ? 1 : 0], 0.4);
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
      var dotPathString = createPathDotString(crossTickPaths[isIconTick ? 1 : 0], 0.4);
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
      var dotPathString = createPathDotString(drawerArrowPaths[isIconDrawer ? 0 : 1], 0.4);
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
      var dotPathString1 = createPathDotString(isIconOverflow ? overflowToArrowPaths[0][0] : arrowToOverflowPaths[0][0], overflowArrowDotRadius);
      var dotPathString2 = createPathDotString(isIconOverflow ? overflowToArrowPaths[1][0] : arrowToOverflowPaths[1][0], overflowArrowDotRadius);
      var dotPathString3 = createPathDotString(isIconOverflow ? overflowToArrowPaths[2][0] : arrowToOverflowPaths[2][0], overflowArrowDotRadius);
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
      var dotPathString = createPathDotString(playPauseStopPaths[currentPlayPauseStopIconIndex], 0.4);
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
      document.getElementById("clip_path_debug").style.visibility = "visible";
      document.getElementById("hourglass_clip_mask_debug").style.visibility = "visible";
    } else {
      document.getElementById("eye_mask_clip_path_debug").style.visibility = "hidden";
      document.getElementById("clip_path_debug").style.visibility = "hidden";
      document.getElementById("hourglass_clip_mask_debug").style.visibility = "hidden";
    }
  });

  // =============== Hourglass icon.
  var numRotations = 0;
  document.getElementById("ic_timer").addEventListener("click", function () {
    animateTimer();
    numRotations += 1;
  });

  function animateTimer() {
    document.getElementById("hourglass_fill_rotation").animate([
      { transform: "rotate(0deg)", offset: 0, easing: fastOutSlowIn },
      { transform: "rotate(180deg)", offset: 1 }
    ], { duration: getScaledAnimationDuration(333), fill: "forwards" });
    document.getElementById("hourglass_frame_rotation").animate([
      { transform: "rotate(0deg)", offset: 0, easing: fastOutSlowIn },
      { transform: "rotate(180deg)", offset: 1 }
    ], { duration: getScaledAnimationDuration(333), fill: "forwards" });

    var startDelay = getScaledAnimationDuration(333);
    var duration = getScaledAnimationDuration(1000);
    var hourglassClipAnimation = document.getElementById("hourglass_clip_mask_animation");
    hourglassClipAnimation.setAttributeNS(null, "begin", startDelay + "ms");
    hourglassClipAnimation.setAttributeNS(null, "dur", duration + "ms");
    hourglassClipAnimation.beginElement();
    var hourglassClipDebugAnimation = document.getElementById("hourglass_clip_mask_debug_animation");
    hourglassClipDebugAnimation.setAttributeNS(null, "begin", startDelay + "ms");
    hourglassClipDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
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
      document.getElementById("clip_path_debug").style.visibility = "visible";
      var heartFillDebugAnimation = document.getElementById("heart_fill_debug_animation");
      heartFillDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
      heartFillDebugAnimation.beginElement();
    }
  }

  function animateHeartBreak() {
    document.getElementById("clip_path_debug").style.visibility = "hidden";

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
  var root = document.getElementById("includes10_root");
  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
  var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

  document.querySelector("input[id=downloadingShowTrimPathsCheckbox]").addEventListener("change", function () {
    var visibility = document.querySelector("input[id=downloadingShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
    document.getElementById("downloading_progress_bar_check_debug").style.visibility = visibility;
  });

  function shouldShowDebugClipMasks() {
    return document.querySelector("input[id=downloadingShowClipMaskCheckbox]").checked;
  }

  document.querySelector("input[id=downloadingShowClipMaskCheckbox]").addEventListener("change", function () {
    var shouldShowClipMasks = shouldShowDebugClipMasks();
    var visibility = shouldShowClipMasks ? "visible" : "hidden";
    document.getElementById("downloading_arrow_fill_clip_debug").style.visibility = visibility;
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
    var fastOutSlowInFunction = bezier.createEasingFunction(0.4, 0, 0.2, 1);
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
    return animation;
  }

  function createCheckToArrowPathMorphAnimation() {
    var animation = document.getElementById("downloading_check_arrow_path_animation");
    //animation.setAttributeNS(null, "begin", (getScaledAnimationDuration(1800) / 1000) + "s");
    animation.setAttributeNS(null, "dur", common.getDuration(root, 833) + "ms");
    animation.beginElement();
    return animation;
  }

  function createCheckToArrowPathMotionAnimation() {
    var animation = document.getElementById("downloading_check_arrow_path_motion_animation");
    //animation.setAttributeNS(null, "begin", (getScaledAnimationDuration(1800) / 1000) + "s");
    animation.setAttributeNS(null, "dur", common.getDuration(root, 517) + "ms");
    animation.beginElement();
    return animation;
  }

  function createCheckToArrowRotateAnimation() {
    var checkarrow_rotation = document.getElementById("downloading_check_arrow_group_rotate");
    checkarrow_rotation.animate([
      { transform: "rotate(45deg)", offset: 0, easing: "cubic-bezier(0.198183722744, 0, 0, 1)" },
      { transform: "rotate(0deg)", offset: 1 }
    ], { duration: common.getDuration(root, 517), fill: "forwards", delay: common.getDuration(root, 1800) });
  }

  function createArrowTranslateAnimation() {
    return document.getElementById("downloading_arrow_group_translate").animate([
      { transform: "translate(0px,0px)", easing: "linear", offset: 0 },
      { transform: "translate(0px,-16.38px)", easing: "linear", offset: 0.15254237288 },
      { transform: "translate(0px,-20px)", easing: "linear", offset: 0.28292046936 },
      { transform: "translate(0px,-28.98px)", easing: "linear", offset: 0.33637548891 },
      { transform: "translate(0px,-20px)", easing: "linear", offset: 0.39113428943 },
      { transform: "translate(0px,32px)", easing: "linear", offset: 0.54367666232 },
      { transform: "translate(0px,15px)", easing: "linear", offset: 0.65189048239 },
      { transform: "translate(0px,0px)", offset: 1 }
    ], { duration: common.getDuration(root, 767), fill: "forwards" });
  }

  function createArrowRotateAnimation() {
    return document.getElementById("downloading_arrow_group_rotate").animate([
      { transform: "rotate(0deg)", easing: "linear", offset: 0 },
      { transform: "rotate(0deg)", easing: "cubic-bezier(0.321997467027, 0, 0.232738510433, 1)", offset: 0.12048192771 },
      { transform: "rotate(10deg)", easing: "linear", offset: 0.44096385542 },
      { transform: "rotate(10deg)", easing: "cubic-bezier(0.148005204046, 0, 0.232989560987, 1)", offset: 0.72048192771 },
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
    var duration = common.getDuration(root, 1333);
    var startDelay = common.getDuration(root, 333);
    var animation = document.getElementById("downloading_arrow_fill_clip_animation_debug");
    animation.setAttributeNS(null, 'dur', duration + 'ms');
    animation.setAttributeNS(null, 'begin', startDelay + 'ms');
    animation.beginElement();
    return animation;
  }

  function createProgressToCheckTrimAnimation(strokePath) {
    var fastOutSlowInFunction = bezier.createEasingFunction(0, 0, 0.2, 1);
    var pathLength = strokePath.getTotalLength();
    var keyFrames = [];
    for (var i = 0; i <= 1024; i += 16) {
      var trimPathStart = 0;
      var trimPathEnd = fastOutSlowInFunction(i / 1024);
      if (i >= 400) {
        trimPathStart = fastOutSlowInFunction((i - 400) / 624) * 0.88047672583;
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

  var progressAnimations = [];

  function beginDownloadingAnimation() {
    var arrowPathLight = document.getElementById("downloading_arrow_path");
    var arrowPathDark = document.getElementById("downloading_arrow_filling");
    createFadeFillAnimation(arrowPathLight, 0, 0, 1, 1);
    createFadeFillAnimation(arrowPathDark, 0, 0, 1, 1);
    var checkArrowPath = document.getElementById("downloading_check_arrow_path");
    createFadeFillAnimation(checkArrowPath, 0, 0, 0, 0);
    var progressBarPath = document.getElementById("downloading_progress_bar");
    createFadeStrokeAnimation(progressBarPath, 0, 1, 1);
    var progressBarCheckPath = document.getElementById("downloading_progress_bar_check");
    createFadeStrokeAnimation(progressBarCheckPath, 0, 0, 0);
    progressAnimations.push(createProgressBarOuterRotationAnimation());
    progressAnimations.push(createTrimPathStartEndAnimation());
    progressAnimations.push(createTrimPathOffsetAnimation());
    createLineAnimation();
    createArrowTranslateAnimation();
    createArrowRotateAnimation();
    createArrowFillAnimation();
    createArrowFillDebugAnimation();
  }

  function beginCompleteAnimation() {
    for (var i = 0; i < progressAnimations.length; i += 1) {
      progressAnimations[i].cancel();
    }
    progressAnimations = [];
    var progressBarPath = document.getElementById("downloading_progress_bar");
    createFadeStrokeAnimation(progressBarPath, 0, 0, 0);
    var progressBarCheckPath = document.getElementById("downloading_progress_bar_check");
    createFadeStrokeAnimation(progressBarCheckPath, 0, 1, 1);
    var arrowPathLight = document.getElementById("downloading_arrow_path");
    var arrowPathDark = document.getElementById("downloading_arrow_filling");
    createFadeFillAnimation(arrowPathLight, 500, 0, 1, 0);
    createFadeFillAnimation(arrowPathDark, 500, 0, 1, 0);
    //createFadeFillAnimation(checkArrowPath, 0, 1800, 1, 1);
    // TODO(alockwood): figure out why SMIL won't respect these start delays... :/
    setTimeout(function () {
      var checkArrowPath = document.getElementById("downloading_check_arrow_path");
      createFadeFillAnimation(checkArrowPath, 0, 0, 1, 1);
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

  var numClicks = 0;
  var lastKnownTimeMillis = 0;
  var isCompleteAnimationPending = false;
  document.getElementById("ic_downloading").addEventListener("click", function () {
    if (isCompleteAnimationPending) {
      return;
    }
    if (numClicks % 2 === 0) {
      lastKnownTimeMillis = new Date().getTime();
      beginDownloadingAnimation();
    } else {
      var scaledDuration = common.getDuration(root, 2666);
      var elapsedTimeMillis = new Date().getTime() - lastKnownTimeMillis;
      var delayTime = scaledDuration - (elapsedTimeMillis % scaledDuration);
      isCompleteAnimationPending = true;
      setTimeout(function () {
        isCompleteAnimationPending = false;
        beginCompleteAnimation();
      }, delayTime);
    }
    numClicks += 1;
  });
});

var common = (function () {
  function getDuration(root, durationMillis) {
    return getScaledDuration(root, durationMillis, 5);
  }

  function getScaledDuration(root, durationMillis, scaleFactor) {
    var selector = document.querySelector(root.nodeName + "#" + root.id + " input[id=slowAnimationCheckbox]");
    return durationMillis * (selector.checked ? scaleFactor : 1);
  }
  return {
    fastOutSlowIn: "cubic-bezier(0.4, 0, 0.2, 1)",
    fastOutLinearIn: "cubic-bezier(0.4, 0, 1, 1)",
    linearOutSlowIn: "cubic-bezier(0, 0, 0.2, 1)",
    getDuration: getDuration,
    getScaledDuration: getScaledDuration
  };
})();

var bezier = (function () {
  // These values are established by empiricism with tests (tradeoff: performance VS precision)
  var NEWTON_ITERATIONS = 4;
  var NEWTON_MIN_SLOPE = 0.001;
  var SUBDIVISION_PRECISION = 0.0000001;
  var SUBDIVISION_MAX_ITERATIONS = 10;

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  var float32ArraySupported = typeof Float32Array === 'function';

  function A(aA1, aA2) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
  }

  function B(aA1, aA2) {
    return 3.0 * aA2 - 6.0 * aA1;
  }

  function C(aA1) {
    return 3.0 * aA1;
  }

  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  function calcBezier(aT, aA1, aA2) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }

  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  function getSlope(aT, aA1, aA2) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
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

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < NEWTON_ITERATIONS; i += 1) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) {
        return aGuessT;
      }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  var bezierEasing = function (mX1, mY1, mX2, mY2) {
    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
      throw new Error('bezier x values must be in [0, 1] range');
    }

    // Precompute samples table
    var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; i += 1) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {
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

    return function (x) {
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

  return { createEasingFunction: bezierEasing };
})();
