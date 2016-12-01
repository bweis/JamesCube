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
  this.activeQuestion.userAnswers = {};
  this.activeQuestion.userAnswers_arr = [];

  io.to(room).emit('question_selected', {question: this.activeQuestion.question});
  setTimeout(timesUp.bind(this), 30000);
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

function timesUp() {
  this.io.to(this.room).emit('answers_posted', {answers: this.activeQuestion.userAnswers_arr});
}

module.exports = liarliar;
