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
  if(this.activeQuestion.userAnswers[data.answer] === undefined) {
    this.activeQuestion.userAnswers[data.answer] = {};
    this.activeQuestion.userAnswers[data.answer].creators = [];
  }

  if(this.activeQuestion.userAnswers[data.answer].creators.indexOf(id) == -1)
    this.activeQuestion.userAnswers[data.answer].creators.push(id);

  var userAnswer = data.answer.toLowerCase();
  var realAnswers = [this.activeQuestion.answer.toLowerCase()];
  for(ans in this.activeQuestion.alternate_spellings)
    realAnswers.push(ans.toLowerCase());

  if(realAnswers.indexOf(userAnswer) != -1) {
    cb(false);
    return;
  }

  cb(true);
}

liarliar.prototype.selectAnswer = function(id, data, cb) {
  if(this.activeQuestion.userAnswers[data.answer].votes === undefined)
    this.activeQuestion.userAnswers[data.answer].votes = [];

  this.activeQuestion.userAnswers[data.answer].votes.push(id);

  // if(this.activeQuestion.userAnswers[data.answer] === undefined)
  //   this.activeQuestion.userAnswers[data.answer] = [];
  //
  // if(this.activeQuestion.userAnswers[data.answer].indexOf(id) == -1)
  //   this.activeQuestion.userAnswers[data.answer].push(id);
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
  this.activeQuestion.userAnswers[this.activeQuestion.answer] = {correct: true};
  this.activeQuestion.userAnswers[this.activeQuestion.answer].creators = []

  console.log("ANS: " + this.activeQuestion.answer);

  this.io.to(this.room).emit('question_selected', {question: transformQuestion(this.activeQuestion.question)});
  setTimeout(endSubmissionTime.bind(this), 10000);
}

function endSubmissionTime() {
  if(this.activeQuestion.userAnswers[this.activeQuestion.answer] === undefined) {
    this.activeQuestion.userAnswers[this.activeQuestion.answer] = {};
  }

  var answers = Object.keys(this.activeQuestion.userAnswers);
  while(answers.length < 9) {
    var index = Math.floor(Math.random() * (this.activeQuestion.suggestions.length));
    var suggest = this.activeQuestion.suggestions[index];
    if(answers.indexOf(suggest) == -1) {
      answers.push(suggest);
      this.activeQuestion.userAnswers[suggest] = {};
    }
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
      if(this.activeQuestion.userAnswers[a].creators === undefined || this.activeQuestion.userAnswers[a].correct) {
        ans.push(a);
      } else if(this.activeQuestion.userAnswers[a].creators.indexOf(client) == -1) {
        ans.push(a);
      }
    }
    this.io.to(client).emit('answers_posted', {answers: ans});
  }
  setTimeout(endSelectionTime.bind(this), 10000);
}

function endSelectionTime() {
  console.log(this.activeQuestion);


  this.io.to(client).emit('scores_posted', {});
}

module.exports = liarliar;
