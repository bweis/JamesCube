var questions = require("./questions.json");

// constructor
function liarliar(room) {
  console.log("LiarLiar game created");

  this.room = room;
  this.scores = {};
  this.rounds = {};

  // load in questions
  console.log(questions);
}

// methods
liarliar.prototype.start = function(players) {

}

module.exports = liarliar;
