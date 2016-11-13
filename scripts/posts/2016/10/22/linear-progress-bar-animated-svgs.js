document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDuration = 2000;

  function createOuterRect1Animation() {
    return document.getElementById('progressBarOuterRect1').animate([{
      transform: 'translateX(-522.59998px)',
      offset: 0,
      easing: 'linear'
    }, {
      transform: 'translateX(-522.59998px)',
      offset: 0.2,
      easing: 'cubic-bezier(0.5, 0, 0.701732, 0.495818703)'
    }, {
      transform: 'translateX(-185.382686832px)',
      offset: 0.5915,
      easing: 'cubic-bezier(0.302435, 0.38135197, 0.55, 0.956352125)'
    }, {
      transform: 'translateX(235.600006104px)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  function createInnerRect1Animation() {
    return document.getElementById('progressBarInnerRect1').animate([{
      transform: 'scaleX(0.1)',
      offset: 0,
      easing: 'linear'
    }, {
      transform: 'scaleX(0.1)',
      offset: 0.3665,
      easing: 'cubic-bezier(0.334731432, 0.124819821, 0.785843996, 1)'
    }, {
      transform: 'scaleX(0.826849212646)',
      offset: 0.6915,
      easing: 'cubic-bezier(0.225732004, 0, 0.233648906, 1.3709798)'
    }, {
      transform: 'scaleX(0.1)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  function createOuterRect2Animation() {
    return document.getElementById('progressBarOuterRect2').animate([{
      transform: 'translateX(-161.600006104px)',
      offset: 0,
      easing: 'cubic-bezier(0.15, 0, 0.5150584, 0.409684966)'
    }, {
      transform: 'translateX(-26.0531211724px)',
      offset: 0.25,
      easing: 'cubic-bezier(0.3103299, 0.284057684, 0.8, 0.733718979)'
    }, {
      transform: 'translateX(142.190187566px)',
      offset: 0.4835,
      easing: 'cubic-bezier(0.4, 0.627034903, 0.6, 0.902025796)'
    }, {
      transform: 'translateX(458.600006104px)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  function createInnerRect2Animation() {
    return document.getElementById('progressBarInnerRect2').animate([{
      transform: 'scaleX(0.1)',
      offset: 0,
      easing: 'cubic-bezier(0.205028172, 0.057050836, 0.57660995, 0.453970841)'
    }, {
      transform: 'scaleX(0.571379510698)',
      offset: 0.1915,
      easing: 'cubic-bezier(0.152312994, 0.196431957, 0.648373778, 1.00431535)'
    }, {
      transform: 'scaleX(0.909950256348)',
      offset: 0.4415,
      easing: 'cubic-bezier(0.25775882, -0.003163357, 0.211761916, 1.38178961)'
    }, {
      transform: 'scaleX(0.1)',
      offset: 1
    }], {
      duration: currentAnimationDuration,
      iterations: Infinity
    });
  }

  var outerRect1Animation = createOuterRect1Animation();
  var innerRect1Animation = createInnerRect1Animation();
  var outerRect2Animation = createOuterRect2Animation();
  var innerRect2Animation = createInnerRect2Animation();

  var scaleSelector = document.querySelector("input[id=linearProgressScaleCheckbox]");
  var translateSelector = document.querySelector("input[id=linearProgressTranslateCheckbox]");
  var slowAnimationSelector = document.querySelector("input[id=linearProgressSlowAnimationCheckbox]");

  function restartAnimations() {
    outerRect1Animation.cancel();
    innerRect1Animation.cancel();
    outerRect2Animation.cancel();
    innerRect2Animation.cancel();
    outerRect1Animation = createOuterRect1Animation();
    innerRect1Animation = createInnerRect1Animation();
    outerRect2Animation = createOuterRect2Animation();
    innerRect2Animation = createInnerRect2Animation();
    if (!scaleSelector.checked) {
      innerRect1Animation.cancel();
      innerRect2Animation.cancel();
    }
    if (!translateSelector.checked) {
      outerRect1Animation.cancel();
      outerRect2Animation.cancel();
    }
  }

  scaleSelector.addEventListener("change", function(event) {
    restartAnimations();
  });

  translateSelector.addEventListener("change", function(event) {
    restartAnimations();
  });

  slowAnimationSelector.addEventListener("change", function(event) {
    if (slowAnimationSelector.checked) {
      currentAnimationDuration *= 5;
    } else {
      currentAnimationDuration /= 5;
    }
    restartAnimations();
  });
});

