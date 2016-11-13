document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isCrossedOut = true;

  var eyeMaskCrossedOut = "M2,4.27 L19.73,22 L22.27,19.46 L4.54,1.73 L4.54,1 L23,1 L23,23 L1,23 L1,4.27 Z";
  var eyeMaskVisible = "M2,4.27 L2,4.27 L4.54,1.73 L4.54,1.73 L4.54,1 L23,1 L23,23 L1,23 L1,4.27 Z";

  var showClipMaskSelector = document.querySelector("input[id=clipPathShowClipMaskCheckbox]");
  showClipMaskSelector.addEventListener("change", function(event) {
    shouldShowClipMask = showClipMaskSelector.checked;
    var clipMaskDebugPath = document.getElementById("eye_mask_clip_path_debug");
    if (shouldShowClipMask) {
      clipMaskDebugPath.style.visibility = "visible";
    } else {
      clipMaskDebugPath.style.visibility = "hidden";
    }
  });
  var slowAnimationSelector = document.querySelector("input[id=clipPathSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_visibility").addEventListener("click", function() {
    toggleEyeAnimation();
  });

  function animateCrossOut() {
    var duration = 320 * currentAnimationDurationFactor;

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
    crossOutPath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": pathLength,
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": 0,
      offset: 1
    }], {
      duration: duration,
      fill: "forwards"
    });
  }

  function animateReverseCrossOut() {
    var duration = 200 * currentAnimationDurationFactor;

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
    crossOutPath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": 0,
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": pathLength,
      offset: 1
    }], {
      duration: duration,
      fill: "forwards"
    });
  }

  function toggleEyeAnimation() {
    if (isCrossedOut) {
      animateReverseCrossOut();
    } else {
      animateCrossOut();
    }
    isCrossedOut = !isCrossedOut;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isHeartFull = false;
  var shouldShowDebugClipPath = false;

  var showClipMaskSelector = document.querySelector("input[id=clipPathShowClipMaskCheckbox]");
  var slowAnimationSelector = document.querySelector("input[id=clipPathSlowAnimationCheckbox]");
  showClipMaskSelector.addEventListener("change", function(event) {
    shouldShowDebugClipPath = showClipMaskSelector.checked;
    var clipMaskDebugPath = document.getElementById("clip_path_debug");
    if (shouldShowDebugClipPath && isHeartFull) {
      clipMaskDebugPath.style.visibility = "visible";
    } else {
      clipMaskDebugPath.style.visibility = "hidden";
    }
  });
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 10 : 1;
  });
  document.getElementById("ic_heart").addEventListener("click", function() {
    toggleHeartAnimation();
  });

  function animateHeartToFull() {
    document.getElementById("heart_full_path").style.visibility = "visible";

    var duration = 300 * currentAnimationDurationFactor;
    var heartFillAnimation = document.getElementById("heart_fill_animation");
    heartFillAnimation.setAttributeNS(null, "dur", duration + "ms");
    heartFillAnimation.beginElement();

    if (shouldShowDebugClipPath) {
      document.getElementById("clip_path_debug").style.visibility = "visible";
      var heartFillDebugAnimation = document.getElementById("heart_fill_debug_animation");
      heartFillDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
      heartFillDebugAnimation.beginElement();
    }
  }

  function animateHeartBreak() {
    document.getElementById("clip_path_debug").style.visibility = "hidden";

    var heartBreakLeftRotateGroup = document.getElementById("broken_heart_rotate_left_group");
    var heartBreakRightRotateGroup = document.getElementById("broken_heart_rotate_right_group");
    heartBreakLeftRotateGroup.animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0.2, 1)"
    }, {
      "transform": "rotate(-20deg)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    heartBreakRightRotateGroup.animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0.2, 1)"
    }, {
      "transform": "rotate(20deg)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });

    var heartBreakLeftPath = document.getElementById("broken_heart_left_path");
    var heartBreakRightPath = document.getElementById("broken_heart_right_path");
    heartBreakLeftPath.animate([{
      "fillOpacity": 1,
      offset: 0,
    }, {
      "fillOpacity": 1,
      offset: 1
    }], {
      duration: 0,
      fill: "forwards",
    });
    heartBreakRightPath.animate([{
      "fillOpacity": 1,
      offset: 0,
    }, {
      "fillOpacity": 1,
      offset: 1
    }], {
      duration: 0,
      fill: "forwards",
    });
    heartBreakLeftPath.animate([{
      "fillOpacity": 1,
      offset: 0,
      easing: "cubic-bezier(0, 0, 0.2, 1)"
    }, {
      "fillOpacity": 0,
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: 100 * currentAnimationDurationFactor
    });
    heartBreakRightPath.animate([{
      "fillOpacity": 1,
      offset: 0,
      easing: "cubic-bezier(0, 0, 0.2, 1)"
    }, {
      "fillOpacity": 0,
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: 100 * currentAnimationDurationFactor
    });
  }

  function animateHeartToBroken() {
    animateHeartBreak();

    var heartStrokeLeftPath = document.getElementById("heart_stroke_left");
    var heartStrokeRightPath = document.getElementById("heart_stroke_right");
    var pathLeftLength = heartStrokeLeftPath.getTotalLength();
    var pathRightLength = heartStrokeRightPath.getTotalLength();
    heartStrokeLeftPath.animate([{
      "strokeDasharray": pathLeftLength,
      "strokeDashoffset": pathLeftLength,
      "strokeOpacity": 0,
      offset: 0,
    }, {
      "strokeDasharray": pathLeftLength,
      "strokeDashoffset": pathLeftLength,
      "strokeOpacity": 0,
      offset: 1
    }], {
      duration: 0,
      fill: "forwards"
    });
    heartStrokeRightPath.animate([{
      "strokeDasharray": pathRightLength,
      "strokeDashoffset": pathRightLength,
      "strokeOpacity": 0,
      offset: 0,
    }, {
      "strokeDasharray": pathRightLength,
      "strokeDashoffset": pathRightLength,
      "strokeOpacity": 0,
      offset: 1
    }], {
      duration: 0,
      fill: "forwards"
    });
    heartStrokeLeftPath.animate([{
      "strokeDasharray": pathLeftLength,
      "strokeDashoffset": pathLeftLength,
      "strokeOpacity": 0.4,
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "strokeDasharray": pathLeftLength,
      "strokeDashoffset": 0,
      "strokeOpacity": 1,
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: 400 * currentAnimationDurationFactor
    });
    heartStrokeRightPath.animate([{
      "strokeDasharray": pathRightLength,
      "strokeDashoffset": pathRightLength,
      "strokeOpacity": 0.4,
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "strokeDasharray": pathRightLength,
      "strokeDashoffset": 0,
      "strokeOpacity": 1,
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: 400 * currentAnimationDurationFactor
    });

    document.getElementById("heart_full_path").style.visibility = "hidden";
  }

  function toggleHeartAnimation() {
    if (isHeartFull) {
      animateHeartToBroken();
    } else {
      animateHeartToFull();
    }
    isHeartFull = !isHeartFull;
  }

});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var shouldShowClipMask = false;
  var showClipMaskSelector = document.querySelector("input[id=clipPathShowClipMaskCheckbox]");
  var slowAnimationSelector = document.querySelector("input[id=clipPathSlowAnimationCheckbox]");
  showClipMaskSelector.addEventListener("change", function(event) {
    shouldShowClipMask = showClipMaskSelector.checked;
    var clipMaskDebugPath = document.getElementById("mask_1_path_debug");
    if (shouldShowClipMask) {
      clipMaskDebugPath.style.visibility = "visible";
    } else {
      clipMaskDebugPath.style.visibility = "hidden";
    }
  });
  slowAnimationSelector.addEventListener("change", function(event) {
    if (slowAnimationSelector.checked) {
      currentAnimationDurationFactor = 5;
    } else {
      currentAnimationDurationFactor = 1;
    }
  });
  document.getElementById("ic_timer").addEventListener("click", function() {
    animateTimer();
  });

  function animateTimer() {
    var hourglassFillRotation = document.getElementById("hourglass_fill_rotation");
    hourglassFillRotation.animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "rotate(180deg)",
      offset: 1
    }], {
      duration: 333 * currentAnimationDurationFactor,
      fill: "forwards"
    });

    var hourglassFrameRotation = document.getElementById("hourglass_frame_rotation");
    hourglassFrameRotation.animate([{
      "transform": "rotate(0deg)",
      offset: 0.0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "rotate(180deg)",
      offset: 1.0
    }], {
      duration: 333 * currentAnimationDurationFactor,
      fill: "forwards"
    });

    var hourglassClipAnimation = document.getElementById("mask_1_path_animation");
    var startDelay = 333 * currentAnimationDurationFactor;
    var duration = 1000 * currentAnimationDurationFactor;
    hourglassClipAnimation.setAttributeNS(null, "begin", startDelay + "ms");
    hourglassClipAnimation.setAttributeNS(null, "dur", duration + "ms");
    hourglassClipAnimation.beginElement();

    var hourglassClipDebugAnimation = document.getElementById("mask_1_path_debug_animation");
    var startDelay = 333 * currentAnimationDurationFactor;
    var duration = 1000 * currentAnimationDurationFactor;
    hourglassClipDebugAnimation.setAttributeNS(null, "begin", startDelay + "ms");
    hourglassClipDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
    hourglassClipDebugAnimation.beginElement();
  }
});

