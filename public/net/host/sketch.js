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
  var height  = window.innerHeight;
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
    clickX.push(data.clickX);
    clickY.push(data.clickY);
    clickDrag.push(data.clickDrag);
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
});
