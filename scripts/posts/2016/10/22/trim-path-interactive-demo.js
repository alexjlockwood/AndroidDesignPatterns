var trimPathStart = 0.0;
var trimPathEnd = 1.0;
var trimPathOffset = 0.0;

function updateTrimPathStart(value) {
  trimPathStart = value / 100;
  updateUi();
}

function updateTrimPathEnd(value) {
  trimPathEnd = value / 100;
  updateUi();
}

function updateTrimPathOffset(value) {
  trimPathOffset = value / 100;
  updateUi();
}

function updateSliderText() {
  document.getElementById("trimPathStartValue").innerHTML = trimPathStart;
  document.getElementById("trimPathEndValue").innerHTML = trimPathEnd;
  document.getElementById("trimPathOffsetValue").innerHTML = trimPathOffset;
}

function convertCurrentTrimToDashArray(pathLength) {
  // Calculate the normalized length of the trimmed path. If trimPathStart
  // is greater than trimPathEnd, then the result should be the combined
  // length of the two line segments: [trimPathStart,1] and [0,trimPathEnd].
  var trimPathLengthNormalized = trimPathEnd - trimPathStart;
  if (trimPathStart > trimPathEnd) {
    trimPathLengthNormalized++;
  }

  // Calculate the absolute length of the trim path by multiplying the
  // normalized length with the actual length of the path.
  var trimPathLength = trimPathLengthNormalized * pathLength;

  // Return the dash array. The first array element is the length of
  // the trimmed path and the second element is the gap, which is the
  // difference in length between the total path length and the trimmed
  // path length.
  return trimPathLength + "," + (pathLength - trimPathLength);
}

function convertCurrentTrimToDashOffset(pathLength) {
  // The amount to offset the path is equal to the trimPathStart plus
  // trimPathOffset. We mod the result because the trimmed path
  // should wrap around once it reaches 1.
  var trueTrimPathStart = (trimPathStart + trimPathOffset) % 1;

  // Return the dash offset.
  return pathLength * (1 - trueTrimPathStart);
}

function updateStrokePath() {
  var linePath = document.getElementById("line_path");
  var linePathLength = linePath.getTotalLength();
  var lineDashArray = convertCurrentTrimToDashArray(linePathLength);
  var lineDashOffset = convertCurrentTrimToDashOffset(linePathLength);
  linePath.setAttribute("stroke-dasharray", lineDashArray);
  linePath.setAttribute("stroke-dashoffset", lineDashOffset);
}

function updateUi() {
  updateStrokePath();
  updateSliderText();
}

