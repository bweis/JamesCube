var socket = io();

function joinRoom(form) {
  var dataSer = $(form).serialize()
  var data = JSON.parse('{"' + decodeURI(dataSer).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
  if(data.sexSwitch == "on")
    data.sex = "male";
  else
    data.sex = "female";
  console.log(data);
  socket.emit('join_lobby', {lobbyID: data.joinCode, name: data.nickname, sex: data.sex}, function(data) {
    if(data) {
      console.log('joined room');
      $('#joinForm').css("display", "none");
      $('#waitingPage').show();
      $("#roomCode").html(data);
    } else {
      alert('Room does not exist');
      console.log('could not join room');
    }
  });
}

socket.on('game_created', function(data) {
  window.location = data.gameUrl + "?room="+data.room;
})
