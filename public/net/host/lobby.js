var socket = io();

socket.emit('create_lobby', function(lobbyID) {
  document.getElementById("roomCode").innerHTML = lobbyID;
});

var context = document.getElementById('sheet').getContext("2d");
var canvas = document.getElementById('sheet');
context = canvas.getContext("2d");
context.strokeStyle = "#ff0000";
context.lineJoin = "round";
context.lineWidth = 5;

var clickX = [];
var clickY = [];
var clickDrag = [];
var paint;

var users = [];
socket.on('user_joined', function(userData){
  // html render user joined
  users.push(userData);

  document.getElementById('image'+users.length).src = "http://eightbitavatar.herokuapp.com/?id="+userData.name+"&s="+userData.sex+"&size=200";
  document.getElementById('user'+users.length).innerHTML = userData.name;
});

socket.on('draw_pic', function(data){
  clickX = data.clickX;
  clickY = data.clickY;
  clickDrag = data.clickDrag;
  redraw();
});

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
