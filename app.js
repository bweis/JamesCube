var express = require('express');
var cfenv = require('cfenv');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var device = require('express-device');
var rs = require('randomstring');

var liarliar = require("./games/liarliar/liarliar.js")

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

app.get('/liarliar', function(req,res) {
  var deviceType = req.device.type.toUpperCase();
  res.setHeader('Content-Type', 'text/html');
  if(deviceType == "DESKTOP")
    res.send(fs.readFileSync('./host/liarliar/game.html'));
  else
    res.send(fs.readFileSync('./client/liarliar/game.html'));
});

app.get('/sketch', function(req,res) {
  var deviceType = req.device.type.toUpperCase();
  res.setHeader('Content-Type', 'text/html');
  if(deviceType == "DESKTOP")
    res.send(fs.readFileSync('./host/sketch/game.html'));
  else
    res.send(fs.readFileSync('./client/sketch/game.html'));
});

// GameServer Logic

var activeGames = {}; // indexed by socket.room

io.on('connection', function(socket){

  // Host
  socket.on('create_lobby', function(fn) {
    var lobbyID = rs.generate(4).toUpperCase();
    socket.join(lobbyID);
    fn(lobbyID);
  });

  socket.on('create_game', function(data, fn) {
    if(data.gameType = 'lairliar') {
      io.to(data.room).emit('game_created', {gameUrl: '/liarliar', room: data.room});
      activeGames[data.room] = new liarliar(data.room, io);
      fn(true);
    }
  });

  socket.on('start_game', function(data, fn) {
    if(data.gameType = 'lairliar') {
      activeGames[data.room].start();
      fn(true);
    }
  });

  // Both
  socket.on('join_game', function(data, fn) {
    if(data.room in activeGames) {
      socket.join(data.room);
      fn(true)
    } else {
      fn(false);
    }
  });

  // Client
  socket.on('join_lobby', function(data, fn){
    var lobbyID = data.lobbyID.toUpperCase();
    if(lobbyID in io.sockets.adapter.rooms && !(lobbyID in activeGames)) {
      socket.join(lobbyID);
      io.to(lobbyID).emit('user_joined', {id: socket.id, name: data.name, sex: data.sex});
      fn(lobbyID);
    } else {
      fn(false);
    }
  });

  socket.on('submit_answer', function(data, fn) {
    for(room in socket.rooms)
      if(room != socket.id)
        activeGames[room].submitAnswer(socket, data, fn);
  });

  var clickX = [];
  var clickY = [];
  var clickDrag = [];
  socket.on('draw_line', function (data) {
      clickX.push(data.clickX);
      clickY.push(data.clickY);
      clickDrag.push(data.clickDrag);
      io.emit('draw_line', data);
   });

  socket.on('disconnect', function () {
    io.emit('client_drop', {id: socket.id});
  });
});
