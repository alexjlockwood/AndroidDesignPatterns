document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var currentIconIndex = 0;

  var ICON_PATHS = [
    "M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5",
    "M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5",
    "M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5"
  ];
  var ICON_TRANSLATE_X = [0.75, 0, 0];

  var playButton = document.querySelector("button[id=play_button]");
  var pauseButton = document.querySelector("button[id=pause_button]");
  var stopButton = document.querySelector("button[id=stop_button]");
  playButton.addEventListener("click", function() {
    //playButton.MaterialButton.disable();
    //pauseButton.MaterialButton.enable();
    //stopButton.MaterialButton.enable();
    animateIconStateChange(currentIconIndex, 0);
    currentIconIndex = 0;
  });
  pauseButton.addEventListener("click", function() {
    //playButton.MaterialButton.enable();
    //pauseButton.MaterialButton.disable();
    //stopButton.MaterialButton.enable();
    animateIconStateChange(currentIconIndex, 1);
    currentIconIndex = 1;
  });
  stopButton.addEventListener("click", function() {
    //playButton.MaterialButton.enable();
    //pauseButton.MaterialButton.enable();
    //stopButton.MaterialButton.disable();
    animateIconStateChange(currentIconIndex, 2);
    currentIconIndex = 2;
  });
  var animateRotationSelector = document.querySelector("input[id=playPauseStopAnimateRotationCheckbox]");
  animateRotationSelector.addEventListener("change", function(event) {
    var currentRotation = animateRotationSelector.checked && currentIconIndex == 0 ? 90 : 0;
    document.getElementById("button_rotate").animate([{
      "transform": "rotate(" + currentRotation + "deg)",
      offset: 0,
    }, {
      "transform": "rotate(" + currentRotation + "deg)",
      offset: 1,
    }], {
      duration: 0,
      fill: "forwards"
    });
  });
  var slowAnimationSelector = document.querySelector("input[id=playPauseStopSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });

  function animateIconStateChange(oldIconIndex, newIconIndex) {
    var animationDuration = 200 * currentAnimationDurationFactor;
    var iconStateChangeAnimation = document.getElementById("icon_state_change_animation");
    iconStateChangeAnimation.setAttributeNS(null, "dur", animationDuration + "ms");
    iconStateChangeAnimation.setAttributeNS(null, "values", ICON_PATHS[oldIconIndex] + ";" + ICON_PATHS[newIconIndex]);
    iconStateChangeAnimation.beginElement();
    document.getElementById("button_translateX").animate([{
      "transform": "translate(" + ICON_TRANSLATE_X[oldIconIndex] + "px,0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
    }, {
      "transform": "translate(" + ICON_TRANSLATE_X[newIconIndex] + "px,0px)",
      offset: 1,
    }], {
      duration: animationDuration,
      fill: "forwards"
    });
    if (document.querySelector("input[id=playPauseStopAnimateRotationCheckbox]").checked) {
      var startingRotation = 0;
      if (oldIconIndex == 0) {
        startingRotation = 90;
      } else if (oldIconIndex == 1) {
        startingRotation = 0;
      } else if (newIconIndex == 0) {
        startingRotation = 0;
      } else if (newIconIndex == 1) {
        startingRotation = 90;
      }
      document.getElementById("button_rotate").animate([{
        "transform": "rotate(" + startingRotation + "deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1.0)"
      }, {
        "transform": "rotate(" + (startingRotation + 90) + "deg)",
        offset: 1,
      }], {
        duration: animationDuration,
        fill: "forwards"
      });
    }
  }
});

