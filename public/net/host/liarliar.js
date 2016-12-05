var socket = io();

var autoStartRound;

$(document).ready(function() {
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

  $('#gameEndBtn').on("click", function() {
    socket.emit('end_game', {room: room});
    window.location = "/"+"?room="+room;
  });

  $('#roundBtn').on("click", function() {
    clearInterval(autoStartRound);
    socket.emit('next_round', {room: room});
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
  $('#stage1').show();
  $('#stage3').hide();
  $('#currentQuestion').html(data.question);

  var clock = new FlipClock($('#countdownTimer'), 30, {
    clockFace: 'Counter',
    autoStart: true,
    countdown: true
  });
  clock.setTime(30);
});

socket.on('answers_posted', function(data) {
  $('#stage1').hide();
    document.getElementById("questionContainer").className =
        document.getElementById("questionContainer").className.replace(/\bquestion-margin\b/,'');
  $('#stage2').show();
  for(answer in data.answers) {
    var div = '#answer'+(parseInt(answer)+1);
    $(div).html(data.answers[answer].toUpperCase());
  }
});

socket.on('scores_posted', function(data) {
  $('#stage2').hide();
  $('#stage3').show();

  for(var i = 1; i <= 8; i++) {
    $(('#player'+i)).hide();
  }
  var question = $('#currentQuestion').html();
  if (question.indexOf("________") == -1) {
    question = question + '<br>' +  '<span style="color: #E74C3C; text-align: center">' + data.correctAnswer + '</span>';
  } else {
    question = question.replace("________", '<span style="color: #E74C3C">' + data.correctAnswer + '</span>');
  }
  $('#currentQuestion').html(question);

  var roundNo = data.roundNo + 1;

  if(roundNo == 4)
    $('#gameID').html("View these resuls anytime at: <a href='http://jamescube.mybluemix.net/view/"+data.gameID+"'>http://jamescube.mybluemix.net/view/" + data.gameID + "</a>");

  if(roundNo != 4) {
    var timer = 15;
    $('#roundBtn').html("Next Round: " + timer);

    autoStartRound = setInterval(function() {
      timer -= 1;
      $('#roundBtn').html("Next Round: " + timer);
      if(timer <= 0) {
        clearInterval(autoStartRound);
        socket.emit('next_round', {room: room});
      }
    }, 1000);
  } else {
    $('#roundBtn').hide();
  }

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
    $(('#total'+i)).html(user.totalScore);
  }
});
