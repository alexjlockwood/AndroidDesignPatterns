document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isIconMinus = false;

  var slowAnimationSelector = document.querySelector("input[id=pathMorphSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_plus_minus").addEventListener("click", function() {
    toggleAnimation();
  });

  function animatePlusToMinus() {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (rotateSelector.checked) {
      document.getElementById("plus_minus_container_rotate").animate([{
        "transform": "rotate(180deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }, {
        "transform": "rotate(360deg)",
        offset: 1
      }], {
        duration: 300 * currentAnimationDurationFactor,
        fill: "forwards"
      });
    }
    var duration = 250 * currentAnimationDurationFactor;
    var plusToMinusPathAnimation = document.getElementById("plus_to_minus_path_animation");
    plusToMinusPathAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    plusToMinusPathAnimation.beginElement();
  }

  function animateMinusToPlus() {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (rotateSelector.checked) {
      document.getElementById("plus_minus_container_rotate").animate([{
        "transform": "rotate(0deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }, {
        "transform": "rotate(180deg)",
        offset: 1
      }], {
        duration: 300 * currentAnimationDurationFactor,
        fill: "forwards"
      });
    }
    var duration = 250 * currentAnimationDurationFactor;
    var minusToPlusPathAnimation = document.getElementById("minus_to_plus_path_animation");
    minusToPlusPathAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    minusToPlusPathAnimation.beginElement();
  }

  function toggleAnimation() {
    if (isIconMinus) {
      animateMinusToPlus();
    } else {
      animatePlusToMinus();
    }
    isIconMinus = !isIconMinus;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isIconTick = false;

  var slowAnimationSelector = document.querySelector("input[id=pathMorphSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_cross_tick").addEventListener("click", function() {
    toggleAnimation();
  });

  function animateCrossToTick() {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (rotateSelector.checked) {
      document.getElementById("cross_tick_container_rotate").animate([{
        "transform": "rotate(180deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }, {
        "transform": "rotate(360deg)",
        offset: 1
      }], {
        duration: 300 * currentAnimationDurationFactor,
        fill: "forwards"
      });
    }
    var duration = 300 * currentAnimationDurationFactor;
    var crossToTickPathAnimation = document.getElementById("cross_to_tick_path_animation");
    crossToTickPathAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    crossToTickPathAnimation.beginElement();
  }

  function animateTickToCross() {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (rotateSelector.checked) {
      document.getElementById("cross_tick_container_rotate").animate([{
        "transform": "rotate(0deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }, {
        "transform": "rotate(180deg)",
        offset: 1
      }], {
        duration: 300 * currentAnimationDurationFactor,
        fill: "forwards"
      });
    }
    var duration = 300 * currentAnimationDurationFactor;
    var tickToCrossPathAnimation = document.getElementById("tick_to_cross_path_animation");
    tickToCrossPathAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    tickToCrossPathAnimation.beginElement();
  }

  function toggleAnimation() {
    if (isIconTick) {
      animateTickToCross();
    } else {
      animateCrossToTick();
    }
    isIconTick = !isIconTick;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isIconArrow = false;

  var slowAnimationSelector = document.querySelector("input[id=pathMorphSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_arrow_drawer").addEventListener("click", function() {
    toggleAnimation();
  });

  function animateArrowToDrawer() {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (rotateSelector.checked) {
      document.getElementById("arrow_drawer_container_rotate").animate([{
        "transform": "rotate(180deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }, {
        "transform": "rotate(360deg)",
        offset: 1
      }], {
        duration: 300 * currentAnimationDurationFactor,
        fill: "forwards"
      });
    }

    var duration = 300 * currentAnimationDurationFactor;
    var arrowToDrawerPathAnimation = document.getElementById("arrow_to_drawer_path_animation");
    arrowToDrawerPathAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    arrowToDrawerPathAnimation.beginElement();
  }

  function animateDrawerToArrow() {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (rotateSelector.checked) {
      document.getElementById("arrow_drawer_container_rotate").animate([{
        "transform": "rotate(0deg)",
        offset: 0,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)"
      }, {
        "transform": "rotate(180deg)",
        offset: 1
      }], {
        duration: 300 * currentAnimationDurationFactor,
        fill: "forwards"
      });
    }

    var duration = 300 * currentAnimationDurationFactor;
    var drawerToArrowPathAnimation = document.getElementById("drawer_to_arrow_path_animation");
    drawerToArrowPathAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    drawerToArrowPathAnimation.beginElement();
  }

  function toggleAnimation() {
    if (isIconArrow) {
      animateArrowToDrawer();
    } else {
      animateDrawerToArrow();
    }
    isIconArrow = !isIconArrow;
  }
});

