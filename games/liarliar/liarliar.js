var questions = require("./questions.json");

// constructor
function liarliar(room, io) {
  console.log("LiarLiar game created");

  this.room = room;
  this.scores = {};
  this.rounds = {};
  this.io = io;

  this.questionID = parseInt(Math.random() * (Object.keys(questions).length - 1));
  this.activeQuestion = questions[this.questionID];

  io.to(room).emit('question_selected', {question: this.activeQuestion.question});
}

// methods
liarliar.prototype.start = function(players) {

}

liarliar.prototype.data = function() {
  return {question: transformQuestion(this.activeQuestion.question)};
}

function transformQuestion(question) {
  return question.replace("<BLANK>", "________");
}

module.exports = liarliar;
