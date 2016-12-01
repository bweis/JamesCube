var questions = require("./questions.json");

// constructor
function liarliar(room, io) {
  this.room = room;
  this.scores = {};
  this.rounds = {};
  this.io = io;
}

// methods
liarliar.prototype.submitAnswer = function(id, data, cb) {
  if(this.activeQuestion.userAnswers[data.answer] === undefined)
    this.activeQuestion.userAnswers[data.answer] = [];

  if(this.activeQuestion.userAnswers[data.answer].indexOf(id) == -1)
    this.activeQuestion.userAnswers[data.answer].push(id);
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

  this.io.to(this.room).emit('question_selected', {question: transformQuestion(this.activeQuestion.question)});
  setTimeout(endSubmissionTime.bind(this), 10000);
}

function endSubmissionTime() {
  var answers = Object.keys(this.activeQuestion.userAnswers);
  answers.push(this.activeQuestion.answer);
  while(answers.length < 9) {
    var index = Math.floor(Math.random() * (this.activeQuestion.suggestions.length));
    var suggest = this.activeQuestion.suggestions[index];
    if(answers.indexOf(suggest) == -1)
      answers.push(suggest);
  }
  var shuffledAnswers = [];
  while(shuffledAnswers.length < 9) {
    var index = Math.floor(Math.random() * (answers.length));
    shuffledAnswers.push(answers[index]);
    answers.splice(index, 1);
  }

  var clients = io.sockets.adapter.rooms[this.room].sockets;
  for(client in clients) {
    var ans = [];
    for(a in shuffledAnswers) {
      a = shuffledAnswers[a];
      if(this.activeQuestion.userAnswers[a] === undefined) {
        ans.push(a);
      } else if(this.activeQuestion.userAnswers[a].indexOf(client) == -1) {
        ans.push(a);
      }
    }
    this.io.to(client).emit('answers_posted', {answers: ans});
  }
}

module.exports = liarliar;
