var express = require('express');
var cfenv = require('cfenv');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var device = require('express-device');
var rs = require('randomstring');

var liarliar = require("./games/liarliar/liarliar.js");
var sketch = require("./games/sketch/sketch.js");

var viewLL = require('./games/liarliar/viewGame.js')

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

app.get('/view/:id', function(req,res) {
  var id = req.params.id;
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync('./public/net/liarliargameview.html'));
});

app.get('/get/:id', function(req,res) {
  var id = req.params.id;
  viewLL(id, function(data) {
    res.setHeader('Content-Type', 'text/json');
    res.send(data);
  });
});

// GameServer Logic

var activeGames = {}; // indexed by socket.room
function endGame(id) {
  delete activeGames[id];
  if(io.sockets.adapter.rooms[id] !== undefined) {
    var clients = io.sockets.adapter.rooms[id].sockets;
    for(client in clients) {
      io.to(client).emit('game_ended');
    }
  }
}

io.on('connection', function(socket){

  // Host
  socket.on('create_lobby', function(data, fn) {
    if(data.room !== undefined) {
      data.room = data.room.toUpperCase();
      socket.join(data.room);
      fn(data.room);
      return;
    }
    var lobbyID = rs.generate(4).toUpperCase();
    socket.join(lobbyID);
    fn(lobbyID);
  });

  socket.on('create_game', function(data, fn) {
    if(data.gameType == 'liarliar') {
      io.to(data.room).emit('game_created', {gameUrl: '/liarliar', room: data.room});
      activeGames[data.room] = new liarliar(data.room, io, endGame.bind(this));
      fn(true);
    } else if(data.gameType == 'sketch') {
      io.to(data.room).emit('game_created', {gameUrl: '/sketch', room: data.room});
      activeGames[data.room] = new sketch(data.room, io, endGame.bind(this));
      fn(true);
    }
  });

  socket.on('start_game', function(data, fn) {
    if(data.gameType = 'lairliar') {
      activeGames[data.room].start();
      fn(true);
    }
  });

  socket.on('next_round', function(data) {
    if(data.gameType = 'lairliar') {
      activeGames[data.room].startRound();
    }
  });

  socket.on('end_game', function(data, fn) {
    activeGames[data.room].endGame();
  });

  // Both
  socket.on('join_game', function(data, fn) {
    if(data.room in activeGames) {
      socket.join(data.room);
      activeGames[data.room].addPlayer(socket.id, data.name);
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
    activeGames[room].submitAnswer(socket.id, data, fn);
  });

  socket.on('select_answer', function(data) {
    for(room in socket.rooms)
    if(room != socket.id)
    activeGames[room].selectAnswer(socket.id, data);
  });

  var drawPoints = [];
  socket.on('draw_line', function (data) {
    drawPoints.push(data.drawPoint);
    io.emit('draw_line', data);
  });

  socket.on('disconnect', function () {
    io.emit('client_drop', {id: socket.id});
  });
});
