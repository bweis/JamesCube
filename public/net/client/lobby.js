var socket = io();

var room;
var nickname;

if(decodeURI(window.location.search.substring(1)) !== "") {
  var data = JSON.parse('{"' + decodeURI(window.location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
  room = data.room;
  nickname = data.nickname;
}

window.history.pushState("", "", '/');

if(room !== undefined) {
  socket.emit('join_lobby', {lobbyID: room, name: data.nickname, sex: data.sex}, function(data) {
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
} else {
  function joinRoom(form) {
    var dataSer = $(form).serialize()
    var data = JSON.parse('{"' + decodeURI(dataSer).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    if(data.sexSwitch == "on")
      data.sex = "male";
    else
      data.sex = "female";
    nickname = data.nickname;
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
}

socket.on('game_created', function(data) {
  window.location = data.gameUrl + "?room="+data.room+"&nickname="+nickname;
})
