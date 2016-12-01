var socket = io();

$(document).ready(function() {
    // Instantiate a counter
    var clock;

    $('#gameStartBtn').on("click", function() {
        $('#instructions').hide();
        $('#questionContainer').show();
        $('#stage1').show();
        // $('#stage2').show();
        socket.emit('start_game', {room: room}, function(data) {
          if(data) {
              console.log('ayy');
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
  console.log(data);
    $('#stage1').hide();
    $('#stage2').show();
});
