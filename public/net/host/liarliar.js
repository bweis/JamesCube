var socket = io();

$(document).ready(function() {
  var clock;

  $('#gameStartBtn').on("click", function() {
    $('#instructions').hide();
    $('#questionContainer').show();
    $('#stage1').show();

    socket.emit('start_game', {room: room}, function(data) {
      if(data) {
        clock = new FlipClock($('#countdownTimer'), 30, {
          clockFace: 'Counter',
          autoStart: true,
          countdown: true
        });
        clock.setTime(30);
      } else {
        console.log('err');
      }
    });
  });

});

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
});

socket.on('question_selected', function(data) {
  $('#currentQuestion').html(data.question);
});

socket.on('answers_posted', function(data) {
  console.log(data.answers);
  $('#stage1').hide();
    document.getElementById("questionContainer").className =
        document.getElementById("questionContainer").className.replace(/\bquestion-margin\b/,'');
  $('#stage2').show();
  console.log(data);
  for(answer in data.answers) {
    var div = '#answer'+(parseInt(answer)+1);
    $(div).html(data.answers[answer]);
  }
});

socket.on('scores_posted', function(data) {
  console.log('scores posted');
});
