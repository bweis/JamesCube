var socket  = io();

var canvas;
var context;
var width;
var height;

var clickX = [];
var clickY = [];
var clickDrag = [];
var paint;
var redrawStatus = true;

document.addEventListener("DOMContentLoaded", function() {
  configWindow();
  createHandlers();

  // prevent scroll to refresh
  $('body').delegate('*', 'touchstart',function(e) {
          e.preventDefault();
  });
});

window.onresize = resizeWindow;

function resizeWindow() {
  redrawStatus = true;

  configWindow();
  redraw();
}

function configWindow() {
  var mouse = {
    click: false,
    move: false,
    pos: {x:0, y:0},
    pos_prev: false
  };
  // get canvas element and create context
  canvas  = document.getElementById('drawing');
  context = canvas.getContext('2d');
  width   = window.innerWidth;
  height  = window.innerHeight - $('#title').height();

  context.strokeStyle = "#000";
  context.lineJoin = "round";
  context.lineWidth = 5;

  // set canvas to full browser width/height
  canvas.width = width;
  canvas.height = height;

  document.getElementById( "drawing" ).onwheel = function(event){
    event.preventDefault();
  };
  document.getElementById( "drawing" ).onmousewheel = function(event){
    event.preventDefault();
  };
}

function createHandlers() {
  function addClick(x, y, dragging) {

    x = x/width;
    y = y/height;

    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);

    socket.emit('draw_line', {clickX: x, clickY: y, clickDrag: dragging, redraw: redrawStatus});
    redrawStatus = false;
  }

  function mouseDownEventHandler(e) {
    paint = true;
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    if (paint) {
      addClick(x, y, false);
      drawNew();
    }
  }

  function touchstartEventHandler(e) {
    paint = true;
    if (paint) {
      addClick(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop, false);
      drawNew();
    }
  }

  function mouseUpEventHandler(e) {
    context.closePath();
    paint = false;
  }

  function mouseMoveEventHandler(e) {
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;
    if (paint) {
      addClick(x, y, true);
      drawNew();
    }
  }

  function touchMoveEventHandler(e) {
    if (paint) {
      addClick(e.touches[0].pageX - canvas.offsetLeft, e.touches[0].pageY - canvas.offsetTop, true);
      drawNew();
    }
  }

  function setUpHandler(isMouseandNotTouch, detectEvent) {
    removeRaceHandlers();
    if (isMouseandNotTouch) {
      canvas.addEventListener('mouseup', mouseUpEventHandler);
      canvas.addEventListener('mousemove', mouseMoveEventHandler);
      canvas.addEventListener('mousedown', mouseDownEventHandler);
      mouseDownEventHandler(detectEvent);
    } else {
      canvas.addEventListener('touchstart', touchstartEventHandler);
      canvas.addEventListener('touchmove', touchMoveEventHandler);
      canvas.addEventListener('touchend', mouseUpEventHandler);
      touchstartEventHandler(detectEvent);
    }
  }

  function mouseWins(e) {
    setUpHandler(true, e);
  }

  function touchWins(e) {
    setUpHandler(false, e);
  }

  function removeRaceHandlers() {
    canvas.removeEventListener('mousedown', mouseWins);
    canvas.removeEventListener('touchstart', touchWins);
  }

  canvas.addEventListener('mousedown', mouseWins);
  canvas.addEventListener('touchstart', touchWins);
}

/**
* Redraw the complete canvas.
*/
function redraw() {
  // Clears the canvas
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  for (var i = 0; i < clickX.length; i += 1) {
    if (!clickDrag[i] && i == 0) {
      context.beginPath();
      context.moveTo(clickX[i] * width, clickY[i] * height);
      context.stroke();
    } else if (!clickDrag[i] && i > 0) {
      context.closePath();

      context.beginPath();
      context.moveTo(clickX[i] * width, clickY[i] * height);
      context.stroke();
    } else {
      context.lineTo(clickX[i] * width, clickY[i] * height);
      context.stroke();
    }
  }
}

/**
* Draw the newly added point.
* @return {void}
*/
function drawNew() {
  var i = clickX.length - 1
  if (!clickDrag[i]) {
    if (clickX.length == 0) {
      context.beginPath();
      context.moveTo(clickX[i] * width, clickY[i] * height);
      context.stroke();
    } else {
      context.closePath();

      context.beginPath();
      context.moveTo(clickX[i] * width, clickY[i] * height);
      context.stroke();
    }
  } else {
    context.lineTo(clickX[i] * width, clickY[i] * height);
    context.stroke();
  }
}
