document.addEventListener("DOMContentLoaded", function(event) {
  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
  var fastOutLinearIn = "cubic-bezier(0.4, 0, 1, 1)";
  var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

  function getScaledAnimationDuration(durationMillis) {
    var slowAnimationSelector = document.querySelector("input[id=trimPathSlowAnimationCheckbox]");
    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
    return durationMillis * currentAnimationDurationFactor;
  }

  function animateTrimPathStart(strokePathId, durationMillis, easingFunction, isAnimatingIn) {
    animateStrokeWithDelay(strokePathId, durationMillis, 0, easingFunction, isAnimatingIn);
  }

  function animateTrimPathStartWithDelay(strokePathId, durationMillis, startDelayMillis, easingFunction, isAnimatingIn) {
    var strokePath = document.getElementById(strokePathId);
    var pathLength = strokePath.getTotalLength();
    // TODO(alockwood): remove this hack...
    strokePath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? -pathLength : 0),
      offset: 0
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? -pathLength : 0),
      offset: 1
    }], {
      duration: 0,
      fill: "forwards"
    });
    strokePath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? -pathLength : 0),
      easing: easingFunction,
      offset: 0
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : -pathLength),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards",
      delay: startDelayMillis
    });
  }

  function animateTrimPathEnd(strokePathId, durationMillis, easingFunction, isAnimatingIn) {
    animateStrokeWithDelay(strokePathId, durationMillis, 0, easingFunction, isAnimatingIn);
  }

  function animateTrimPathEndWithDelay(strokePathId, durationMillis, startDelayMillis, easingFunction, isAnimatingIn) {
    var strokePath = document.getElementById(strokePathId);
    var pathLength = strokePath.getTotalLength();
    // TODO(alockwood): remove this hack...
    strokePath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? pathLength : 0),
      offset: 0
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? pathLength : 0),
      offset: 1
    }], {
      duration: 0,
      fill: "forwards"
    });
    strokePath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? pathLength : 0),
      easing: easingFunction,
      offset: 0
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : pathLength),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards",
      delay: startDelayMillis
    });
  }

  document.querySelector("input[id=trimPathShowTrimPathsCheckbox]").addEventListener("change", function(event) {
    var visibility = document.querySelector("input[id=trimPathShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
    document.getElementById("stem_debug").style.visibility = visibility;
    document.getElementById("search_circle_debug").style.visibility = visibility;
    document.getElementById("arrow_head_top_debug").style.visibility = visibility;
    document.getElementById("arrow_head_bottom_debug").style.visibility = visibility;
    document.getElementById("andro_debug").style.visibility = visibility;
    document.getElementById("id_debug").style.visibility = visibility;
    document.getElementById("a_debug").style.visibility = visibility;
    document.getElementById("i1_dot_debug").style.visibility = visibility;
    document.getElementById("ridge_5_path_debug").style.visibility = visibility;
    document.getElementById("ridge_7_path_debug").style.visibility = visibility;
    document.getElementById("ridge_6_path_debug").style.visibility = visibility;
    document.getElementById("ridge_2_path_debug").style.visibility = visibility;
    document.getElementById("ridge_1_path_debug").style.visibility = visibility;
  });

  // =============== Search to back animation.
  var isBackArrow = false;
  document.getElementById("ic_search_back").addEventListener("click", function() {
    animateArrowHead(!isBackArrow);
    animateSearchCircle(isBackArrow);
    animateStem(!isBackArrow);
    isBackArrow = !isBackArrow;
  });

  function animateStem(isAnimatingToBack) {
    var stemPath = document.getElementById("stem");
    var pathLength = stemPath.getTotalLength();
    var searchDashArray = (0.185 * pathLength) + "," + (0.815 * pathLength);
    var arrowDashArray = (0.25 * pathLength) + "," + (0.75 * pathLength);
    stemPath.animate([{
      "strokeDasharray": (isAnimatingToBack ? searchDashArray : arrowDashArray),
      easing: fastOutSlowIn,
      offset: 0
    }, {
      "strokeDasharray": (isAnimatingToBack ? arrowDashArray : searchDashArray),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(600),
      fill: "forwards"
    });
    stemPath.animate([{
      "strokeDashoffset": (isAnimatingToBack ? 0 : -0.75 * pathLength),
      easing: fastOutSlowIn,
      offset: 0
    }, {
      "strokeDashoffset": (isAnimatingToBack ? -0.75 * pathLength : 0),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(450),
      fill: "forwards"
    });
  }

  function animateSearchCircle(isAnimatingIn) {
    var searchCirclePath = document.getElementById("search_circle");
    var pathLength = searchCirclePath.getTotalLength();
    searchCirclePath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? pathLength : 0),
      easing: fastOutSlowIn,
      offset: 0
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : pathLength),
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
      "transform": (isAnimatingIn ? "translate(8px,0px)" : "translate(0px,0px)"),
      easing: (isAnimatingIn ? linearOutSlowIn : fastOutLinearIn),
      offset: 0
    }, {
      "transform": (isAnimatingIn ? "translate(0px,0px)" : "translate(24px,0px)"),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
    });
    arrowHeadTop.animate([{
      "strokeDasharray": arrowHeadTopPathLength,
      "strokeDashoffset": (isAnimatingIn ? arrowHeadTopPathLength : 0),
      easing: fastOutSlowIn,
      offset: 0
    }, {
      "strokeDasharray": arrowHeadTopPathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : arrowHeadTopPathLength),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
    });
    arrowHeadBottom.animate([{
      "strokeDasharray": arrowHeadBottomPathLength,
      "strokeDashoffset": (isAnimatingIn ? arrowHeadBottomPathLength : 0),
      easing: fastOutSlowIn,
      offset: 0
    }, {
      "strokeDasharray": arrowHeadBottomPathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : arrowHeadBottomPathLength),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(250),
      fill: "forwards",
      delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
    });
  }

  // =============== Handwriting animation.
  var currentHandwritingAnimations = [];
  document.getElementById("ic_android_handwriting").addEventListener("click", function() {
     for (i = 0; i < currentHandwritingAnimations.length; i++) {
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
    for (i = 0; i < ids.length; i++) {
      var path = document.getElementById(ids[i]);
      var pathLength = path.getTotalLength();
      currentHandwritingAnimations.push(path.animate([{
        "strokeDasharray": pathLength,
        "strokeDashoffset": pathLength,
        offset: 0,
      }, {
        "strokeDasharray": pathLength,
        "strokeDashoffset": pathLength,
        offset: 1
      }], {
        duration: 0,
        fill: "forwards"
      }));
    }
  }

  function animateHandwritingStroke(pathId, duration, startDelay, easingCurve) {
    var path = document.getElementById(pathId);
    var pathLength = path.getTotalLength();
    path.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": pathLength,
      easing: easingCurve,
      offset: 0,
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": 0,
      offset: 1
    }], {
      duration: getScaledAnimationDuration(duration),
      fill: "forwards",
      delay: getScaledAnimationDuration(startDelay)
    });
  }

  // =============== Fingerprint animation.
  var isFingerprintVisible = true;
  document.getElementById("ic_fingerprint").addEventListener("click", function() {
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
});
