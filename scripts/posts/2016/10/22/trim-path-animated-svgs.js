document.addEventListener("DOMContentLoaded", function(event) {
  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
  var fastOutLinearIn = "cubic-bezier(0.4, 0, 1, 1)";
  var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

  function getScaledAnimationDuration(durationMillis) {
    var slowAnimationSelector = document.querySelector("input[id=trimPathSlowAnimationCheckbox]");
    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
    return durationMillis * currentAnimationDurationFactor;
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
    document.getElementById("d_debug").style.visibility = visibility;
    document.getElementById("esig_debug").style.visibility = visibility;
    document.getElementById("n_debug").style.visibility = visibility;
    document.getElementById("i2_dot_debug").style.visibility = visibility;
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
  document.getElementById("ic_android_design").addEventListener("click", function() {
     for (i = 0; i < currentHandwritingAnimations.length; i++) {
      currentHandwritingAnimations[i].cancel();
    }
    currentHandwritingAnimations = [];
    resetAllStrokes();
    animateStroke("andro", 1000, 0, fastOutLinearIn);
    animateStroke("id", 250, 1050, fastOutSlowIn);
    animateStroke("a", 50, 1300, fastOutSlowIn);
    animateStroke("i1_dot", 50, 1400, fastOutSlowIn);
    animateStroke("d", 200, 1550, fastOutSlowIn);
    animateStroke("esig", 600, 1800, fastOutLinearIn);
    animateStroke("n", 200, 2450, fastOutSlowIn);
    animateStroke("i2_dot", 50, 2700, fastOutSlowIn);
  });

  function resetAllStrokes() {
    var ids = ["andro", "id", "a", "i1_dot", "d", "esig", "n", "i2_dot"];
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

  function animateStroke(pathId, duration, startDelay, easingCurve) {
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
});

