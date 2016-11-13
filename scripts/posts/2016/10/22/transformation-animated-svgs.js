document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationFactor = 1;
  var isExpanded = false;

  var slowAnimationSelector = document.querySelector("input[id=basicTransformationSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_expand_collapse").addEventListener("click", function() {
    toggleAnimation();
  });

  function animateToExpanded() {
    document.getElementById("chevron").animate([{
      "transform": "translate(12px,15px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "translate(12px,9px)",
      offset: 1,
    }], {
      duration: 250 * currentAnimationFactor,
      fill: "forwards"
    });
    document.getElementById("leftBar").animate([{
      "transform": "rotate(135deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "rotate(45deg)",
      offset: 1,
    }], {
      duration: 200 * currentAnimationFactor,
      fill: "forwards"
    });
    document.getElementById("rightBar").animate([{
      "transform": "rotate(45deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "rotate(135deg)",
      offset: 1,
    }], {
      duration: 200 * currentAnimationFactor,
      fill: "forwards"
    });
  }

  function animateToCollapsed() {
    document.getElementById("chevron").animate([{
      "transform": "translate(12px,9px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "translate(12px,15px)",
      offset: 1,
    }], {
      duration: 250 * currentAnimationFactor,
      fill: "forwards"
    });
    document.getElementById("leftBar").animate([{
      "transform": "rotate(45deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "rotate(135deg)",
      offset: 1,
    }], {
      duration: 200 * currentAnimationFactor,
      fill: "forwards"
    });
    document.getElementById("rightBar").animate([{
      "transform": "rotate(135deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "rotate(45deg)",
      offset: 1,
    }], {
      duration: 200 * currentAnimationFactor,
      fill: "forwards"
    });
  }

  function toggleAnimation() {
    if (isExpanded) {
      animateToCollapsed();
    } else {
      animateToExpanded();
    }
    isExpanded = !isExpanded;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentRadioButtonDuration = 500;
  var isChecked = false;

  var slowAnimationSelector = document.querySelector("input[id=basicTransformationSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentRadioButtonDuration *= slowAnimationSelector.checked ? 5 : 0.2;
  });
  document.getElementById("ic_radiobutton").addEventListener("click", function() {
    toggleAnimation();
  });

  function animateToCheck() {
    document.getElementById("ring_outer").animate([{
      "transform": "scale(1,1)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(0.5,0.5)",
      offset: 0.33333333,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(0.9,0.9)",
      offset: 0.364,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(1,1)",
      offset: 1,
    }], {
      duration: currentRadioButtonDuration,
      fill: "forwards"
    });
    document.getElementById("ring_outer_path").animate([{
      "strokeWidth": "2",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.4, 1.0)"
    }, {
      "strokeWidth": "18",
      offset: 0.33333333,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "strokeWidth": "2",
      offset: 0.364,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "strokeWidth": "2",
      offset: 1,
    }], {
      duration: currentRadioButtonDuration,
      fill: "forwards"
    });
    document.getElementById("dot_group").animate([{
      "transform": "scale(0,0)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(0,0)",
      offset: 0.33333333,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(1.5,1.5)",
      offset: 0.364,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(1,1)",
      offset: 1,
    }], {
      duration: currentRadioButtonDuration,
      fill: "forwards"
    });
  }

  function animateToUncheck() {
    document.getElementById("ring_outer").animate([{
      "transform": "scale(1,1)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(0.9,0.9)",
      offset: 0.366,
      easing: "cubic-bezier(0.4, 0, 0.4, 1.0)"
    }, {
      "transform": "scale(0.5,0.5)",
      offset: 0.4,
      easing: "cubic-bezier(0.4, 0, 0.4, 1.0)"
    }, {
      "transform": "scale(1,1)",
      offset: 1,
    }], {
      duration: currentRadioButtonDuration,
      fill: "forwards"
    });
    document.getElementById("ring_outer_path").animate([{
      "strokeWidth": "2",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "strokeWidth": "2",
      offset: 0.366,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "strokeWidth": "18",
      offset: 0.4,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "strokeWidth": "2",
      offset: 1,
    }], {
      duration: currentRadioButtonDuration,
      fill: "forwards"
    });
    document.getElementById("dot_group").animate([{
      "transform": "scale(1,1)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(1.4,1.4)",
      offset: 0.366,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(0,0)",
      offset: 0.4,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "scale(0,0)",
      offset: 1,
    }], {
      duration: currentRadioButtonDuration,
      fill: "forwards"
    });
  }

  function toggleAnimation() {
    if (isChecked) {
      animateToUncheck();
    } else {
      animateToCheck();
    }
    isChecked = !isChecked;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;

  var slowAnimationSelector = document.querySelector("input[id=basicTransformationSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_alarm").addEventListener("click", function() {
    animateAlarmClock();
  });

  function createKeyFrame(rotationDegrees, keyFrameOffset) {
    return {
      "transform": "rotate(" + rotationDegrees + "deg)",
      offset: keyFrameOffset,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    };
  }

  function animateAlarmClock() {
    var keyFrames = [];
    for (i = 0; i < 22; i++) {
      if (i == 0) {
        keyFrames.push(createKeyFrame(0, 0));
      } else if (i < 21) {
        var rotation = i % 2 == 0 ? -8 : 8;
        keyFrames.push(createKeyFrame(rotation, 0.025 + ((i - 1) * 0.05)));
      } else {
        keyFrames.push({
          "transform": "rotate(0deg)",
          offset: 1.0
        });
      }
    }
    document.getElementById("button_rotation").animate(keyFrames, {
      duration: 1333 * currentAnimationDurationFactor,
      fill: "forwards"
    });
  }
});

