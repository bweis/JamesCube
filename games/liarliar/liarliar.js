var questions = require("./questions.json");

// constructor
function liarliar(room, io) {
  this.room = room;
  this.scores = {};
  this.rounds = {};
  this.io = io;
}

// methods
liarliar.prototype.data = function() {
  return {question: transformQuestion(this.activeQuestion.question)};
}

liarliar.prototype.submitAnswer = function(id, data, cb) {
  this.activeQuestion.userAnswers[id] = data;
  this.activeQuestion.userAnswers_arr.push(data.answer);
  cb(true);
}

function transformQuestion(question) {
  return question.replace("<BLANK>", "________");
}

liarliar.prototype.start = function() {
  this.startRound();
}

liarliar.prototype.startRound = function() {
  this.questionID = parseInt(Math.random() * (Object.keys(questions).length - 1));
  this.activeQuestion = questions[this.questionID];
  this.activeQuestion.userAnswers = {};
  this.activeQuestion.userAnswers_arr = [];

  this.io.to(this.room).emit('question_selected', {question: this.activeQuestion.question});
  setTimeout(endSubmissionTime.bind(this), 30000);
}

function endSubmissionTime() {
  this.io.to(this.room).emit('answers_posted', {answers: this.activeQuestion.userAnswers_arr});
}

module.exports = liarliar;
