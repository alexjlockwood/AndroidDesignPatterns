document.addEventListener("DOMContentLoaded", function(event) {
  var currentRotationDuration = 4444;
  var currentTrimPathDuration = 1333;

  var circular_progress_outer_rotation = document.getElementById("circular_progress_outer_rotation");
  var circular_progress_inner_rotation = document.getElementById("circular_progress_inner_rotation");
  var circle_path = document.getElementById("circle_path");

  function restartAnimation(animation) {
    animation.cancel();
    animation.play();
  }

  var outerRotationAnimation = createRotationAnimation();
  var trimPathOffsetAnimation = createTrimPathOffsetAnimation();
  var trimPathStartAnimation = createTrimPathStartAnimation();
  var trimPathEndAnimation = createTrimPathEndAnimation();

  var outerRotationSelector = document.querySelector("input[id=circularProgressOuterRotationCheckbox]");
  var trimPathOffsetSelector = document.querySelector("input[id=circularProgressTrimPathOffsetCheckbox]");
  var trimPathStartEndSelector = document.querySelector("input[id=circularProgressTrimPathStartEndCheckbox]");
  var slowAnimationSelector = document.querySelector("input[id=circularProgressSlowAnimationCheckbox]");
  outerRotationSelector.addEventListener("change", function(event) {
    if (outerRotationSelector.checked) {
      outerRotationAnimation.play();
    } else {
      outerRotationAnimation.pause();
    }
  });
  trimPathOffsetSelector.addEventListener("change", function(event) {
    if (!trimPathOffsetSelector.checked) {
      trimPathOffsetAnimation.pause();
      return;
    }
    if (!trimPathStartEndSelector.checked) {
      trimPathOffsetAnimation.play();
      return;
    }
    restartAnimation(trimPathStartAnimation);
    restartAnimation(trimPathEndAnimation);
    restartAnimation(trimPathOffsetAnimation);
  });
  trimPathStartEndSelector.addEventListener("change", function(event) {
    if (!trimPathStartEndSelector.checked) {
      trimPathStartAnimation.pause();
      trimPathEndAnimation.pause();
      return;
    }
    if (!trimPathOffsetSelector.checked) {
      trimPathStartAnimation.play();
      trimPathEndAnimation.play();
      return;
    }
    restartAnimation(trimPathStartAnimation);
    restartAnimation(trimPathEndAnimation);
    restartAnimation(trimPathOffsetAnimation);
  });
  slowAnimationSelector.addEventListener("change", function(event) {
    if (slowAnimationSelector.checked) {
      currentRotationDuration *= 5;
      currentTrimPathDuration *= 5;
    } else {
      currentRotationDuration /= 5;
      currentTrimPathDuration /= 5;
    }
    outerRotationAnimation.cancel();
    trimPathOffsetAnimation.cancel();
    trimPathStartAnimation.cancel();
    trimPathEndAnimation.cancel();
    outerRotationAnimation = createRotationAnimation();
    trimPathOffsetAnimation = createTrimPathOffsetAnimation();
    trimPathStartAnimation = createTrimPathStartAnimation();
    trimPathEndAnimation = createTrimPathEndAnimation();
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
      duration: currentRotationDuration,
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
      duration: currentTrimPathDuration,
      fill: "forwards",
      iterations: "Infinity"
    });
  }

  function createTrimPathStartAnimation() {
    return circle_path.animate([{
      "strokeDasharray": "1.79095622248,57.907584527",
      offset: 0.0,
      easing: 'linear'
    }, {
      "strokeDasharray": "1.85295306722,57.8455876822",
      offset: 0.0128205128205,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.05259983921,57.6459409102",
      offset: 0.025641025641,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.41417150797,57.2843692415",
      offset: 0.0384615384615,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.96761070876,56.7309300407",
      offset: 0.0512820512821,
      easing: 'linear'
    }, {
      "strokeDasharray": "3.74953618863,55.9490045608",
      offset: 0.0641025641026,
      easing: 'linear'
    }, {
      "strokeDasharray": "4.8041484717,54.8943922778",
      offset: 0.0769230769231,
      easing: 'linear'
    }, {
      "strokeDasharray": "6.18118001772,53.5173607317",
      offset: 0.0897435897436,
      easing: 'linear'
    }, {
      "strokeDasharray": "7.93009505436,51.7684456951",
      offset: 0.102564102564,
      easing: 'linear'
    }, {
      "strokeDasharray": "10.4702056084,49.2283351411",
      offset: 0.115384615385,
      easing: 'linear'
    }, {
      "strokeDasharray": "13.2255228737,46.4730178757",
      offset: 0.128205128205,
      easing: 'linear'
    }, {
      "strokeDasharray": "15.9808401391,43.7177006104",
      offset: 0.141025641026,
      easing: 'linear'
    }, {
      "strokeDasharray": "18.7361574044,40.962383345",
      offset: 0.153846153846,
      easing: 'linear'
    }, {
      "strokeDasharray": "21.4914746698,38.2070660796",
      offset: 0.166666666667,
      easing: 'linear'
    }, {
      "strokeDasharray": "24.2310384396,35.4675023099",
      offset: 0.179487179487,
      easing: 'linear'
    }, {
      "strokeDasharray": "26.7703181375,32.9282226119",
      offset: 0.192307692308,
      easing: 'linear'
    }, {
      "strokeDasharray": "29.0400153014,30.6585254481",
      offset: 0.205128205128,
      easing: 'linear'
    }, {
      "strokeDasharray": "31.0555067957,28.6430339538",
      offset: 0.217948717949,
      easing: 'linear'
    }, {
      "strokeDasharray": "32.8364248687,26.8621158807",
      offset: 0.230769230769,
      easing: 'linear'
    }, {
      "strokeDasharray": "34.4097305949,25.2888101545",
      offset: 0.24358974359,
      easing: 'linear'
    }, {
      "strokeDasharray": "35.8005995073,23.8979412421",
      offset: 0.25641025641,
      easing: 'linear'
    }, {
      "strokeDasharray": "37.0318705611,22.6666701883",
      offset: 0.269230769231,
      easing: 'linear'
    }, {
      "strokeDasharray": "38.1220403939,21.5765003556",
      offset: 0.282051282051,
      easing: 'linear'
    }, {
      "strokeDasharray": "39.0878476884,20.6106930611",
      offset: 0.294871794872,
      easing: 'linear'
    }, {
      "strokeDasharray": "39.9432470456,19.7552937038",
      offset: 0.307692307692,
      easing: 'linear'
    }, {
      "strokeDasharray": "40.7000550052,18.9984857442",
      offset: 0.320512820513,
      easing: 'linear'
    }, {
      "strokeDasharray": "41.3684851313,18.3300556181",
      offset: 0.333333333333,
      easing: 'linear'
    }, {
      "strokeDasharray": "41.9572834778,17.7412572717",
      offset: 0.346153846154,
      easing: 'linear'
    }, {
      "strokeDasharray": "42.4736602206,17.2248805288",
      offset: 0.358974358974,
      easing: 'linear'
    }, {
      "strokeDasharray": "42.9243367147,16.7742040347",
      offset: 0.371794871795,
      easing: 'linear'
    }, {
      "strokeDasharray": "43.3146890235,16.383851726",
      offset: 0.384615384615,
      easing: 'linear'
    }, {
      "strokeDasharray": "43.6499014528,16.0486392966",
      offset: 0.397435897436,
      easing: 'linear'
    }, {
      "strokeDasharray": "43.9342045138,15.7643362357",
      offset: 0.410256410256,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.1714962026,15.5270445469",
      offset: 0.423076923077,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.3650063251,15.3335344243",
      offset: 0.435897435897,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.517988657,15.1805520925",
      offset: 0.448717948718,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.6330191041,15.0655216453",
      offset: 0.461538461538,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.7125202344,14.9860205151",
      offset: 0.474358974359,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.7587692033,14.9397715462",
      offset: 0.487179487179,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.7739055621,14.9246351874",
      offset: 0.5,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.7200233547,14.9785173948",
      offset: 0.512820512821,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.5363515025,15.162189247",
      offset: 0.525641025641,
      easing: 'linear'
    }, {
      "strokeDasharray": "44.1918412953,15.5066994541",
      offset: 0.538461538462,
      easing: 'linear'
    }, {
      "strokeDasharray": "43.6526903851,16.0458503643",
      offset: 0.551282051282,
      easing: 'linear'
    }, {
      "strokeDasharray": "42.879304261,16.8192364885",
      offset: 0.564102564103,
      easing: 'linear'
    }, {
      "strokeDasharray": "41.8246812493,17.8738595002",
      offset: 0.576923076923,
      easing: 'linear'
    }, {
      "strokeDasharray": "40.4364425122,19.2620982373",
      offset: 0.589743589744,
      easing: 'linear'
    }, {
      "strokeDasharray": "38.6626409563,21.0358997931",
      offset: 0.602564102564,
      easing: 'linear'
    }, {
      "strokeDasharray": "36.066140691,23.6324000584",
      offset: 0.615384615385,
      easing: 'linear'
    }, {
      "strokeDasharray": "33.2465946562,26.4519460932",
      offset: 0.628205128205,
      easing: 'linear'
    }, {
      "strokeDasharray": "30.4282167386,29.2703240108",
      offset: 0.641025641026,
      easing: 'linear'
    }, {
      "strokeDasharray": "27.6103892266,32.0881515228",
      offset: 0.653846153846,
      easing: 'linear'
    }, {
      "strokeDasharray": "24.7935042925,34.905036457",
      offset: 0.666666666667,
      easing: 'linear'
    }, {
      "strokeDasharray": "21.9937708098,37.7047699397",
      offset: 0.679487179487,
      easing: 'linear'
    }, {
      "strokeDasharray": "19.403329104,40.2952116455",
      offset: 0.692307692308,
      easing: 'linear'
    }, {
      "strokeDasharray": "17.0937025378,42.6048382116",
      offset: 0.705128205128,
      easing: 'linear'
    }, {
      "strokeDasharray": "15.0488735441,44.6496672053",
      offset: 0.717948717949,
      easing: 'linear'
    }, {
      "strokeDasharray": "13.2483918642,46.4501488852",
      offset: 0.730769230769,
      easing: 'linear'
    }, {
      "strokeDasharray": "11.6641730456,48.0343677039",
      offset: 0.74358974359,
      easing: 'linear'
    }, {
      "strokeDasharray": "10.2699925747,49.4285481747",
      offset: 0.75641025641,
      easing: 'linear'
    }, {
      "strokeDasharray": "9.04205987319,50.6564808763",
      offset: 0.769230769231,
      easing: 'linear'
    }, {
      "strokeDasharray": "7.96110761026,51.7374331392",
      offset: 0.782051282051,
      easing: 'linear'
    }, {
      "strokeDasharray": "7.009699658,52.6888410914",
      offset: 0.794871794872,
      easing: 'linear'
    }, {
      "strokeDasharray": "6.17329997377,53.5252407757",
      offset: 0.807692307692,
      easing: 'linear'
    }, {
      "strokeDasharray": "5.439599662,54.2589410874",
      offset: 0.820512820513,
      easing: 'linear'
    }, {
      "strokeDasharray": "4.7972970582,54.9012436912",
      offset: 0.833333333333,
      easing: 'linear'
    }, {
      "strokeDasharray": "4.23720266458,55.4613380849",
      offset: 0.846153846154,
      easing: 'linear'
    }, {
      "strokeDasharray": "3.75160486354,55.9469358859",
      offset: 0.858974358974,
      easing: 'linear'
    }, {
      "strokeDasharray": "3.333894416,56.3646463335",
      offset: 0.871794871795,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.97785354431,56.7206872051",
      offset: 0.884615384615,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.67812215888,57.0204185906",
      offset: 0.897435897436,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.4299580777,57.2685826718",
      offset: 0.910256410256,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.22894835853,57.4695923909",
      offset: 0.923076923077,
      easing: 'linear'
    }, {
      "strokeDasharray": "2.07130676406,57.6272339854",
      offset: 0.935897435897,
      easing: 'linear'
    }, {
      "strokeDasharray": "1.95306975238,57.7454709971",
      offset: 0.948717948718,
      easing: 'linear'
    }, {
      "strokeDasharray": "1.87059462721,57.8279461222",
      offset: 0.961538461538,
      easing: 'linear'
    }, {
      "strokeDasharray": "1.81990789775,57.8786328517",
      offset: 0.974358974359,
      easing: 'linear'
    }, {
      "strokeDasharray": "1.79602542368,57.9025153258",
      offset: 0.987179487179,
      easing: 'linear'
    }, {
      "strokeDasharray": "1.79095622248,57.907584527",
      offset: 1.0
    }], {
      duration: currentTrimPathDuration,
      fill: "forwards",
      iterations: "Infinity"
    });
  }

  function createTrimPathEndAnimation() {
    return circle_path.animate([{
      "strokeDashoffset": 14.9246351874,
      offset: 0.0,
      easing: 'linear'
    }, {
      "strokeDashoffset": 14.9246351874,
      offset: 0.5,
      easing: 'linear'
    }, {
      "strokeDashoffset": 14.8600551408,
      offset: 0.512820512821,
      easing: 'linear'
    }, {
      "strokeDashoffset": 14.6520897533,
      offset: 0.525641025641,
      easing: 'linear'
    }, {
      "strokeDashoffset": 14.2754525983,
      offset: 0.538461538462,
      easing: 'linear'
    }, {
      "strokeDashoffset": 13.6989534308,
      offset: 0.551282051282,
      easing: 'linear'
    }, {
      "strokeDashoffset": 12.8844477226,
      offset: 0.564102564103,
      easing: 'linear'
    }, {
      "strokeDashoffset": 11.7858932611,
      offset: 0.576923076923,
      easing: 'linear'
    }, {
      "strokeDashoffset": 10.3514854007,
      offset: 0.589743589744,
      easing: 'linear'
    }, {
      "strokeDashoffset": 8.52969890416,
      offset: 0.602564102564,
      easing: 'linear'
    }, {
      "strokeDashoffset": 5.8837504104,
      offset: 0.615384615385,
      easing: 'linear'
    }, {
      "strokeDashoffset": 3.01362825899,
      offset: 0.628205128205,
      easing: 'linear'
    }, {
      "strokeDashoffset": 0.143506107572,
      offset: 0.641025641026,
      easing: 'linear'
    }, {
      "strokeDashoffset": -2.72661604384,
      offset: 0.653846153846,
      easing: 'linear'
    }, {
      "strokeDashoffset": -5.59673819526,
      offset: 0.666666666667,
      easing: 'linear'
    }, {
      "strokeDashoffset": -8.45045045545,
      offset: 0.679487179487,
      easing: 'linear'
    }, {
      "strokeDashoffset": -11.0955334741,
      offset: 0.692307692308,
      easing: 'linear'
    }, {
      "strokeDashoffset": -13.4598013531,
      offset: 0.705128205128,
      easing: 'linear'
    }, {
      "strokeDashoffset": -15.5592716597,
      offset: 0.717948717949,
      easing: 'linear'
    }, {
      "strokeDashoffset": -17.4143946525,
      offset: 0.730769230769,
      easing: 'linear'
    }, {
      "strokeDashoffset": -19.0532547839,
      offset: 0.74358974359,
      easing: 'linear'
    }, {
      "strokeDashoffset": -20.5020765677,
      offset: 0.75641025641,
      easing: 'linear'
    }, {
      "strokeDashoffset": -21.7846505821,
      offset: 0.769230769231,
      easing: 'linear'
    }, {
      "strokeDashoffset": -22.9202441579,
      offset: 0.782051282051,
      easing: 'linear'
    }, {
      "strokeDashoffset": -23.926293423,
      offset: 0.794871794872,
      easing: 'linear'
    }, {
      "strokeDashoffset": -24.8173344201,
      offset: 0.807692307692,
      easing: 'linear'
    }, {
      "strokeDashoffset": -25.6056760447,
      offset: 0.820512820513,
      easing: 'linear'
    }, {
      "strokeDashoffset": -26.301957426,
      offset: 0.833333333333,
      easing: 'linear'
    }, {
      "strokeDashoffset": -26.9152890369,
      offset: 0.846153846154,
      easing: 'linear'
    }, {
      "strokeDashoffset": -27.4531814773,
      offset: 0.858974358974,
      easing: 'linear'
    }, {
      "strokeDashoffset": -27.9226361587,
      offset: 0.871794871795,
      easing: 'linear'
    }, {
      "strokeDashoffset": -28.329253147,
      offset: 0.884615384615,
      easing: 'linear'
    }, {
      "strokeDashoffset": -28.6784327609,
      offset: 0.897435897436,
      easing: 'linear'
    }, {
      "strokeDashoffset": -28.9745817827,
      offset: 0.910256410256,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.2217606252,
      offset: 0.923076923077,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.4233336695,
      offset: 0.935897435897,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.5826902652,
      offset: 0.948717948718,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.7025136477,
      offset: 0.961538461538,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.785327325,
      offset: 0.974358974359,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.8335033343,
      offset: 0.987179487179,
      easing: 'linear'
    }, {
      "strokeDashoffset": -29.8492703747,
      offset: 1
    }], {
      duration: currentTrimPathDuration,
      fill: "forwards",
      iterations: "Infinity"
    });
  }
});

