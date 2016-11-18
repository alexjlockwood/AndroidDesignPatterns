document.addEventListener("DOMContentLoaded", function(event) {

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

  var outerRotationAnimation = createRotationAnimation();
  var trimPathOffsetAnimation = createTrimPathOffsetAnimation();
  var trimPathStartEndAnimation = createTrimPathStartEndAnimation();

  document.querySelector("input[id=circularProgressOuterRotationCheckbox]").addEventListener("change", function(event) {
    if (document.querySelector("input[id=circularProgressOuterRotationCheckbox]").checked) {
      outerRotationAnimation.play();
    } else {
      outerRotationAnimation.pause();
    }
  });
  document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]").addEventListener("change", function(event) {
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
  document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]").addEventListener("change", function(event) {
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
  document.querySelector("input[id=circularProgressShowTrimPathsCheckbox]").addEventListener("change", function(event) {
    var visibility = document.querySelector("input[id=circularProgressShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
    document.getElementById("circular_progress_circle_path_debug").style.visibility = visibility;
  });
  document.querySelector("input[id=circularProgressSlowAnimationCheckbox]").addEventListener("change", function(event) {
    outerRotationAnimation.cancel();
    trimPathOffsetAnimation.cancel();
    trimPathStartEndAnimation.cancel();
    outerRotationAnimation = createRotationAnimation();
    trimPathOffsetAnimation = createTrimPathOffsetAnimation();
    trimPathStartEndAnimation = createTrimPathStartEndAnimation();
  });

  function createRotationAnimation() {
    return circular_progress_outer_rotation.animate([{
      "transform": "rotate(0deg)",
      offset: 0.0,
      easing: 'linear'
    }, {
      "transform": "rotate(720deg)",
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(4444),
      fill: "forwards",
      iterations: "Infinity"
    });
  }

  function createTrimPathOffsetAnimation() {
    return circular_progress_inner_rotation.animate([{
      "transform": "rotate(0deg)",
      offset: 0.0,
      easing: 'linear'
    }, {
      "transform": "rotate(90deg)",
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(1333),
      fill: "forwards",
      iterations: "Infinity"
    });
  }

  function createTrimPathStartEndAnimation() {
    var fastOutSlowInFunction = BezierEasing(0.4, 0, 0.2, 1);
    var trimPathEndFunction = function(t) {
      if (t <= 0.5) {
        return fastOutSlowInFunction(t * 2) * 0.96;
      } else {
        return 0.08 * t + 0.92;
      }
    };
    var pathLength = circle_path.getTotalLength();
    var keyFrames = [];
    for (i = 0; i < 1344; i += 16) {
      var trimPathStart = 0;
      if (i >= 672) {
        trimPathStart = fastOutSlowInFunction(((i - 672) / 672)) * 0.75;
      }
      var trimPathEnd = trimPathEndFunction(i / 1344) * 0.75 + 0.03;
      var trimPathLength = trimPathEnd - trimPathStart;
      keyFrames.push({
        "strokeDasharray": (trimPathLength * pathLength) + "," + (1 - trimPathLength) * pathLength,
        "strokeDashoffset": (-trimPathStart * pathLength),
        easing: "linear",
        offset: (i / 1344)
      });
    }
    keyFrames.push({
      "strokeDasharray": (0.03 * pathLength) + "," + pathLength,
      "strokeDashoffset": (-0.75 * pathLength),
      offset: 1
    });
    return circle_path.animate(keyFrames, {
      duration: getScaledAnimationDuration(1333),
      fill: "forwards",
      iterations: "Infinity"
    });
  }
});