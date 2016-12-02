var socket = io();

if(decodeURI(window.location.search.substring(1)) == "") {
  window.location = "/";
}
var data = JSON.parse('{"' + decodeURI(window.location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
var room = data.room;
var nickname = data.nickname;
window.history.pushState("", "", '/liarliar');

if(room === undefined)
  window.location = "/";

socket.emit('join_game', {room: room, name: nickname}, function(data) {
  if(!data)
    window.location = "/";

  $('#instructions').show();
  $('#stage1').hide();
  $('#stage2').hide();
});

$('#submitAnswerButton').click(function() {
  var answer = $('#submitAnswer').val();
  socket.emit('submit_answer', {answer: answer}, function(data) {
    if(data) {
      $('#stage1').hide();
    } else {
      alert('That is the correct answer, try to fool your opponents');
    }
  });
});

socket.on('question_selected', function(data) {
  $('#currentQuestion').html(data.question);
  $('#instructions').hide();
  $('#stage1').show();
  $('#stage2').hide();
});

socket.on('answers_posted', function(data) {
  $('#instructions').hide();
  $('#stage1').hide();
  $('#stage2').show();

  for(answer in data.answers) {
    var div = '#answer'+(parseInt(answer)+1);
    $(div).html(data.answers[answer]);
    $(div).click(function() {
      socket.emit('select_answer', {answer: this.innerHTML});
      $('#stage2').hide();
    })
  }
});

socket.on('scores_posted', function(data) {
  console.log('scores posted');
});

$(document).ready(function() {
  $('#mobileAnswersTable').on('click', '.clickable-row', function(event) {
    $(this).addClass('active').siblings().removeClass('active');
  });
});
