document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isBackArrow = false;

  var slowAnimationSelector = document.querySelector("input[id=trimPathSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_search_back").addEventListener("click", function() {
    toggleAnimation();
  });

  function animateStem(isAnimatingToBack) {
    var stemPath = document.getElementById("stem");
    var pathLength = stemPath.getTotalLength();
    var searchDashArray = (0.185 * pathLength) + "," + (0.815 * pathLength);
    var arrowDashArray = (0.25 * pathLength) + "," + (0.75 * pathLength);
    stemPath.animate([{
      "strokeDasharray": (isAnimatingToBack ? searchDashArray : arrowDashArray),
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      offset: 0
    }, {
      "strokeDasharray": (isAnimatingToBack ? arrowDashArray : searchDashArray),
      offset: 1
    }], {
      duration: 600 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    stemPath.animate([{
      "strokeDashoffset": (isAnimatingToBack ? 0 : -0.75 * pathLength),
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      offset: 0
    }, {
      "strokeDashoffset": (isAnimatingToBack ? -0.75 * pathLength : 0),
      offset: 1
    }], {
      duration: 450 * currentAnimationDurationFactor,
      fill: "forwards"
    });
  }

  function animateSearchCircle(isAnimatingIn) {
    var searchCirclePath = document.getElementById("search_circle");
    var pathLength = searchCirclePath.getTotalLength();
    searchCirclePath.animate([{
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? pathLength : 0),
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      offset: 0
    }, {
      "strokeDasharray": pathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : pathLength),
      offset: 1
    }], {
      duration: 250 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: (isAnimatingIn ? 300 * currentAnimationDurationFactor : 0)
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
      easing: (isAnimatingIn ? "cubic-bezier(0, 0, 0.2, 1)" : "cubic-bezier(0.4, 0, 1, 1)"),
      offset: 0
    }, {
      "transform": (isAnimatingIn ? "translate(0px,0px)" : "translate(24px,0px)"),
      offset: 1
    }], {
      duration: 250 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: ((isAnimatingIn ? 350 : 0) * currentAnimationDurationFactor)
    });
    arrowHeadTop.animate([{
      "strokeDasharray": arrowHeadTopPathLength,
      "strokeDashoffset": (isAnimatingIn ? arrowHeadTopPathLength : 0),
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      offset: 0
    }, {
      "strokeDasharray": arrowHeadTopPathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : arrowHeadTopPathLength),
      offset: 1
    }], {
      duration: 250 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: ((isAnimatingIn ? 350 : 0) * currentAnimationDurationFactor)
    });
    arrowHeadBottom.animate([{
      "strokeDasharray": arrowHeadBottomPathLength,
      "strokeDashoffset": (isAnimatingIn ? arrowHeadBottomPathLength : 0),
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      offset: 0
    }, {
      "strokeDasharray": arrowHeadBottomPathLength,
      "strokeDashoffset": (isAnimatingIn ? 0 : arrowHeadBottomPathLength),
      offset: 1
    }], {
      duration: 250 * currentAnimationDurationFactor,
      fill: "forwards",
      delay: ((isAnimatingIn ? 350 : 0) * currentAnimationDurationFactor)
    });
  }

  function toggleAnimation() {
    animateArrowHead(!isBackArrow);
    animateSearchCircle(isBackArrow);
    animateStem(!isBackArrow);
    isBackArrow = !isBackArrow;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var currentAnimations = [];

  var slowAnimationSelector = document.querySelector("input[id=trimPathSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_android_design").addEventListener("click", function() {
    beginAnimation();
  });

  function resetAllStrokes() {
    var ids = ["andro", "id", "a", "i1_dot", "d", "esig", "n", "i2_dot"];
    for (i = 0; i < ids.length; i++) {
      var path = document.getElementById(ids[i]);
      var pathLength = path.getTotalLength();
      currentAnimations.push(path.animate([{
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
      duration: duration * currentAnimationDurationFactor,
      fill: "forwards",
      delay: startDelay * currentAnimationDurationFactor
    });
  }

  function beginAnimation() {
    for (i = 0; i < currentAnimations.length; i++) {
      currentAnimations[i].cancel();
    }
    currentAnimations = [];
    resetAllStrokes();
    var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
    var fastOutLinearIn = "cubic-bezier(0.4, 0, 1, 1)";
    animateStroke("andro", 1000, 0, fastOutLinearIn);
    animateStroke("id", 250, 1050, fastOutSlowIn);
    animateStroke("a", 50, 1300, fastOutSlowIn);
    animateStroke("i1_dot", 50, 1400, fastOutSlowIn);
    animateStroke("d", 200, 1550, fastOutSlowIn);
    animateStroke("esig", 600, 1800, fastOutLinearIn);
    animateStroke("n", 200, 2450, fastOutSlowIn);
    animateStroke("i2_dot", 50, 2700, fastOutSlowIn);
  }
});

