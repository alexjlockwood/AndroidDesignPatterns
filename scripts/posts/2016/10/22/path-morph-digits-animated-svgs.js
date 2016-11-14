document.addEventListener("DOMContentLoaded", function(event) {
  var DIGIT_PATHS = [
    "M 0.24585635359116,0.552486187845304\
 C 0.24585635359116,0.331491712707182 0.370165745856354,0.0994475138121547 0.552486187845304,0.0994475138121547\
 C 0.734806629834254,0.0994475138121547 0.861878453038674,0.331491712707182 0.861878453038674,0.552486187845304\
 C 0.861878453038674,0.773480662983425 0.734806629834254,0.994475138121547 0.552486187845304,0.994475138121547\
 C 0.370165745856354,0.994475138121547 0.24585635359116,0.773480662983425 0.24585635359116,0.552486187845304",
    "M 0.425414364640884,0.113259668508287\
 C 0.425414364640884,0.113259668508287 0.577348066298343,0.113259668508287 0.577348066298343,0.113259668508287\
 C 0.577348066298343,0.113259668508287 0.577348066298343,1 0.577348066298343,1\
 C 0.577348066298343,1 0.577348066298343,1 0.577348066298343,1\
 C 0.577348066298343,1 0.577348066298343,1 0.577348066298343,1",
    "M 0.30939226519337,0.331491712707182\
 C 0.325966850828729,0.0110497237569061 0.790055248618785,0.0220994475138122 0.798342541436464,0.337016574585635\
 C 0.798342541436464,0.430939226519337 0.718232044198895,0.541436464088398 0.596685082872928,0.674033149171271\
 C 0.519337016574586,0.762430939226519 0.408839779005525,0.856353591160221 0.314917127071823,0.977900552486188\
 C 0.314917127071823,0.977900552486188 0.812154696132597,0.977900552486188 0.812154696132597,0.977900552486188",
    "M 0.361878453038674,0.298342541436464\
 C 0.348066298342541,0.149171270718232 0.475138121546961,0.0994475138121547 0.549723756906077,0.0994475138121547\
 C 0.861878453038674,0.0994475138121547 0.806629834254144,0.530386740331492 0.549723756906077,0.530386740331492\
 C 0.87292817679558,0.530386740331492 0.828729281767956,0.994475138121547 0.552486187845304,0.994475138121547\
 C 0.298342541436464,0.994475138121547 0.30939226519337,0.828729281767956 0.312154696132597,0.790055248618785",
    "M 0.856353591160221,0.806629834254144\
 C 0.856353591160221,0.806629834254144 0.237569060773481,0.806629834254144 0.237569060773481,0.806629834254144\
 C 0.237569060773481,0.806629834254144 0.712707182320442,0.138121546961326 0.712707182320442,0.138121546961326\
 C 0.712707182320442,0.138121546961326 0.712707182320442,0.806629834254144 0.712707182320442,0.806629834254144\
 C 0.712707182320442,0.806629834254144 0.712707182320442,0.988950276243094 0.712707182320442,0.988950276243094",
    "M 0.806629834254144,0.110497237569061\
 C 0.502762430939227,0.110497237569061 0.502762430939227,0.110497237569061 0.502762430939227,0.110497237569061\
 C 0.397790055248619,0.430939226519337 0.397790055248619,0.430939226519337 0.397790055248619,0.430939226519337\
 C 0.535911602209945,0.364640883977901 0.801104972375691,0.469613259668508 0.801104972375691,0.712707182320442\
 C 0.773480662983425,1.01104972375691 0.375690607734807,1.0939226519337 0.248618784530387,0.850828729281768",
    "M 0.607734806629834,0.110497237569061\
 C 0.607734806629834,0.110497237569061 0.607734806629834,0.110497237569061 0.607734806629834,0.110497237569061\
 C 0.392265193370166,0.43646408839779 0.265193370165746,0.50828729281768 0.25414364640884,0.696132596685083\
 C 0.287292817679558,1.13017127071823 0.87292817679558,1.06077348066298 0.845303867403315,0.696132596685083\
 C 0.806629834254144,0.364640883977901 0.419889502762431,0.353591160220994 0.295580110497238,0.552486187845304",
    "M 0.259668508287293,0.116022099447514\
 C 0.259668508287293,0.116022099447514 0.87292817679558,0.116022099447514 0.87292817679558,0.116022099447514\
 C 0.87292817679558,0.116022099447514 0.66666666666667,0.41068139962 0.66666666666667,0.41068139962\
 C 0.66666666666667,0.41068139962 0.460405157,0.7053406998 0.460405157,0.7053406998\
 C 0.460405157,0.7053406998 0.25414364640884,1 0.25414364640884,1",
    "M 0.558011049723757,0.530386740331492\
 C 0.243093922651934,0.524861878453039 0.243093922651934,0.104972375690608 0.558011049723757,0.104972375690608\
 C 0.850828729281768,0.104972375690608 0.850828729281768,0.530386740331492 0.558011049723757,0.530386740331492\
 C 0.243093922651934,0.530386740331492 0.198895027624309,0.988950276243094 0.558011049723757,0.988950276243094\
 C 0.850828729281768,0.988950276243094 0.850828729281768,0.530386740331492 0.558011049723757,0.530386740331492",
    "M 0.80939226519337,0.552486187845304\
 C 0.685082872928177,0.751381215469613 0.298342541436464,0.740331491712707 0.259668508287293,0.408839779005525\
 C 0.232044198895028,0.0441988950276243 0.81767955801105,-0.0441988950276243 0.850828729281768,0.408839779005525\
 C 0.839779005524862,0.596685082872928 0.712707182320442,0.668508287292818 0.497237569060773,0.994475138121547\
 C 0.497237569060773,0.994475138121547 0.497237569060773,0.994475138121547 0.497237569060773,0.994475138121547"
  ];

  var currentAnimationDurationFactor = 1;
  var countdownDigitsPath = document.getElementById("countdown_digits");
  var countdownDigitsCp1Path = document.getElementById("countdown_digits_cp1");
  var countdownDigitsCp2Path = document.getElementById("countdown_digits_cp2");
  var countdownDigitsEndPath = document.getElementById("countdown_digits_end");
  if (countdownDigitsPath == null) {
    // TODO(alockwood): figure out a better way to do this...
    return;
  }

  countdownDigitsPath.setAttribute("d", DIGIT_PATHS[0]);

  var currentPoints = getPointsInPath(0);
  countdownDigitsCp1Path.setAttribute("d", currentPoints[0]);
  countdownDigitsCp2Path.setAttribute("d", currentPoints[1]);
  countdownDigitsEndPath.setAttribute("d", currentPoints[2]);

  var numClicks = 0;
  var showControlPointsSelector = document.querySelector("input[id=pathMorphShowControlPointsCheckbox]");
  showControlPointsSelector.addEventListener("change", function(event) {
    var visibility = showControlPointsSelector.checked ? "visible" : "hidden";
    countdownDigitsCp1Path.style.visibility = visibility;
    countdownDigitsCp2Path.style.visibility = visibility;
    animateCount(numClicks % 10, numClicks % 10);
  });
  var showEndPointsSelector = document.querySelector("input[id=pathMorphShowEndPointsCheckbox]");
  showEndPointsSelector.addEventListener("change", function(event) {
    countdownDigitsEndPath.style.visibility = showEndPointsSelector.checked ? "visible" : "hidden";
    animateCount(numClicks % 10, numClicks % 10);
  });
  var slowAnimationSelector = document.querySelector("input[id=pathMorphDigitsSlowAnimationCheckbox]");
  slowAnimationSelector.addEventListener("change", function(event) {
    if (slowAnimationSelector.checked) {
      currentAnimationDurationFactor = 5;
    } else {
      currentAnimationDurationFactor = 1;
    }
  });
  document.getElementById("ic_countdown").addEventListener("click", function() {
    animateCount(numClicks % 10, (numClicks + 1) % 10);
    numClicks += 1;
  });

  function createEllipsePath(radius) {
    var r = radius;
    var d = radius * 2;
    return "m-" + r + ",0a" + r + "," + r + ",0,1,0," + d + ",0a " + r + "," + r + ",0,1,0-" + d + ",0z";
  }

  function createControlPointPath() {
    return createEllipsePath(0.012);
  }

  function createEndPointPath() {
    return createEllipsePath(0.025);
  }

  function getPointsInPath(digit) {
    var digitPath = DIGIT_PATHS[digit];
    var numbers = digitPath.split(" ");
    var xcoords = [];
    var ycoords = [];
    var numPoints = 0;
    for (i = 0; i < numbers.length; i++) {
      var xy = numbers[i].split(",");
      if (xy.length == 2) {
        xcoords.push(xy[0]);
        ycoords.push(xy[1]);
        numPoints++;
      }
    }
    var cp1Path = "";
    var cp2Path = "";
    var endPath = "";
    var controlPointPath = createControlPointPath();
    var endPointPath = createEndPointPath();
    for (i = 0; i < numPoints; i++) {
      var point = "M" + xcoords[i] + "," + ycoords[i];
      if (i % 3 == 0) {
        endPath += point + endPointPath;
      } else if (i % 3 == 1) {
        cp1Path += point + controlPointPath;
      } else {
        cp2Path += point + controlPointPath;
      }
    }
    return [cp1Path, cp2Path, endPath];
  }

  function animateCount(currentDigit, nextDigit) {
    var duration = 300 * currentAnimationDurationFactor;

    var countdownDigitsAnimation = document.getElementById("countdown_digits_animation");
    countdownDigitsAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    countdownDigitsAnimation.setAttributeNS(null, 'values', DIGIT_PATHS[currentDigit] + ";" + DIGIT_PATHS[nextDigit]);
    countdownDigitsAnimation.beginElement();

    var currentPoints = getPointsInPath(currentDigit);
    var nextPoints = getPointsInPath(nextDigit);

    var cp1Animation = document.getElementById("countdown_digits_cp1_animation");
    cp1Animation.setAttributeNS(null, 'dur', duration + 'ms');
    cp1Animation.setAttributeNS(null, 'values', currentPoints[0] + ";" + nextPoints[0]);
    cp1Animation.beginElement();

    var cp2Animation = document.getElementById("countdown_digits_cp2_animation");
    cp2Animation.setAttributeNS(null, 'dur', duration + 'ms');
    cp2Animation.setAttributeNS(null, 'values', currentPoints[1] + ";" + nextPoints[1]);
    cp2Animation.beginElement();

    var endAnimation = document.getElementById("countdown_digits_end_animation");
    endAnimation.setAttributeNS(null, 'dur', duration + 'ms');
    endAnimation.setAttributeNS(null, 'values', currentPoints[2] + ";" + nextPoints[2]);
    endAnimation.beginElement();
  }
});

