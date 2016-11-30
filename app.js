var express = require('express');
var cfenv = require('cfenv');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var device = require('express-device');
var rs = require('randomstring');

var app = express();
httpServer = http.createServer(app);
io = socketio(httpServer);

app.use(express.static(__dirname + '/public'));
app.use(device.capture());

var appEnv = cfenv.getAppEnv();

httpServer.listen(appEnv.port);

// Client HTML
app.get('/', function(req,res) {
  var deviceType = req.device.type.toUpperCase();
  res.setHeader('Content-Type', 'text/html');
  if(deviceType == "DESKTOP")
    res.send(fs.readFileSync('./host/index.html'));
  else
    res.send(fs.readFileSync('./client/index.html'));
});

// GameServer Logic

io.on('connection', function(socket){

  // Host
  socket.on('create_lobby', function(fn) {
    var lobbyID = rs.generate(4).toUpperCase();
    socket.join(lobbyID);
    fn(lobbyID);
  });

  // Client
  socket.on('join_lobby', function(data, fn){
    console.log(data);
    var lobbyID = data.lobbyID.toUpperCase();
    if(lobbyID in io.sockets.adapter.rooms) {
      socket.join(lobbyID);
      io.to(lobbyID).emit('user_joined', {id: socket.id, name: data.name, sex: data.sex});
      fn(true);
    } else {
      fn(false);
    }
  });

  socket.on('draw_pic', function(data){
    socket.broadcast.emit('draw_pic', data);
  });

  socket.on('disconnect', function () {
    io.emit('client_drop', {id: socket.id});
  });
});
