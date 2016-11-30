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

var users = {};
socket.on('user_joined', function(userData){
  for(var i = 1; i < 9; i++)
    if(users[i] === undefined) {
      users[i] = userData;
      document.getElementById('image'+i).src = "http://eightbitavatar.herokuapp.com/?id="+userData.name+"&s="+userData.sex+"&size=100";
      document.getElementById('user'+i).innerHTML = userData.name;
      break;
    }
});

socket.on('client_drop', function(data){
  for(var i = 1; i < 11; i++)
    if(users[i] !== undefined && users[i].id == data.id) {
      console.log('found')
      users[i] = undefined;
      document.getElementById('image'+i).src = "/images/no_user.png";
      document.getElementById('user'+i).innerHTML = "";
      break;
    }
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
