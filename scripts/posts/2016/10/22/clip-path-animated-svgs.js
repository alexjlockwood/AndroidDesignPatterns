document.addEventListener("DOMContentLoaded", function(event) {
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

  document.querySelector("input[id=clipPathShowClipMaskCheckbox]").addEventListener("change", function(event) {
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
  document.getElementById("ic_timer").addEventListener("click", function() {
    animateTimer();
  });

  function animateTimer() {
    document.getElementById("hourglass_fill_rotation").animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "transform": "rotate(180deg)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(333),
      fill: "forwards"
    });
    document.getElementById("hourglass_frame_rotation").animate([{
      "transform": "rotate(0deg)",
      offset: 0.0,
      easing: fastOutSlowIn
    }, {
      "transform": "rotate(180deg)",
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(333),
      fill: "forwards"
    });

    var hourglassClipAnimation = document.getElementById("hourglass_clip_mask_animation");
    var startDelay = getScaledAnimationDuration(333);
    var duration = getScaledAnimationDuration(1000);
    hourglassClipAnimation.setAttributeNS(null, "begin", startDelay + "ms");
    hourglassClipAnimation.setAttributeNS(null, "dur", duration + "ms");
    hourglassClipAnimation.beginElement();

    var hourglassClipDebugAnimation = document.getElementById("hourglass_clip_mask_debug_animation");
    var startDelay = getScaledAnimationDuration(333);
    var duration = getScaledAnimationDuration(1000);
    hourglassClipDebugAnimation.setAttributeNS(null, "begin", startDelay + "ms");
    hourglassClipDebugAnimation.setAttributeNS(null, "dur", duration + "ms");
    hourglassClipDebugAnimation.beginElement();
  }

  // =============== Eye visibility icon.
  var eyeMaskCrossedOut = "M2,4.27 L19.73,22 L22.27,19.46 L4.54,1.73 L4.54,1 L23,1 L23,23 L1,23 L1,4.27 Z";
  var eyeMaskVisible = "M2,4.27 L2,4.27 L4.54,1.73 L4.54,1.73 L4.54,1 L23,1 L23,23 L1,23 L1,4.27 Z";

  var isCrossedOut = true;
  document.getElementById("ic_visibility").addEventListener("click", function() {
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
    crossOutPath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": pathLength,
      offset: 0,
      easing: fastOutSlowIn
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
    crossOutPath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": 0,
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": pathLength,
      offset: 1
    }], {
      duration: duration,
      fill: "forwards"
    });
  }

  // =============== Heart break icon.
  var isHeartFull = false;
  document.getElementById("ic_heart").addEventListener("click", function() {
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

    document.getElementById("broken_heart_rotate_left_group").animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: linearOutSlowIn
    }, {
      "transform": "rotate(-20deg)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(400),
      fill: "forwards"
    });
    document.getElementById("broken_heart_rotate_right_group").animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: linearOutSlowIn
    }, {
      "transform": "rotate(20deg)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(400),
      fill: "forwards"
    });

    var heartBreakLeftPath = document.getElementById("broken_heart_left_path");
    var heartBreakRightPath = document.getElementById("broken_heart_right_path");
    heartBreakLeftPath.animate([{
      "fillOpacity": 1,
      offset: 0
    }, {
      "fillOpacity": 1,
      offset: 1
    }], {
      duration: 0,
      fill: "forwards"
    });
    heartBreakRightPath.animate([{
      "fillOpacity": 1,
      offset: 0
    }, {
      "fillOpacity": 1,
      offset: 1
    }], {
      duration: 0,
      fill: "forwards"
    });
    heartBreakLeftPath.animate([{
      "fillOpacity": 1,
      offset: 0,
      easing: linearOutSlowIn
    }, {
      "fillOpacity": 0,
      offset: 1
    }], {
      duration: getScaledAnimationDuration(300),
      fill: "forwards",
      delay: getScaledAnimationDuration(100)
    });
    heartBreakRightPath.animate([{
      "fillOpacity": 1,
      offset: 0,
      easing: linearOutSlowIn
    }, {
      "fillOpacity": 0,
      offset: 1
    }], {
      duration: getScaledAnimationDuration(300),
      fill: "forwards",
      delay: getScaledAnimationDuration(100)
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
      offset: 0
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
      offset: 0
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
      easing: fastOutSlowIn
    }, {
      "strokeDasharray": pathLeftLength,
      "strokeDashoffset": 0,
      "strokeOpacity": 1,
      offset: 1
    }], {
      duration: getScaledAnimationDuration(300),
      fill: "forwards",
      delay: getScaledAnimationDuration(400)
    });
    heartStrokeRightPath.animate([{
      "strokeDasharray": pathRightLength,
      "strokeDashoffset": pathRightLength,
      "strokeOpacity": 0.4,
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "strokeDasharray": pathRightLength,
      "strokeDashoffset": 0,
      "strokeOpacity": 1,
      offset: 1
    }], {
      duration: getScaledAnimationDuration(300),
      fill: "forwards",
      delay: getScaledAnimationDuration(400)
    });

    document.getElementById("heart_full_path").style.visibility = "hidden";
  }
});