document.addEventListener("DOMContentLoaded", function(event) {
  var currentAnimationDurationFactor = 1;
  var isIconArrow = false;

  var slowAnimationSelector = document.querySelector("input[id=pathMorphSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
  });
  document.getElementById("ic_arrow_overflow").addEventListener("click", function() {
    toggleAnimation();
  });

  function animateOverflowToArrow() {
    document.getElementById("arrow_overflow_rotate_dot1").animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "rotate(-45deg)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_translate_dot1").animate([{
      "transform": "translateX(0px) translateY(-6px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_pivot_dot1").animate([{
      "transform": "translateX(0px)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "translateX(4.5px)",
      offset: 1
    }], {
      duration: 200 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_translate_dot2").animate([{
      "transform": "translateX(0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(-8px)",
      offset: 1
    }], {
      duration: 250 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_pivot_dot2").animate([{
      "transform": "translateX(0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(8.18181818182px)",
      offset: 0.4
    }, {
      "transform": "translateX(9px)",
      offset: 1
    }], {
      duration: 200 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_rotate_dot3").animate([{
      "transform": "rotate(0deg)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "rotate(45deg)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_translate_dot3").animate([{
      "transform": "translateX(0px) translateY(6px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_pivot_dot3").animate([{
      "transform": "translateX(0px)",
      offset: 0,
      easing: "cubic-bezier(0, 0, 0, 1)"
    }, {
      "transform": "translateX(4.5px)",
      offset: 1
    }], {
      duration: 200 * currentAnimationDurationFactor,
      fill: "forwards"
    });

    var pathAnimationDuration1 = 300 * currentAnimationDurationFactor;
    var pathAnimationDuration2 = 300 * currentAnimationDurationFactor;
    var pathAnimationDuration3 = 300 * currentAnimationDurationFactor;
    var overflowToArrowPathAnimation1 = document.getElementById("overflow_to_arrow_path1_animation");
    var overflowToArrowPathAnimation2 = document.getElementById("overflow_to_arrow_path2_animation");
    var overflowToArrowPathAnimation3 = document.getElementById("overflow_to_arrow_path3_animation");
    overflowToArrowPathAnimation1.setAttributeNS(null, 'dur', pathAnimationDuration1 + 'ms');
    overflowToArrowPathAnimation2.setAttributeNS(null, 'dur', pathAnimationDuration2 + 'ms');
    overflowToArrowPathAnimation3.setAttributeNS(null, 'dur', pathAnimationDuration3 + 'ms');
    overflowToArrowPathAnimation1.beginElement();
    overflowToArrowPathAnimation2.beginElement();
    overflowToArrowPathAnimation3.beginElement();
  }

  function animateArrowToOverflow() {
    document.getElementById("arrow_overflow_rotate_dot1").animate([{
      "transform": "rotate(-45deg)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "rotate(0deg)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_translate_dot1").animate([{
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px) translateY(-6px)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_pivot_dot1").animate([{
      "transform": "translateX(4.5px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px)",
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_translate_dot2").animate([{
      "transform": "translateX(-8px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px)",
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_pivot_dot2").animate([{
      "transform": "translateX(9px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px)",
      offset: 1
    }], {
      duration: 216 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_rotate_dot3").animate([{
      "transform": "rotate(45deg)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "rotate(0deg)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_translate_dot3").animate([{
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px) translateY(6px)",
      offset: 1
    }], {
      duration: 400 * currentAnimationDurationFactor,
      fill: "forwards"
    });
    document.getElementById("arrow_overflow_pivot_dot3").animate([{
      "transform": "translateX(4.5px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px)",
      offset: 1
    }], {
      duration: 300 * currentAnimationDurationFactor,
      fill: "forwards"
    });

    var duration = 300 * currentAnimationDurationFactor;
    var arrowToOverflowPathAnimation1 = document.getElementById("arrow_to_overflow_path1_animation");
    var arrowToOverflowPathAnimation2 = document.getElementById("arrow_to_overflow_path2_animation");
    var arrowToOverflowPathAnimation3 = document.getElementById("arrow_to_overflow_path3_animation");
    arrowToOverflowPathAnimation1.setAttributeNS(null, 'begin', '50ms');
    arrowToOverflowPathAnimation3.setAttributeNS(null, 'begin', '50ms');
    arrowToOverflowPathAnimation1.setAttributeNS(null, 'dur', duration + 'ms');
    arrowToOverflowPathAnimation2.setAttributeNS(null, 'dur', duration + 'ms');
    arrowToOverflowPathAnimation3.setAttributeNS(null, 'dur', duration + 'ms');
    arrowToOverflowPathAnimation1.beginElement();
    arrowToOverflowPathAnimation2.beginElement();
    arrowToOverflowPathAnimation3.beginElement();
  }

  function toggleAnimation() {
    if (isIconArrow) {
      animateArrowToOverflow();
    } else {
      animateOverflowToArrow();
    }
    isIconArrow = !isIconArrow;
  }
});

