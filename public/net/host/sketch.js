document.addEventListener("DOMContentLoaded", function() {
  var mouse = {
    click: false,
    move: false,
    pos: {x:0, y:0},
    pos_prev: false
  };
  // get canvas element and create context
  var canvas  = document.getElementById('drawing');
  var context = canvas.getContext('2d');
  var width   = window.innerWidth;
  var height  = window.innerHeight - $('#title').height();
  var socket  = io();

  var clickX = [];
  var clickY = [];
  var clickDrag = [];
  var paint;

  context.strokeStyle = "#000";
  context.lineJoin = "round";
  context.lineWidth = 5;

  // set canvas to full browser width/height
  canvas.width = width;
  canvas.height = height;

  socket.on('draw_line', function(data) {
    clickX.push(data.clickX * width);
    clickY.push(data.clickY * height);
    clickDrag.push(data.clickDrag);
    if(data.redraw)
      redraw();
    else
      drawNew();
  });

  function drawNew() {
    var i = clickX.length - 1
    if (!clickDrag[i]) {
      if (clickX.length == 0) {
        context.beginPath();
        context.moveTo(clickX[i], clickY[i]);
        context.stroke();
      } else {
        context.closePath();

        context.beginPath();
        context.moveTo(clickX[i], clickY[i]);
        context.stroke();
      }
    } else {
      context.lineTo(clickX[i], clickY[i]);
      context.stroke();
    }
  }

  function redraw() {
    // Clears the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (var i = 0; i < clickX.length; i += 1) {
      if (!clickDrag[i] && i == 0) {
        context.beginPath();
        context.moveTo(clickX[i], clickY[i]);
        context.stroke();
      } else if (!clickDrag[i] && i > 0) {
        context.closePath();

        context.beginPath();
        context.moveTo(clickX[i], clickY[i]);
        context.stroke();
      } else {
        context.lineTo(clickX[i], clickY[i]);
        context.stroke();
      }
    }
  }
});
