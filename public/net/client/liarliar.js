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
  $('#questionContainer').show();
  $('#instructions').hide();
  $('#stage1').show();
  $('#stage3').hide();
  $('#submitAnswer').val('');

  var clock = new FlipClock($('#mobileCountdownTimer'), 30, {
    clockFace: 'Counter',
    autoStart: true,
    countdown: true
  });
  clock.setTime(30);
});

socket.on('answers_posted', function(data) {
  $('#instructions').hide();
  $('#stage1').hide();
  $('#stage2').show();

  for(answer in data.answers) {
    var div = '#answer'+(parseInt(answer)+1);
    $(div).html(data.answers[answer].toUpperCase());
    $(div).prop('onclick',null).off('click');
    $(div).click(function() {
      socket.emit('select_answer', {answer: this.innerHTML});
      $('#stage2').hide();
    })
  }
});

socket.on('scores_posted', function(data) {
  $('#stage2').hide();
  $('#stage3').show();


  for(var i = 1; i <= 8; i++) {
    $(('#player'+i)).hide();
  }

  $('#gameID').html("View these resuls anytime at: <a href='http://jamescube.mybluemix.net/view/"+data.gameID+"'>http://jamescube.mybluemix.net/view/" + data.gameID + "</a>");

  var users = Object.keys(data.scores);

  users.sort(function(a, b) {
    return data.scores[b].score - data.scores[a].score
  });

  for(var i = 1; i <= users.length; i++) {
    var user = data.scores[users[i - 1]];
    if(user.score < 0)
      user.score = 0;
    $(('#player'+i)).show();
    $(('#user'+i)).html(user.nick);
    $(('#score'+i)).html(user.score);
  }
});


socket.on('game_ended', function(data) {
  console.log('game ended');
  window.location = "/"+"?room="+room+"&nickname="+nickname;
});

$(document).ready(function() {
  $('#mobileAnswersTable').on('click', '.clickable-row', function(event) {
    $(this).addClass('active').siblings().removeClass('active');
  });
});
