// document.addEventListener("DOMContentLoaded", function() {
//   var mouse = {
//     click: false,
//     move: false,
//     pos: {x:0, y:0},
//     pos_prev: false
//   };
//   // get canvas element and create context
//   var canvas  = document.getElementById('drawing');
//   var context = canvas.getContext('2d');
//   var width   = window.innerWidth;
//   var height  = window.innerHeight - $('#title').height();
//   var socket  = io();
//
//   var drawPoints = [];
//   var paint;
//
//   context.strokeStyle = "#000";
//   context.lineJoin = "round";
//   context.lineWidth = 5;
//
//   // set canvas to full browser width/height
//   canvas.width = width;
//   canvas.height = height;
//
//   socket.on('draw_line', function(data) {
//     console.log("----");
//     console.log(width);
//     console.log(height);
//     var localRatio = width/height;
//     var remoteRatio = data.drawPoint.width/data.drawPoint.height;
//     console.log(localRatio);
//     console.log(remoteRatio);
//     if(localRatio >= 1) {
//       canvas.width = remoteRatio * height;
//       canvas.height = height;
//     } else {
//       console.log("dd");
//     }// else {
//     //   canvas.width = width;
//     //   canvas.height = data.drawPoint.height / data.drawPoint.width * width;
//     // }
//     // if(localRatio >= 1 && remoteRatio <= 1) {
//     //   canvas.width = data.drawPoint.width / data.drawPoint.height * width;
//     //   canvas.height = height;
//     // } else {
//     //   canvas.width = width;
//     //   canvas.height = data.drawPoint.height / data.drawPoint.width * height;
//     //
//     // }
//     console.log(canvas.width/canvas.height);
//
//     drawPoints.push(data.drawPoint);
//     if(data.redraw) {
//       //redraw();
//     } else {
//       //drawNew();
//     }
//   });
//
//   function drawNew() {
//     var i = drawPoints.length - 1;
//     var dP = drawPoints[i];
//     if (!dP.drag) {
//       if (drawPoints.length == 0) {
//         context.beginPath();
//         context.moveTo(dP.x, dP.y);
//         context.stroke();
//       } else {
//         context.closePath();
//
//         context.beginPath();
//         context.moveTo(dP.x, dP.y);
//         context.stroke();
//       }
//     } else {
//       context.lineTo(dP.x, dP.y);
//       context.stroke();
//     }
//   }
//
//   // function redraw() {
//   //   // Clears the canvas
//   //   context.clearRect(0, 0, context.canvas.width, context.canvas.height);
//   //
//   //   for (var i = 0; i < clickX.length; i += 1) {
//   //     if (!clickDrag[i] && i == 0) {
//   //       context.beginPath();
//   //       context.moveTo(clickX[i], clickY[i]);
//   //       context.stroke();
//   //     } else if (!clickDrag[i] && i > 0) {
//   //       context.closePath();
//   //
//   //       context.beginPath();
//   //       context.moveTo(clickX[i], clickY[i]);
//   //       context.stroke();
//   //     } else {
//   //       context.lineTo(clickX[i], clickY[i]);
//   //       context.stroke();
//   //     }
//   //   }
//   // }
// });
