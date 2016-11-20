document.addEventListener("DOMContentLoaded", function(event) {
  function getCheckbox(checkboxId) {
    return document.querySelector("input[id=" + checkboxId + "]");
  }

  var playScale = getCheckbox("playTransformScaleCheckbox");
  var playRotation = getCheckbox("playTransformRotationCheckbox");
  var playTranslation = getCheckbox("playTransformTranslationCheckbox");
  var pauseScale = getCheckbox("pauseTransformScaleCheckbox");
  var pauseRotation = getCheckbox("pauseTransformRotationCheckbox");
  var pauseTranslation = getCheckbox("pauseTransformTranslationCheckbox");
  var recordScale = getCheckbox("recordTransformScaleCheckbox");
  var recordRotation = getCheckbox("recordTransformRotationCheckbox");
  var recordTranslation = getCheckbox("recordTransformTranslationCheckbox");

  playScale.addEventListener("change", function(event) {
    updateGroupTransform("play", "scale", playScale.checked);
  });
  playRotation.addEventListener("change", function(event) {
    updateGroupTransform("play", "rotation", playRotation.checked);
  });
  playTranslation.addEventListener("change", function(event) {
    updateGroupTransform("play", "translation", playTranslation.checked);
  });
  pauseScale.addEventListener("change", function(event) {
    updateGroupTransform("pause", "scale", pauseScale.checked);
  });
  pauseRotation.addEventListener("change", function(event) {
    updateGroupTransform("pause", "rotation", pauseRotation.checked);
  });
  pauseTranslation.addEventListener("change", function(event) {
    updateGroupTransform("pause", "translation", pauseTranslation.checked);
  });
  recordScale.addEventListener("change", function(event) {
    updateGroupTransform("record", "scale", recordScale.checked);
  });
  recordRotation.addEventListener("change", function(event) {
    updateGroupTransform("record", "rotation", recordRotation.checked);
  });
  recordTranslation.addEventListener("change", function(event) {
    updateGroupTransform("record", "translation", recordTranslation.checked);
  });

  function updateGroupTransform(iconType, transformType, shouldEnable) {
    var group = document.getElementById("transform_paths_" + iconType + "_" + transformType);
    var currentTransformValue;
    var nextTransformValue;
    if (transformType === "translation") {
      currentTransformValue = shouldEnable ? "translate(0px,0px)" : "translate(40px,0px)";
      nextTransformValue = shouldEnable ? "translate(40px,0px)" : "translate(0px,0px)";
    } else if (transformType === "scale") {
      currentTransformValue = shouldEnable ? "scale(1,1)" : "scale(1.5,1)";
      nextTransformValue = shouldEnable ? "scale(1.5,1)" : "scale(1,1)";
    } else {
      currentTransformValue = shouldEnable ? "rotate(0deg)" : "rotate(90deg)";
      nextTransformValue = shouldEnable ? "rotate(90deg)" : "rotate(0deg)";
    }
    group.animate([{
      "transform": currentTransformValue,
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": nextTransformValue,
      offset: 1
    }], {
      duration: 300,
      fill: "forwards"
    });
  }
});
