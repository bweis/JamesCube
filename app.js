var express = require('express');
var cfenv = require('cfenv');

var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');

var app = express();
httpServer = http.Server(app);
io = socketio(httpServer);

app.use(express.static(__dirname + '/public'));

var appEnv = cfenv.getAppEnv();

app.listen(appEnv.port, '0.0.0.0', function() {
  console.log("server starting on " + appEnv.url);
});


// Client HTML
app.get('/', function(req,res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync('./client/indexServer.html'));
});

// GameServer Logic

io.on('connection', function(socket){
  console.log('a user connected');
});
