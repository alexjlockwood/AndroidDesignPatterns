document.addEventListener("DOMContentLoaded", function (event) {
    'use strict';

    var fastOutSlowIn = "cubic-bezier(0.4, 0, 0.2, 1)";
    var fastOutLinearIn = "cubic-bezier(0.4, 0, 1, 1)";
    var linearOutSlowIn = "cubic-bezier(0, 0, 0.2, 1)";

    function getScaledAnimationDuration(durationMillis) {
        var slowAnimationSelector = document.querySelector("input[id=trimPathSlowAnimationCheckbox]");
        var currentAnimationDurationFactor = slowAnimationSelector.checked ? 5 : 1;
        return durationMillis * currentAnimationDurationFactor;
    }

    function animateTrimPathStart(strokePathId, durationMillis, easingFunction, isAnimatingIn) {
        animateStrokeWithDelay(strokePathId, durationMillis, 0, easingFunction, isAnimatingIn);
    }

    function animateTrimPathStartWithDelay(strokePathId, durationMillis, startDelayMillis, easingFunction, isAnimatingIn) {
        var strokePath = document.getElementById(strokePathId);
        var pathLength = strokePath.getTotalLength();
        // TODO(alockwood): remove this hack...
        strokePath.animate([{
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? -pathLength : 0),
            offset: 0
        }, {
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? -pathLength : 0),
            offset: 1
        }], {
            duration: 0,
            fill: "forwards"
        });
        strokePath.animate([{
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? -pathLength : 0),
            easing: easingFunction,
            offset: 0
        }, {
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? 0 : -pathLength),
            offset: 1
        }], {
            duration: getScaledAnimationDuration(durationMillis),
            fill: "forwards",
            delay: getScaledAnimationDuration(startDelayMillis)
        });
    }

    function animateTrimPathEnd(strokePathId, durationMillis, easingFunction, isAnimatingIn) {
        animateStrokeWithDelay(strokePathId, durationMillis, 0, easingFunction, isAnimatingIn);
    }

    function animateTrimPathEndWithDelay(strokePathId, durationMillis, startDelayMillis, easingFunction, isAnimatingIn) {
        var strokePath = document.getElementById(strokePathId);
        var pathLength = strokePath.getTotalLength();
        // TODO(alockwood): remove this hack...
        strokePath.animate([{
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? pathLength : 0),
            offset: 0
        }, {
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? pathLength : 0),
            offset: 1
        }], {
            duration: 0,
            fill: "forwards"
        });
        strokePath.animate([{
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? pathLength : 0),
            easing: easingFunction,
            offset: 0
        }, {
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? 0 : pathLength),
            offset: 1
        }], {
            duration: getScaledAnimationDuration(durationMillis),
            fill: "forwards",
            delay: getScaledAnimationDuration(startDelayMillis)
        });
    }

    document.querySelector("input[id=trimPathShowTrimPathsCheckbox]").addEventListener("change", function (event) {
        var visibility = document.querySelector("input[id=trimPathShowTrimPathsCheckbox]").checked ? "visible" : "hidden";
        var fingerprintDebugPaths = document.getElementsByClassName("delightIconFingerPrintStrokePathDebug");
        for (var i = 0; i < fingerprintDebugPaths.length; i++) {
            fingerprintDebugPaths.item(i).style.visibility = visibility;
        }
        var handwritingDebugPaths = document.getElementsByClassName("delightIconHandwritingStrokePathDebug");
        for (var i = 0; i < handwritingDebugPaths.length; i++) {
            handwritingDebugPaths.item(i).style.visibility = visibility;
        }
        var searchToBackDebugPaths = document.getElementsByClassName("delightIconSearchToBackStrokePathDebug");
        for (var i = 0; i < searchToBackDebugPaths.length; i++) {
            searchToBackDebugPaths.item(i).style.visibility = visibility;
        }
    });

    // =============== Search to back animation.
    var isBackArrow = false;
    document.getElementById("ic_search_back").addEventListener("click", function () {
        animateArrowHead(!isBackArrow);
        animateSearchCircle(isBackArrow);
        animateStem(!isBackArrow);
        isBackArrow = !isBackArrow;
    });

    function animateStem(isAnimatingToBack) {
        var fastOutSlowInFunction = BezierEasing(0.4, 0, 0.2, 1);
        var stemPath = document.getElementById("stem");
        var pathLength = stemPath.getTotalLength();
        var keyFrames = [];
        if (isAnimatingToBack) {
            for (var i = 0; i < 600; i += 16) {
                var trimPathStart = fastOutSlowInFunction(i / 600) * 0.75;
                var trimPathEnd = fastOutSlowInFunction(Math.min(i, 450) / 450) * (1 - 0.185) + 0.185;
                var trimPathLength = trimPathEnd - trimPathStart;
                keyFrames.push({
                    strokeDasharray: (trimPathLength * pathLength) + "," + pathLength,
                    strokeDashoffset: (-trimPathStart * pathLength),
                    easing: "linear",
                    offset: (i / 600)
                });
            }
            keyFrames.push({
                strokeDasharray: (0.25 * pathLength) + "," + pathLength,
                strokeDashoffset: (-0.75 * pathLength),
                offset: 1
            });
            return stemPath.animate(keyFrames, {
                duration: getScaledAnimationDuration(600),
                fill: "forwards"
            });
        } else {
            for (var i = 0; i < 600; i += 16) {
                var trimPathStart = (1 - fastOutSlowInFunction(Math.min(i, 450) / 450)) * 0.75;
                var trimPathEnd = 1 - fastOutSlowInFunction(i / 600) * 0.815;
                var trimPathLength = trimPathEnd - trimPathStart;
                keyFrames.push({
                    strokeDasharray: (trimPathLength * pathLength) + "," + pathLength,
                    strokeDashoffset: (-trimPathStart * pathLength),
                    easing: "linear",
                    offset: (i / 600)
                });
            }
            keyFrames.push({
                strokeDasharray: (0.185 * pathLength) + "," + pathLength,
                strokeDashoffset: 0,
                offset: 1
            });
            return stemPath.animate(keyFrames, {
                duration: getScaledAnimationDuration(600),
                fill: "forwards"
            });
        }
    }

    function animateSearchCircle(isAnimatingIn) {
        var searchCirclePath = document.getElementById("search_circle");
        var pathLength = searchCirclePath.getTotalLength();
        searchCirclePath.animate([{
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? pathLength : 0),
            easing: fastOutSlowIn,
            offset: 0
        }, {
            strokeDasharray: pathLength,
            strokeDashoffset: (isAnimatingIn ? 0 : pathLength),
            offset: 1
        }], {
            duration: getScaledAnimationDuration(250),
            fill: "forwards",
            delay: getScaledAnimationDuration(isAnimatingIn ? 300 : 0)
        });
    }

    function animateArrowHead(isAnimatingIn) {
        var arrowHeadGroup = document.getElementById("arrow_head");
        var arrowHeadTop = document.getElementById("arrow_head_top");
        var arrowHeadBottom = document.getElementById("arrow_head_bottom");
        var arrowHeadTopPathLength = arrowHeadTop.getTotalLength();
        var arrowHeadBottomPathLength = arrowHeadBottom.getTotalLength();
        arrowHeadGroup.animate([{
            transform: (isAnimatingIn ? "translate(8px,0px)" : "translate(0px,0px)"),
            easing: (isAnimatingIn ? linearOutSlowIn : fastOutLinearIn),
            offset: 0
        }, {
            transform: (isAnimatingIn ? "translate(0px,0px)" : "translate(24px,0px)"),
            offset: 1
        }], {
            duration: getScaledAnimationDuration(250),
            fill: "forwards",
            delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
        });
        arrowHeadTop.animate([{
            strokeDasharray: arrowHeadTopPathLength,
            strokeDashoffset: (isAnimatingIn ? arrowHeadTopPathLength : 0),
            easing: fastOutSlowIn,
            offset: 0
        }, {
            strokeDasharray: arrowHeadTopPathLength,
            strokeDashoffset: (isAnimatingIn ? 0 : arrowHeadTopPathLength),
            offset: 1
        }], {
            duration: getScaledAnimationDuration(250),
            fill: "forwards",
            delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
        });
        arrowHeadBottom.animate([{
            strokeDasharray: arrowHeadBottomPathLength,
            strokeDashoffset: (isAnimatingIn ? arrowHeadBottomPathLength : 0),
            easing: fastOutSlowIn,
            offset: 0
        }, {
            strokeDasharray: arrowHeadBottomPathLength,
            strokeDashoffset: (isAnimatingIn ? 0 : arrowHeadBottomPathLength),
            offset: 1
        }], {
            duration: getScaledAnimationDuration(250),
            fill: "forwards",
            delay: getScaledAnimationDuration((isAnimatingIn ? 350 : 0))
        });
    }

    // =============== Handwriting animation.
    var currentHandwritingAnimations = [];
    document.getElementById("ic_android_handwriting").addEventListener("click", function () {
        for (var i = 0; i < currentHandwritingAnimations.length; i++) {
            currentHandwritingAnimations[i].cancel();
        }
        currentHandwritingAnimations = [];
        resetAllStrokes();
        animateHandwritingStroke("andro", 1000, 0, fastOutLinearIn);
        animateHandwritingStroke("id", 250, 1050, fastOutSlowIn);
        animateHandwritingStroke("a", 50, 1300, fastOutSlowIn);
        animateHandwritingStroke("i1_dot", 50, 1400, fastOutSlowIn);
    });

    function resetAllStrokes() {
        var ids = ["andro", "id", "a", "i1_dot"];
        for (var i = 0; i < ids.length; i++) {
            var path = document.getElementById(ids[i]);
            var pathLength = path.getTotalLength();
            // TODO(alockwood): fix this hack
            currentHandwritingAnimations.push(path.animate([{
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                offset: 0,
            }, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                offset: 1
            }], {
                duration: 0,
                fill: "forwards"
            }));
        }
    }

    function animateHandwritingStroke(pathId, duration, startDelay, easingCurve) {
        var path = document.getElementById(pathId);
        var pathLength = path.getTotalLength();
        path.animate([{
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
            easing: easingCurve,
            offset: 0,
        }, {
            strokeDasharray: pathLength,
            strokeDashoffset: 0,
            offset: 1
        }], {
            duration: getScaledAnimationDuration(duration),
            fill: "forwards",
            delay: getScaledAnimationDuration(startDelay)
        });
    }

    // =============== Fingerprint animation.
    var isFingerprintVisible = true;
    document.getElementById("ic_fingerprint").addEventListener("click", function () {
        animateFingerprint(!isFingerprintVisible);
        isFingerprintVisible = !isFingerprintVisible;
    });

    function animateFingerprint(isAnimatingIn) {
        if (isAnimatingIn) {
            animateTrimPathStartWithDelay("ridge_5_path", 180, 20, "cubic-bezier(0.5, 0.5, 1, 1)", true);
            animateTrimPathStartWithDelay("ridge_7_path", 160, 10, "cubic-bezier(0.5, 0.5, 1, 1)", true);
            animateTrimPathEndWithDelay("ridge_6_path", 190, 0, "cubic-bezier(0.5, 0.5, 1, 1)", true);
            animateTrimPathEndWithDelay("ridge_2_path", 140, 0, "cubic-bezier(0.5, 0, 1, 1)", true);
            animateTrimPathStartWithDelay("ridge_1_path", 216, 60, "cubic-bezier(0.5, 0.5, 1, 1)", true);
        } else {
            animateTrimPathEndWithDelay("ridge_5_path", 383, 33, "cubic-bezier(0, 0.29, 1, 1)", false);
            animateTrimPathEndWithDelay("ridge_7_path", 483, 83, "cubic-bezier(0, 0.5, 1, 1)", false);
            animateTrimPathStartWithDelay("ridge_6_path", 549, 50, "cubic-bezier(0, 0.5, 1, 1)", false);
            animateTrimPathStartWithDelay("ridge_2_path", 400, 216, "cubic-bezier(0, 0.5, 1, 1)", false);
            animateTrimPathEndWithDelay("ridge_1_path", 383, 316, "cubic-bezier(0, 0.5, 1, 1)", false);
        }
    }

    // Google IO 2016 animation.
    var currentIo16Animations = [];
    var ioOne1 = document.getElementById("io16_one_1");
    var ioOne2 = document.getElementById("io16_one_2");
    var ioOne3 = document.getElementById("io16_one_3");
    var ioOne4 = document.getElementById("io16_one_4");
    var ioSix1 = document.getElementById("io16_six_1");
    var ioSix2 = document.getElementById("io16_six_2");
    var ioSix3 = document.getElementById("io16_six_3");
    var ioSix4 = document.getElementById("io16_six_4");
    var onePathLength = ioOne1.getTotalLength();
    var sixPathLength = ioSix1.getTotalLength();
    var oneStrokeDashArray = (onePathLength / 4) + "," + (onePathLength * 3 / 4);
    var sixStrokeDashArray = (sixPathLength / 4) + "," + (sixPathLength * 3 / 4);
    ioOne1.setAttribute("stroke-dasharray", oneStrokeDashArray);
    ioOne2.setAttribute("stroke-dasharray", oneStrokeDashArray);
    ioOne3.setAttribute("stroke-dasharray", oneStrokeDashArray);
    ioOne4.setAttribute("stroke-dasharray", oneStrokeDashArray);
    ioSix1.setAttribute("stroke-dasharray", sixStrokeDashArray);
    ioSix2.setAttribute("stroke-dasharray", sixStrokeDashArray);
    ioSix3.setAttribute("stroke-dasharray", sixStrokeDashArray);
    ioSix4.setAttribute("stroke-dasharray", sixStrokeDashArray);
    ioOne1.setAttribute("stroke-dashoffset", "0");
    ioOne2.setAttribute("stroke-dashoffset", "" + (onePathLength * 0.25));
    ioOne3.setAttribute("stroke-dashoffset", "" + (onePathLength * 0.5));
    ioOne4.setAttribute("stroke-dashoffset", "" + (onePathLength * 0.75));
    ioSix1.setAttribute("stroke-dashoffset", "0");
    ioSix2.setAttribute("stroke-dashoffset", "" + (sixPathLength * 0.25));
    ioSix3.setAttribute("stroke-dashoffset", "" + (sixPathLength * 0.5));
    ioSix4.setAttribute("stroke-dashoffset", "" + (sixPathLength * 0.75));
    beginIo16Animation();

    function beginIo16Animation() {
        var oneDurationMillis = getScaledAnimationDuration(4000);
        var sixDurationMillis = getScaledAnimationDuration(5000);
        currentIo16Animations.push(animateIo16Stroke(ioOne1, oneDurationMillis, 0));
        currentIo16Animations.push(animateIo16Stroke(ioOne2, oneDurationMillis, onePathLength / 4));
        currentIo16Animations.push(animateIo16Stroke(ioOne3, oneDurationMillis, onePathLength / 2));
        currentIo16Animations.push(animateIo16Stroke(ioOne4, oneDurationMillis, onePathLength * 3 / 4));
        currentIo16Animations.push(animateIo16Stroke(ioSix1, sixDurationMillis, 0));
        currentIo16Animations.push(animateIo16Stroke(ioSix2, sixDurationMillis, sixPathLength / 4));
        currentIo16Animations.push(animateIo16Stroke(ioSix3, sixDurationMillis, sixPathLength / 2))
        currentIo16Animations.push(animateIo16Stroke(ioSix4, sixDurationMillis, sixPathLength * 3 / 4));
    }

    function animateIo16Stroke(element, durationMillis, startingStrokeDashOffset) {
        return element.animate([{
            strokeDashoffset: "" + startingStrokeDashOffset,
            easing: "linear",
            offset: 0
        }, {
            strokeDashoffset: "" + (startingStrokeDashOffset + element.getTotalLength()),
            easing: "linear",
            offset: 1
        }], {
            duration: getScaledAnimationDuration(durationMillis),
            fill: "forwards",
            iterations: "Infinity"
        });
    }

    document.querySelector("input[id=trimPathSlowAnimationCheckbox]").addEventListener("change", function (event) {
        for (var i = 0; i < currentIo16Animations.length; i++) {
            currentIo16Animations[i].cancel();
        }
        currentIo16Animations = [];
        beginIo16Animation();
    });
});
