var socket = io();

if(decodeURI(window.location.search.substring(1)) == "") {
  window.location = "/";
}
var data = JSON.parse('{"' + decodeURI(window.location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
var room = data.room;
window.history.pushState("", "", '/liarliar');

if(room === undefined)
  window.location = "/";

socket.emit('join_game', {room: room}, function(data) {
  if(data) {
    $('#currentQuestion').html(data.question);
  }else {
    window.location = "/";
  }
});

$('#submitAnswerButton').click(function() {
  var answer = $('#submitAnswer').val();
  socket.emit('submit_answer', {answer: answer}, function(data) {
    console.log(data);
  });
});
