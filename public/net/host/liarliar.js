var socket = io();

$(document).ready(function() {
    // Instantiate a counter
    var clock;

    $('#gameStartBtn').on("click", function() {
        $('#instructions').hide();
        $('#questionContainer').show();
        $('#stage1').show();
        clock = new FlipClock($('#countdownTimer'), 30, {
            clockFace: 'Counter',
            autoStart: true,
            countdown: true
        });
        clock.setTime(30);
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
  if(data) {
    $('#currentQuestion').html(data.question);
  }else {
    window.location = "/";
  }
});

socket.on('answers_changed', function(data) {
  console.log(data);
});
