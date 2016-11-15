document.addEventListener("DOMContentLoaded", function(event) {
  var plusMinusPaths = [
    "M 5,11 L 11,11 L 11,5 L 13,5 L 13,11 L 19,11 L 19,13 L 13,13 L 13,19 L 11,19 L 11,13 L 5,13 Z",
    "M 5,11 L 11,11 L 11,11 L 13,11 L 13,11 L 19,11 L 19,13 L 13,13 L 13,13 L 11,13 L 11,13 L 5,13 Z"
  ];

  var crossTickPaths = [
    "M6.4,6.4 L17.6,17.6 M6.4,17.6 L17.6,6.4",
    "M4.8,13.4 L9,17.6 M10.4,16.2 L19.6,7"
  ];

  var drawerArrowPaths = [
    "M 3,6 L 3,8 L 21,8 L 21,6 L 3,6 z M 3,11 L 3,13 L 21,13 L 21, 12 L 21,11 L 3,11 z M 3,18 L 3,16 L 21,16 L 21,18 L 3,18 z",
    "M 12, 4 L 10.59,5.41 L 16.17,11 L 18.99,11 L 12,4 z M 4, 11 L 4, 13 L 18.99, 13 L 20, 12 L 18.99, 11 L 4, 11 z M 12,20 L 10.59, 18.59 L 16.17, 13 L 18.99, 13 L 12, 20z"
  ];

  var overflowToArrowPaths = [
    ["M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z","M -4.0951,-1.3095 l 8.1901,0 c 0.1776,0 0.3216,0.1440 0.3216,0.3216 l 0,1.9758 c 0,0.1776 -0.1440,0.3216 -0.3216,0.3216 l -8.1901,0 c -0.1776,0 -0.3216,-0.1440 -0.3216,-0.3216 l 0,-1.9758 c 0,-0.1776 0.1440,-0.3216 0.3216,-0.3216 Z","M -5.1145,-1.1101 l 10.2291,0 c 0,0 0,0 0,0 l 0,2.2203 c 0,0 0,0 0,0 l -10.2291,0 c 0,0 0,0 0,0 l 0,-2.2203 c 0,0 0,0 0,0 Z","M -5.4176,-1.0236 l 10.8351,0 c 0,0 0,0 0,0 l 0,2.0471 c 0,0 0,0 0,0 l -10.8351,0 c 0,0 0,0 0,0 l 0,-2.0471 c 0,0 0,0 0,0 Z","M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"],
    ["M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z","M -0.5106,-1.9149 l 1.0213,0 c 1.0576,0 1.9149,0.8573 1.9149,1.9149 l 0,0 c 0,1.0576 -0.8573,1.9149 -1.9149,1.9149 l -1.0213,0 c -1.0576,0 -1.9149,-0.8573 -1.9149,-1.9149 l 0,0 c 0,-1.0576 0.8573,-1.9149 1.9149,-1.9149 Z","M -3.6617,-1.5417 l 7.3234,0 c 0.3479,0 0.6299,0.2820 0.6299,0.6299 l 0,1.8234 c 0,0.3479 -0.2820,0.6299 -0.6299,0.6299 l -7.3234,0 c -0.3479,0 -0.6299,-0.2820 -0.6299,-0.6299 l 0,-1.8234 c 0,-0.3479 0.2820,-0.6299 0.6299,-0.6299 Z","M -5.8061,-1.2245 l 11.6121,0 c 0.0395,0 0.0716,0.0320 0.0716,0.0716 l 0,2.3058 c 0,0.0395 -0.0320,0.0716 -0.0716,0.0716 l -11.6121,0 c -0.0395,0 -0.0716,-0.0320 -0.0716,-0.0716 l 0,-2.3058 c 0,-0.0395 0.0320,-0.0716 0.0716,-0.0716 Z","M -6.6039,-1.0792 l 13.2077,0 c 0,0 0,0 0,0 l 0,2.1585 c 0,0 0,0 0,0 l -13.2077,0 c 0,0 0,0 0,0 l 0,-2.1585 c 0,0 0,0 0,0 Z","M -6.9168,-1.0166 l 13.8336,0 c 0,0 0,0 0,0 l 0,2.0333 c 0,0 0,0 0,0 l -13.8336,0 c 0,0 0,0 0,0 l 0,-2.0333 c 0,0 0,0 0,0 Z","M -7,-1 l 14,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -14,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"],
    ["M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z","M -4.0951,-1.3095 l 8.1901,0 c 0.1776,0 0.3216,0.1440 0.3216,0.3216 l 0,1.9758 c 0,0.1776 -0.1440,0.3216 -0.3216,0.3216 l -8.1901,0 c -0.1776,0 -0.3216,-0.1440 -0.3216,-0.3216 l 0,-1.9758 c 0,-0.1776 0.1440,-0.3216 0.3216,-0.3216 Z","M -5.1145,-1.1101 l 10.2291,0 c 0,0 0,0 0,0 l 0,2.2203 c 0,0 0,0 0,0 l -10.2291,0 c 0,0 0,0 0,0 l 0,-2.2203 c 0,0 0,0 0,0 Z","M -5.4176,-1.0236 l 10.8351,0 c 0,0 0,0 0,0 l 0,2.0471 c 0,0 0,0 0,0 l -10.8351,0 c 0,0 0,0 0,0 l 0,-2.0471 c 0,0 0,0 0,0 Z","M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"]
  ];

  var arrowToOverflowPaths = [
    ["M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z","M -5.3496,-1.0430 l 10.6992,0 c 0,0 0,0 0,0 l 0,2.0859 c 0,0 0,0 0,0 l -10.6992,0 c 0,0 0,0 0,0 l 0,-2.0859 c 0,0 0,0 0,0 Z","M -4.5733,-1.2500 l 9.1465,0 c 0.0286,0 0.0517,0.0232 0.0517,0.0517 l 0,2.3965 c 0,0.0286 -0.0232,0.0517 -0.0517,0.0517 l -9.1465,0 c -0.0286,0 -0.0517,-0.0232 -0.0517,-0.0517 l 0,-2.3965 c 0,-0.0286 0.0232,-0.0517 0.0517,-0.0517 Z","M -3.0414,-1.5596 l 6.0827,0 c 0.2761,0 0.5,0.2239 0.5,0.5 l 0,2.1192 c 0,0.2761 -0.2239,0.5 -0.5,0.5 l -6.0827,0 c -0.2761,0 -0.5,-0.2239 -0.5,-0.5 l 0,-2.1192 c 0,-0.2761 0.2239,-0.5 0.5,-0.5 Z","M -1.5586,-1.7755 l 3.1172,0 c 0.6777,0 1.2271,0.5494 1.2271,1.2271 l 0,1.0969 c 0,0.6777 -0.5494,1.2271 -1.2271,1.2271 l -3.1172,0 c -0.6777,0 -1.2271,-0.5494 -1.2271,-1.2271 l 0,-1.0969 c 0,-0.6777 0.5494,-1.2271 1.2271,-1.2271 Z","M -0.7060,-1.8945 l 1.4120,0 c 0.9186,0 1.6633,0.7447 1.6633,1.6633 l 0,0.4623 c 0,0.9186 -0.7447,1.6633 -1.6633,1.6633 l -1.4120,0 c -0.9186,0 -1.6633,-0.7447 -1.6633,-1.6633 l 0,-0.4623 c 0,-0.9186 0.7447,-1.6633 1.6633,-1.6633 Z","M -0.2657,-1.9594 l 0.5315,0 c 1.0364,0 1.8765,0.8401 1.8765,1.8765 l 0,0.1658 c 0,1.0364 -0.8401,1.8765 -1.8765,1.8765 l -0.5315,0 c -1.0364,0 -1.8765,-0.8401 -1.8765,-1.8765 l 0,-0.1658 c 0,-1.0364 0.8401,-1.8765 1.8765,-1.8765 Z","M -0.0581,-1.9910 l 0.1162,0 c 1.0899,0 1.9734,0.8835 1.9734,1.9734 l 0,0.0351 c 0,1.0899 -0.8835,1.9734 -1.9734,1.9734 l -0.1162,0 c -1.0899,0 -1.9734,-0.8835 -1.9734,-1.9734 l 0,-0.0351 c 0,-1.0899 0.8835,-1.9734 1.9734,-1.9734 Z","M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z"],
    ["M -7,-1 l 14,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -14,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z"," M -4.3684,-1.4999 l 8.7369,0 c 0.0729,0 0.1320,0.0591 0.1320,0.1320 l 0,2.7359 c 0,0.0729 -0.0591,0.1320 -0.1320,0.1320 l -8.7369,0 c -0.0729,0 -0.1320,-0.0591 -0.1320,-0.1320 l 0,-2.7359 c 0,-0.0729 0.0591,-0.1320 0.1320,-0.1320 Z","M -2.7976,-1.6905 l 5.5952,0 c 0.4142,0 0.7500,0.3358 0.7500,0.7500 l 0,1.8810 c 0,0.4142 -0.3358,0.7500 -0.7500,0.7500 l -5.5952,0 c -0.4142,0 -0.7500,-0.3358 -0.7500,-0.7500 l 0,-1.8810 c 0,-0.4142 0.3358,-0.7500 0.7500,-0.7500 Z","M -1.5413,-1.8100 l 3.0826,0 c 0.7779,0 1.4085,0.6306 1.4085,1.4085 l 0,0.8031 c 0,0.7779 -0.6306,1.4085 -1.4085,1.4085 l -3.0826,0 c -0.7779,0 -1.4085,-0.6306 -1.4085,-1.4085 l 0,-0.8031 c 0,-0.7779 0.6306,-1.4085 1.4085,-1.4085 Z","M -0.7987,-1.8899 l 1.5974,0 c 0.9676,0 1.7519,0.7844 1.7519,1.7519 l 0,0.2759 c 0,0.9676 -0.7844,1.7519 -1.7519,1.7519 l -1.5974,0 c -0.9676,0 -1.7519,-0.7844 -1.7519,-1.7519 l 0,-0.2759 c 0,-0.9676 0.7844,-1.7519 1.7519,-1.7519 Z","M -0.3662,-1.9430 l 0.7324,0 c 1.0597,0 1.9187,0.8590 1.9187,1.9187 l 0,0.0486 c 0,1.0597 -0.8590,1.9187 -1.9187,1.9187 l -0.7324,0 c -1.0597,0 -1.9187,-0.8590 -1.9187,-1.9187 l 0,-0.0486 c 0,-1.0597 0.8590,-1.9187 1.9187,-1.9187 Z","M -0.1413,-1.9764 l 0.2827,0 c 1.0916,0 1.9764,0.8849 1.9764,1.9764 l 0,0 c 0,1.0916 -0.8849,1.9764 -1.9764,1.9764 l -0.2827,0 c -1.0916,0 -1.9764,-0.8849 -1.9764,-1.9764 l 0,0 c 0,-1.0916 0.8849,-1.9764 1.9764,-1.9764 Z","M -0.0331,-1.9945 l 0.0663,0 c 1.1015,0 1.9945,0.8930 1.9945,1.9945 l 0,0 c 0,1.1015 -0.8930,1.9945 -1.9945,1.9945 l -0.0663,0 c -1.1015,0 -1.9945,-0.8930 -1.9945,-1.9945 l 0,0 c 0,-1.1015 0.8930,-1.9945 1.9945,-1.9945 Z","M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z"],
    ["M -5.5,-1 l 11,0 c 0,0 0,0 0,0 l 0,2 c 0,0 0,0 0,0 l -11,0 c 0,0 0,0 0,0 l 0,-2 c 0,0 0,0 0,0 Z","M -5.3496,-1.0430 l 10.6992,0 c 0,0 0,0 0,0 l 0,2.0859 c 0,0 0,0 0,0 l -10.6992,0 c 0,0 0,0 0,0 l 0,-2.0859 c 0,0 0,0 0,0 Z","M -4.5733,-1.2500 l 9.1465,0 c 0.0286,0 0.0517,0.0232 0.0517,0.0517 l 0,2.3965 c 0,0.0286 -0.0232,0.0517 -0.0517,0.0517 l -9.1465,0 c -0.0286,0 -0.0517,-0.0232 -0.0517,-0.0517 l 0,-2.3965 c 0,-0.0286 0.0232,-0.0517 0.0517,-0.0517 Z","M -3.0414,-1.5596 l 6.0827,0 c 0.2761,0 0.5,0.2239 0.5,0.5 l 0,2.1192 c 0,0.2761 -0.2239,0.5 -0.5,0.5 l -6.0827,0 c -0.2761,0 -0.5,-0.2239 -0.5,-0.5 l 0,-2.1192 c 0,-0.2761 0.2239,-0.5 0.5,-0.5 Z","M -1.5586,-1.7755 l 3.1172,0 c 0.6777,0 1.2271,0.5494 1.2271,1.2271 l 0,1.0969 c 0,0.6777 -0.5494,1.2271 -1.2271,1.2271 l -3.1172,0 c -0.6777,0 -1.2271,-0.5494 -1.2271,-1.2271 l 0,-1.0969 c 0,-0.6777 0.5494,-1.2271 1.2271,-1.2271 Z","M -0.7060,-1.8945 l 1.4120,0 c 0.9186,0 1.6633,0.7447 1.6633,1.6633 l 0,0.4623 c 0,0.9186 -0.7447,1.6633 -1.6633,1.6633 l -1.4120,0 c -0.9186,0 -1.6633,-0.7447 -1.6633,-1.6633 l 0,-0.4623 c 0,-0.9186 0.7447,-1.6633 1.6633,-1.6633 Z","M -0.2657,-1.9594 l 0.5315,0 c 1.0364,0 1.8765,0.8401 1.8765,1.8765 l 0,0.1658 c 0,1.0364 -0.8401,1.8765 -1.8765,1.8765 l -0.5315,0 c -1.0364,0 -1.8765,-0.8401 -1.8765,-1.8765 l 0,-0.1658 c 0,-1.0364 0.8401,-1.8765 1.8765,-1.8765 Z","M -0.0581,-1.9910 l 0.1162,0 c 1.0899,0 1.9734,0.8835 1.9734,1.9734 l 0,0.0351 c 0,1.0899 -0.8835,1.9734 -1.9734,1.9734 l -0.1162,0 c -1.0899,0 -1.9734,-0.8835 -1.9734,-1.9734 l 0,-0.0351 c 0,-1.0899 0.8835,-1.9734 1.9734,-1.9734 Z","M 0,-2 l 0,0 c 1.1046,0 2,0.8954 2,2 l 0,0 c 0,1.1046 -0.8954,2 -2,2 l 0,0 c -1.1046,0 -2,-0.8954 -2,-2 l 0,0 c 0,-1.1046 0.8954,-2 2,-2 Z"],
  ];

  var playPauseStopPaths = [
    "M9,5 L9,5 L9,13 L4,13 L9,5 M9,5 L9,5 L14,13 L9,13 L9,5",
    "M6,5 L8,5 L8,13 L6,13 L6,5 M10,5 L12,5 L12,13 L10,13 L10,5",
    "M5,5 L9,5 L9,13 L5,13 L5,5 M9,5 L13,5 L13,13 L9,13 L9,5"
  ];

  var playPauseStopTranslationX = [0.75, 0, 0];

  function getScaledAnimationDuration(durationMillis) {
    var slowAnimationSelector = document.querySelector("input[id=pathMorphSlowAnimationCheckbox]");
    var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
    return durationMillis * currentAnimationDurationFactor;
  }

  function animateTranslationX(elementId, durationMillis, fromTranslationX, toTranslationX) {
    animateTranslationXWithEasing(elementId, durationMillis, fromTranslationX, toTranslationX, "cubic-bezier(0.4, 0, 0.2, 1)");
  }

  function animateTranslationXWithEasing(elementId, durationMillis, fromTranslationX, toTranslationX, easingFunction) {
    document.getElementById(elementId).animate([{
      "transform": ("translateX(" + fromTranslationX + "px)"),
      offset: 0,
      easing: easingFunction
    }, {
      "transform": ("translateX(" + toTranslationX + "px)"),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards"
    });
  }

  function maybeAnimateRotation(elementId, durationMillis, fromDegrees, toDegrees) {
    var rotateSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    if (!rotateSelector.checked) {
      return;
    }
    animateRotation(elementId, durationMillis, fromDegrees, toDegrees);
  }

  function animateRotation(elementId, durationMillis, fromDegrees, toDegrees) {
    animateRotationWithEasing(elementId, durationMillis, fromDegrees, toDegrees, "cubic-bezier(0.4, 0, 0.2, 1)");
  }

  function animateRotationWithEasing(elementId, durationMillis, fromDegrees, toDegrees, easingFunction) {
    document.getElementById(elementId).animate([{
      "transform": ("rotate(" + fromDegrees + "deg)"),
      offset: 0,
      easing: easingFunction
    }, {
      "transform": ("rotate(" + toDegrees + "deg)"),
      offset: 1
    }], {
      duration: getScaledAnimationDuration(durationMillis),
      fill: "forwards"
    });
  }

  function animatePathMorph(animationElementId, durationMillis) {
    var animation = document.getElementById(animationElementId);
    animation.setAttributeNS(null, 'dur', getScaledAnimationDuration(durationMillis) + 'ms');
    animation.beginElement();
  }

  function animatePathMorphWithValues(animationElementId, durationMillis, pathStringList) {
    var animation = document.getElementById(animationElementId);
    animation.setAttributeNS(null, 'dur', getScaledAnimationDuration(durationMillis) + 'ms');
    animation.setAttributeNS(null, 'values', pathStringList.join(";"));
    animation.beginElement();
  }

  function addDotToList(pathDataDots, x, y, r) {
    pathDataDots.push({type: "M", values: [x, y]});
    pathDataDots.push({type: "m", values: [-r, 0]});
    pathDataDots.push({type: "a", values: [r, r, 0, 1, 0, r * 2, 0]});
    pathDataDots.push({type: "a", values: [r, r, 0, 1, 0, -r * 2, 0]});
    pathDataDots.push({type: "z"});
  }

  function createPathDotString(pathString, dotRadius) {
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('d', pathString);
    var pathData = path.getPathData({normalize: true});
    var pathDataDots = [];
    var r = dotRadius;
    for (let seg of pathData) {
      if (seg.type === "M" || seg.type === "L") {
        let [x, y] = seg.values;
        addDotToList(pathDataDots, x, y, r);
      } else if (seg.type === "C") {
        let [x1, y1, x2, y2, x, y] = seg.values;
        addDotToList(pathDataDots, x1, y1, r);
        addDotToList(pathDataDots, x2, y2, r);
        addDotToList(pathDataDots, x, y, r);
      } else if (seg.type !== "Z") {
        console.log("Ignoring segment type: " + seg.type);
      }
    }
    path.setPathData(pathDataDots);
    return path.getAttribute('d');
  }

  function animatePoints(animationElementId, durationMillis, fromPathString, toPathString, dotRadius) {
    var listOfPathStrings = [fromPathString, toPathString];
    animatePointsWithList(animationElementId, durationMillis, listOfPathStrings, dotRadius);
  }

  function animatePointsWithList(animationElementId, durationMillis, listOfPathStrings, dotRadius) {
    var valuesString = "";
    for (i = 0; i < listOfPathStrings.length; i++) {
      valuesString = valuesString + createPathDotString(listOfPathStrings[i], dotRadius);
      if (i + 1 !== listOfPathStrings.length) {
        valuesString = valuesString + ";";
      }
    }
    var animation = document.getElementById(animationElementId);
    animation.setAttributeNS(null, 'dur', getScaledAnimationDuration(durationMillis) + 'ms');
    animation.setAttributeNS(null, 'values', valuesString, dotRadius);
    animation.beginElement();
  }

  // ================ Plus to minus.
  var isIconMinus = false;
  document.getElementById("ic_plus_minus").addEventListener("click", function() {
    if (isIconMinus) {
      animateMinusToPlus();
    } else {
      animatePlusToMinus();
    }
    isIconMinus = !isIconMinus;
  });

  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function(event) {
    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
    var shouldShowPathPoints = pathPointsSelector.checked;
    var visibility = shouldShowPathPoints ? "visible" : "hidden";
    var endPointsPath = document.getElementById("plus_minus_end_points_path");
    endPointsPath.style.visibility = visibility;
    if (shouldShowPathPoints) {
      var dotPathString = createPathDotString(plusMinusPaths[isIconMinus ? 1 : 0], 0.4);
      endPointsPath.setAttribute('d', dotPathString);
    }
  });

  function animatePlusToMinus() {
    maybeAnimateRotation("plus_minus_container_rotate", 300, 180, 360);
    animatePathMorph("plus_to_minus_path_animation", 250);
    animatePoints("plus_minus_end_points_animation", 250, plusMinusPaths[0], plusMinusPaths[1], 0.4);
  }

  function animateMinusToPlus() {
    maybeAnimateRotation("plus_minus_container_rotate", 300, 0, 180);
    animatePathMorph("minus_to_plus_path_animation", 250);
    animatePoints("plus_minus_end_points_animation", 250, plusMinusPaths[1], plusMinusPaths[0], 0.4);
  }

  // ================ Cross to tick.
  var isIconTick = false;
  document.getElementById("ic_cross_tick").addEventListener("click", function() {
    if (isIconTick) {
      animateTickToCross();
    } else {
      animateCrossToTick();
    }
    isIconTick = !isIconTick;
  });

  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function(event) {
    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
    var shouldShowPathPoints = pathPointsSelector.checked;
    var visibility = shouldShowPathPoints ? "visible" : "hidden";
    var endPointsPath = document.getElementById("cross_tick_end_points_path");
    endPointsPath.style.visibility = visibility;
    if (shouldShowPathPoints) {
      var dotPathString = createPathDotString(crossTickPaths[isIconTick ? 1 : 0], 0.4);
      endPointsPath.setAttribute('d', dotPathString);
    }
  });

  function animateCrossToTick() {
    maybeAnimateRotation("cross_tick_container_rotate", 300, 180, 360);
    animatePathMorph("cross_to_tick_path_animation", 250);
    animatePoints("cross_tick_end_points_animation", 250, crossTickPaths[0], crossTickPaths[1], 0.4);
  }

  function animateTickToCross() {
    maybeAnimateRotation("cross_tick_container_rotate", 300, 0, 180);
    animatePathMorph("tick_to_cross_path_animation", 250);
    animatePoints("cross_tick_end_points_animation", 250, crossTickPaths[1], crossTickPaths[0], 0.4);
  }

  // ================ Drawer to arrow.
  var isIconDrawer = true;
  document.getElementById("ic_arrow_drawer").addEventListener("click", function() {
     if (isIconDrawer) {
      animateDrawerToArrow();
    } else {
      animateArrowToDrawer();
    }
    isIconDrawer = !isIconDrawer;
  });

  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function(event) {
    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
    var shouldShowPathPoints = pathPointsSelector.checked;
    var visibility = shouldShowPathPoints ? "visible" : "hidden";
    var endPointsPath = document.getElementById("arrow_drawer_end_points_path");
    endPointsPath.style.visibility = visibility;
    if (shouldShowPathPoints) {
      var dotPathString = createPathDotString(drawerArrowPaths[isIconDrawer ? 0 : 1], 0.4);
      endPointsPath.setAttribute('d', dotPathString);
    }
  });

  function animateDrawerToArrow() {
    maybeAnimateRotation("arrow_drawer_container_rotate", 300, 0, 180);
    animatePathMorph("drawer_to_arrow_path_animation", 300);
    animatePoints("drawer_arrow_end_points_animation", 300, drawerArrowPaths[0], drawerArrowPaths[1], 0.4);
  }

  function animateArrowToDrawer() {
    maybeAnimateRotation("arrow_drawer_container_rotate", 300, 180, 360);
    animatePathMorph("arrow_to_drawer_path_animation", 300);
    animatePoints("drawer_arrow_end_points_animation", 300, drawerArrowPaths[1], drawerArrowPaths[0], 0.4);
  }

  // ================ Overflow to arrow.
  var isIconOverflow = true;
  var overflowArrowDotRadius = 0.3;
  document.getElementById("ic_arrow_overflow").addEventListener("click", function() {
    if (isIconOverflow) {
      animateOverflowToArrow();
    } else {
      animateArrowToOverflow();
    }
    isIconOverflow = !isIconOverflow;
  });
  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function(event) {
    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
    var shouldShowPathPoints = pathPointsSelector.checked;
    var visibility = shouldShowPathPoints ? "visible" : "hidden";
    var endPointsPath1 = document.getElementById("arrow_overflow_end_points_path1");
    var endPointsPath2 = document.getElementById("arrow_overflow_end_points_path2");
    var endPointsPath3 = document.getElementById("arrow_overflow_end_points_path3");
    endPointsPath1.style.visibility = visibility;
    endPointsPath2.style.visibility = visibility;
    endPointsPath3.style.visibility = visibility;
    if (shouldShowPathPoints) {
      var dotPathString1 = createPathDotString(isIconOverflow ? overflowToArrowPaths[0][0] : arrowToOverflowPaths[0][0], overflowArrowDotRadius);
      var dotPathString2 = createPathDotString(isIconOverflow ? overflowToArrowPaths[1][0] : arrowToOverflowPaths[1][0], overflowArrowDotRadius);
      var dotPathString3 = createPathDotString(isIconOverflow ? overflowToArrowPaths[2][0] : arrowToOverflowPaths[2][0], overflowArrowDotRadius);
      endPointsPath1.setAttribute('d', dotPathString1);
      endPointsPath2.setAttribute('d', dotPathString2);
      endPointsPath3.setAttribute('d', dotPathString3);
    }
  });

  function animateOverflowToArrow() {
    animateRotationWithEasing("arrow_overflow_rotate_dot1", 400, 0, -45, "cubic-bezier(0, 0, 0, 1)");
    document.getElementById("arrow_overflow_translate_dot1").animate([{
      "transform": "translateX(0px) translateY(-6px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(300),
      fill: "forwards"
    });
    animateTranslationXWithEasing("arrow_overflow_pivot_dot1", 200, 0, 4.5, "cubic-bezier(0, 0, 0, 1)");
    animateTranslationX("arrow_overflow_translate_dot2", 250, 0, -8);
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
      duration: getScaledAnimationDuration(200),
      fill: "forwards"
    });
    animateRotationWithEasing("arrow_overflow_rotate_dot3", 400, 0, 45, "cubic-bezier(0, 0, 0, 1)");
    document.getElementById("arrow_overflow_translate_dot3").animate([{
      "transform": "translateX(0px) translateY(6px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(300),
      fill: "forwards"
    });
    animateTranslationXWithEasing("arrow_overflow_pivot_dot3", 200, 0, 4.5, "cubic-bezier(0, 0, 0, 1)");
    animatePathMorphWithValues("overflow_to_arrow_path1_animation", 300, overflowToArrowPaths[0]);
    animatePathMorphWithValues("overflow_to_arrow_path2_animation", 300, overflowToArrowPaths[1]);
    animatePathMorphWithValues("overflow_to_arrow_path3_animation", 300, overflowToArrowPaths[2]);
    var endPointsAnimation1 = document.getElementById("arrow_overflow_end_points1_animation");
    endPointsAnimation1.setAttributeNS(null, 'begin', '0ms');
    endPointsAnimation1.setAttributeNS(null, 'keyTimes', '0;0.25;0.5;0.75;1');
    endPointsAnimation1.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
    var endPointsAnimation2 = document.getElementById("arrow_overflow_end_points2_animation");
    endPointsAnimation2.setAttributeNS(null, 'keyTimes', '0;0.1667;0.3333;0.5;0.6666;0.83333;1');
    endPointsAnimation2.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
    endPointsAnimation2.setAttributeNS(null, 'values', overflowToArrowPaths[1]);
    var endPointsAnimation3 = document.getElementById("arrow_overflow_end_points3_animation");
    endPointsAnimation3.setAttributeNS(null, 'begin', '0ms');
    endPointsAnimation3.setAttributeNS(null, 'keyTimes', '0;0.25;0.5;0.75;1');
    endPointsAnimation3.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
    animatePointsWithList("arrow_overflow_end_points1_animation", 300, overflowToArrowPaths[0], overflowArrowDotRadius);
    animatePointsWithList("arrow_overflow_end_points2_animation", 300, overflowToArrowPaths[1], overflowArrowDotRadius);
    animatePointsWithList("arrow_overflow_end_points3_animation", 300, overflowToArrowPaths[2], overflowArrowDotRadius);
  }

  function animateArrowToOverflow() {
    animateRotation("arrow_overflow_rotate_dot1", 400, -45, 0);
    document.getElementById("arrow_overflow_translate_dot1").animate([{
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px) translateY(-6px)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(400),
      fill: "forwards"
    });
    animateTranslationX("arrow_overflow_pivot_dot1", 300, 4.5, 0);
    animateTranslationX("arrow_overflow_translate_dot2", 300, -8, 0);
    animateTranslationX("arrow_overflow_pivot_dot2", 216, 9, 0);
    animateRotation("arrow_overflow_rotate_dot3", 400, 45, 0);
    document.getElementById("arrow_overflow_translate_dot3").animate([{
      "transform": "translateX(-6.5px) translateY(0px)",
      offset: 0,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    }, {
      "transform": "translateX(0px) translateY(6px)",
      offset: 1
    }], {
      duration: getScaledAnimationDuration(400),
      fill: "forwards"
    });
    animateTranslationX("arrow_overflow_pivot_dot3", 300, 4.5, 0);
    document.getElementById("arrow_to_overflow_path1_animation").setAttributeNS(null, 'begin', '50ms');
    document.getElementById("arrow_to_overflow_path3_animation").setAttributeNS(null, 'begin', '50ms');
    animatePathMorphWithValues("arrow_to_overflow_path1_animation", 300, arrowToOverflowPaths[0]);
    animatePathMorphWithValues("arrow_to_overflow_path2_animation", 300, arrowToOverflowPaths[1]);
    animatePathMorphWithValues("arrow_to_overflow_path3_animation", 300, arrowToOverflowPaths[2]);

    var endPointsAnimation1 = document.getElementById("arrow_overflow_end_points1_animation");
    endPointsAnimation1.setAttributeNS(null, 'begin', '50ms');
    endPointsAnimation1.setAttributeNS(null, 'keyTimes', '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1');
    endPointsAnimation1.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
    var endPointsAnimation2 = document.getElementById("arrow_overflow_end_points2_animation");
    endPointsAnimation2.setAttributeNS(null, 'keyTimes', '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1');
    endPointsAnimation2.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
    var endPointsAnimation3 = document.getElementById("arrow_overflow_end_points3_animation");
    endPointsAnimation3.setAttributeNS(null, 'begin', '50ms');
    endPointsAnimation3.setAttributeNS(null, 'keyTimes', '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1');
    endPointsAnimation3.setAttributeNS(null, 'keySplines', '0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1;0 0 1 1');
    animatePointsWithList("arrow_overflow_end_points1_animation", 300, arrowToOverflowPaths[0], overflowArrowDotRadius);
    animatePointsWithList("arrow_overflow_end_points2_animation", 300, arrowToOverflowPaths[1], overflowArrowDotRadius);
    animatePointsWithList("arrow_overflow_end_points3_animation", 300, arrowToOverflowPaths[2], overflowArrowDotRadius);
  }

  // ================ Play/pause/stop.
  var currentPlayPauseStopIconIndex = 0;
  document.getElementById("ic_play_pause_stop").addEventListener("click", function() {
    var previousPlayPauseStopIconIndex = currentPlayPauseStopIconIndex;
    currentPlayPauseStopIconIndex = (currentPlayPauseStopIconIndex + 1) % 3;
    animatePlayPauseStop(previousPlayPauseStopIconIndex, currentPlayPauseStopIconIndex);
  });

  document.querySelector("input[id=pathMorphRotateCheckbox]").addEventListener("change", function(event) {
    var animateRotationSelector = document.querySelector("input[id=pathMorphRotateCheckbox]");
    var currentRotation = animateRotationSelector.checked && currentPlayPauseStopIconIndex == 0 ? 90 : 0;
    // TODO(alockwood): fix this hack...
    document.getElementById("play_pause_stop_rotate").animate([{
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

  document.querySelector("input[id=pathMorphShowPathPointsCheckbox]").addEventListener("change", function(event) {
    var pathPointsSelector = document.querySelector("input[id=pathMorphShowPathPointsCheckbox]");
    var shouldShowPathPoints = pathPointsSelector.checked;
    var visibility = shouldShowPathPoints ? "visible" : "hidden";
    var endPointsPath = document.getElementById("play_pause_stop_end_points_path");
    endPointsPath.style.visibility = visibility;
    if (shouldShowPathPoints) {
      var dotPathString = createPathDotString(playPauseStopPaths[currentPlayPauseStopIconIndex], 0.4);
      endPointsPath.setAttribute('d', dotPathString);
    }
  });

  function animatePlayPauseStop(oldIconIndex, newIconIndex) {
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
    maybeAnimateRotation("play_pause_stop_rotate", 200, startingRotation, startingRotation + 90);
    var oldPathString = playPauseStopPaths[oldIconIndex];
    var newPathString = playPauseStopPaths[newIconIndex];
    animatePathMorphWithValues("play_pause_stop_animation", 200, [oldPathString, newPathString]);
    animateTranslationX("play_pause_stop_translateX", 200);
    animatePoints("play_pause_stop_end_points_animation", 200, oldPathString, newPathString, 0.4);
  }
});
