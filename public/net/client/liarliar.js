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
  if(!data)
    window.location = "/";

  $('#instructions').show();
  $('#stage1').hide();
  $('#stage2').hide();
});

$('#submitAnswerButton').click(function() {
  var answer = $('#submitAnswer').val();
  socket.emit('submit_answer', {answer: answer}, function(data) {
    console.log(data);
  });
});

socket.on('question_selected', function(data) {
  $('#currentQuestion').html(data.question);
  $('#instructions').hide();
  $('#stage1').show();
  $('#stage2').hide();
});

socket.on('answers_posted', function(data) {
  console.log(data);
});

$(document).ready(function() {
  $('#mobileAnswersTable').on('click', '.clickable-row', function(event) {
    $(this).addClass('active').siblings().removeClass('active');
  });
});
