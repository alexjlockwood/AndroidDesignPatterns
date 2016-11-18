document.addEventListener("DOMContentLoaded", function(event) {
  var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1.0)";

  function getScaledAnimationDuration(durationMillis) {
    var slowAnimationSelector = document.querySelector("input[id=basicTransformationSlowAnimationCheckbox]");
    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
    return durationMillis * currentAnimationDurationFactor;
  }

  function animateTransform(elementId, durationMillis, transformType, fromValue, toValue, easingFunction) {
    document.getElementById(elementId).animate([{
      "transform": transformType + "(" + fromValue + ")",
      offset: 0,
      easing: easingFunction
    }, {
      "transform": transformType + "(" + toValue + ")",
      offset: 1,
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards"
    });
  }

  // =============== Chevron icon.
  var isExpanded = false;
  document.getElementById("ic_expand_collapse").addEventListener("click", function() {
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
  var isChecked = false;
  document.getElementById("ic_radiobutton").addEventListener("click", function() {
    if (isChecked) {
      animateToUncheck();
    } else {
      animateToCheck();
    }
    isChecked = !isChecked;
  });

  function animateToCheck() {
    document.getElementById("radiobutton_ring_outer").animate([{
      "transform": "scale(1,1)",
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(0.5,0.5)",
      offset: 0.3333,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(0.9,0.9)",
      offset: 0.364,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(1,1)",
      offset: 1,
    }], {
      duration: getScaledAnimationDuration(500),
      fill: "forwards"
    });
    document.getElementById("radiobutton_ring_outer_path").animate([{
      "strokeWidth": "2",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.4, 1.0)"
    }, {
      "strokeWidth": "18",
      offset: 0.3333,
      easing: fastOutSlowIn
    }, {
      "strokeWidth": "2",
      offset: 0.364,
      easing: fastOutSlowIn
    }, {
      "strokeWidth": "2",
      offset: 1,
    }], {
      duration: getScaledAnimationDuration(500),
      fill: "forwards"
    });
    document.getElementById("radiobutton_dot_group").animate([{
      "transform": "scale(0,0)",
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(0,0)",
      offset: 0.3333,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(1.5,1.5)",
      offset: 0.364,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(1,1)",
      offset: 1,
    }], {
      duration: getScaledAnimationDuration(500),
      fill: "forwards"
    });
  }

  function animateToUncheck() {
    document.getElementById("radiobutton_ring_outer").animate([{
      "transform": "scale(1,1)",
      offset: 0,
      easing: fastOutSlowIn
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
      duration: getScaledAnimationDuration(500),
      fill: "forwards"
    });
    document.getElementById("radiobutton_ring_outer_path").animate([{
      "strokeWidth": "2",
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "strokeWidth": "2",
      offset: 0.366,
      easing: fastOutSlowIn
    }, {
      "strokeWidth": "18",
      offset: 0.4,
      easing: fastOutSlowIn
    }, {
      "strokeWidth": "2",
      offset: 1,
    }], {
      duration: getScaledAnimationDuration(500),
      fill: "forwards"
    });
    document.getElementById("radiobutton_dot_group").animate([{
      "transform": "scale(1,1)",
      offset: 0,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(1.4,1.4)",
      offset: 0.366,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(0,0)",
      offset: 0.4,
      easing: fastOutSlowIn
    }, {
      "transform": "scale(0,0)",
      offset: 1,
    }], {
      duration: getScaledAnimationDuration(500),
      fill: "forwards"
    });
  }

  // =============== Alarm clock icon.
  document.getElementById("ic_alarm").addEventListener("click", function() {
    animateAlarmClock();
  });

  function createKeyFrame(rotationDegrees, keyFrameOffset) {
    return {
      "transform": "rotate(" + rotationDegrees + "deg)",
      offset: keyFrameOffset,
      easing: fastOutSlowIn
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
    document.getElementById("alarmclock_button_rotation").animate(keyFrames, {
      duration: getScaledAnimationDuration(1333),
      fill: "forwards"
    });
  }
});
