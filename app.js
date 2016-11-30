var express = require('express');
var cfenv = require('cfenv');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var device = require('express-device');

var app = express();
httpServer = http.Server(app);
io = socketio(httpServer);

app.use(express.static(__dirname + '/public'));
app.use(device.capture());

var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});


// Client HTML
app.get('/', function(req,res) {
  var deviceType = req.device.type.toUpperCase();
  res.setHeader('Content-Type', 'text/html');
  if(deviceType == "DESKTOP")
    res.send(fs.readFileSync('./client/index_pc.html'));
  else
    res.send(fs.readFileSync('./client/index_mobile.html'));
});

// GameServer Logic

io.on('connection', function(socket){
  console.log('a user connected');
});
