$(document).ready(function() {
    // Instantiate a counter
    var clock;
    clock = new FlipClock($('#countdownTimer'), 30, {
        clockFace: 'Counter',
        autoStart: true,
        countdown: true
    });
    clock.setTime(30);
});