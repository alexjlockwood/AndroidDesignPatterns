document.addEventListener("DOMContentLoaded", function(event) {
  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
  var fastOutLinearIn = "cubic-bezier(0.4, 0, 1, 1)";
  var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

  function getScaledAnimationDuration(durationMillis) {
    var slowAnimationSelector = document.querySelector("input[id=uploadingSlowAnimationCheckbox]");
    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
    return durationMillis * currentAnimationDurationFactor;
  }

  document.querySelector("input[id=uploadingShowTrimPathsCheckbox]").addEventListener("change", function(event) {
    var visibility = document.querySelector("input[id=uploadingShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
    document.getElementById("progress_tick_debug").style.visibility = visibility;
    document.getElementById("progress_spinner_circle_path_debug").style.visibility = visibility;
  });

  function shouldShowDebugClipMasks() {
    return document.querySelector("input[id=uploadingShowClipMaskCheckbox]").checked;
  }

  document.querySelector("input[id=uploadingShowClipMaskCheckbox]").addEventListener("change", function(event) {
    var visibility = shouldShowDebugClipMasks() ? "visible" : "hidden";
    document.getElementById("upload_arrow_fill_clip_debug").style.visibility = visibility;
  });

  var isComplete = false;
  var progressSpinnerOuterRotation = document.getElementById("progress_spinner_outer_rotation");
  var progressSpinnerInnerRotation = document.getElementById("progress_spinner_inner_rotation");
  var progressSpinnerPath = document.getElementById("progress_spinner_circle_path");
  var uploadArrowEmptyPath = document.getElementById("upload_arrow_static");
  var uploadArrowFillPath = document.getElementById("upload_arrow_filling");
  var uploadBasePath = document.getElementById("upload_base");
  var progressTickPath = document.getElementById("progress_tick");

  var currentAnimations = [];
  var arrowFillAnimation;
  var arrowFillClipMaskAnimation;

  var lastKnownTimeMillis = 0;
  var isCompleteAnimationPending = false;
  document.getElementById("ic_uploading").addEventListener("click", function() {
    if (isCompleteAnimationPending) {
      return;
    }
    if (isComplete) {
      var scaledDuration = getScaledAnimationDuration(2666);
      var elapsedTimeMillis = new Date().getTime() - lastKnownTimeMillis;
      var delayTime = scaledDuration - (elapsedTimeMillis % scaledDuration);
      isCompleteAnimationPending = true;
      setTimeout(function() {
        isCompleteAnimationPending = false;
        cancelAnimations();
        startCompleteAnimation();
      }, delayTime);
    } else {
      cancelAnimations();
      if (lastKnownTimeMillis != 0) {
        createFadeStrokeAnimation(progressTickPath, 500, 1, 0);
        createFadeStrokeAnimation(progressSpinnerPath, 500, 0, 1);
        createFadeFillAnimation(uploadBasePath, 500, 0, 1);
        createFadeFillAnimation(uploadArrowEmptyPath, 500, 0, 1);
        createFadeFillAnimation(uploadArrowFillPath, 500, 0, 1);
      }
      currentAnimations.push(createRotationAnimation());
      currentAnimations.push(createTrimPathOffsetAnimation());
      currentAnimations.push(createTrimPathStartEndAnimation());
      arrowFillAnimation = createArrowFillAnimation();
      if (shouldShowDebugClipMasks()) {
        arrowFillClipMaskAnimation = createArrowFillClipMaskAnimation();
      }
      lastKnownTimeMillis = new Date().getTime();
    }
    isComplete = !isComplete;
  });

  function startCompleteAnimation() {
    arrowFillAnimation.endElement();
    if (arrowFillClipMaskAnimation) {
      arrowFillClipMaskAnimation.endElement();
    }
    createCompleteAnimation();
    createStrokeWidthAnimation(progressTickPath, 0, 0, 4, 4);
    createStrokeWidthAnimation(progressTickPath, 500, 800, 4, 2);
    createFadeFillAnimation(uploadBasePath, 500, 1, 0);
    createFadeFillAnimation(uploadArrowEmptyPath, 500, 1, 0);
    createFadeFillAnimation(uploadArrowFillPath, 500, 1, 0);
    createFadeStrokeAnimation(progressTickPath, 0, 1, 1);
    createFadeStrokeAnimation(progressSpinnerPath, 0, 0, 0);
  }

  function cancelAnimations() {
    for (i = 0; i < currentAnimations.length; i++) {
      currentAnimations[i].cancel();
    }
    currentAnimations = [];
  }

  function createStrokeWidthAnimation(path, durationMillis, startDelayMillis, startWidth, endWidth) {
    return path.animate([{
      "strokeWidth": startWidth,
      offset: 0.0,
      easing: linearOutSlowIn
    }, {
      "strokeWidth": endWidth,
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards",
      delay: getScaledAnimationDuration(startDelayMillis)
    });
  }

  function createFadeFillAnimation(path, durationMillis, startOpacity, endOpacity) {
    return path.animate([{
      "fillOpacity": startOpacity,
      offset: 0.0,
      easing: fastOutSlowIn
    }, {
      "fillOpacity": endOpacity,
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards"
    });
  }

  function createFadeStrokeAnimation(path, durationMillis, startOpacity, endOpacity) {
    return path.animate([{
      "strokeOpacity": startOpacity,
      offset: 0.0,
      easing: fastOutSlowIn
    }, {
      "strokeOpacity": endOpacity,
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards"
    });
  }

  function createCompleteAnimation() {
    var fastOutSlowInFunction = BezierEasing(0, 0, 0.2, 1);
    var strokePath = document.getElementById("progress_tick");
    var pathLength = strokePath.getTotalLength();
    var keyFrames = [];
    for (i = 0; i <= 1024; i += 16) {
      var trimPathStart = 0;
      var trimPathEnd = fastOutSlowInFunction(i / 1024);
      if (i >= 400) {
        trimPathStart = fastOutSlowInFunction((i - 400) / 624) * 0.89;
      }
      keyFrames.push({
        "strokeDasharray": ((trimPathEnd - trimPathStart) * pathLength) + "," + pathLength,
        "strokeDashoffset": (-trimPathStart * pathLength),
        easing: "linear",
        offset: (i / 1024)
      });
    }
    return strokePath.animate(keyFrames, {
      duration: getScaledAnimationDuration(1024),
      fill: "forwards"
    });
  }

  function createArrowFillAnimation() {
    var duration = getScaledAnimationDuration(1200);
    var startDelay = getScaledAnimationDuration(300);
    var animation = document.getElementById("upload_arrow_fill_clip_animation");
    animation.setAttributeNS(null, 'dur', duration + 'ms');
    animation.setAttributeNS(null, 'begin', startDelay + 'ms');
    animation.beginElement();
    return animation;
  }

  function createArrowFillClipMaskAnimation() {
    var duration = getScaledAnimationDuration(1200);
    var startDelay = getScaledAnimationDuration(300);
    var animation = document.getElementById("upload_arrow_fill_clip_animation_debug");
    animation.setAttributeNS(null, 'dur', duration + 'ms');
    animation.setAttributeNS(null, 'begin', startDelay + 'ms');
    animation.beginElement();
    return arrowFillAnimation;
  }

  function createRotationAnimation() {
    return progressSpinnerOuterRotation.animate([{
      "transform": "rotate(0deg)",
      offset: 0.0,
      easing: 'linear'
    }, {
      "transform": "rotate(720deg)",
      offset: 1.0
    }], {
      duration: getScaledAnimationDuration(5332),
      fill: "forwards",
      iterations: "Infinity"
    });
  }

  function createTrimPathOffsetAnimation() {
    return progressSpinnerInnerRotation.animate([{
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
    var pathLength = progressSpinnerPath.getTotalLength();
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
    return progressSpinnerPath.animate(keyFrames, {
      duration: getScaledAnimationDuration(1333),
      fill: "forwards",
      iterations: "Infinity"
    });
  }
});
