var questions = require("./questions.json");
var md5 = require('js-md5');
var pg = require('pg');

var cfenv = require('cfenv');
var appenv = cfenv.getAppEnv();
var services = appenv.services;
var pg_services = services["compose-for-postgresql"];

var local = (pg_services === undefined);
if(!local) {
  // DB STUFF
  var credentials = pg_services[0].credentials;

  var ca = new Buffer(credentials.ca_certificate_base64, 'base64');
  var connectionString = credentials.uri;

  var parse = require('pg-connection-string').parse;
  config = parse(connectionString);

  config.ssl = {
    rejectUnauthorized: false,
    ca: ca
  }
}

// constructor
function liarliar(room, io, end) {
  this.room = room;
  this.scores = {};
  this.rounds = {};
  this.players = {};
  this.io = io;
  this.end = end;
}

// methods

liarliar.prototype.addPlayer = function(id, name) {
  this.players[id] = name;
}

liarliar.prototype.submitAnswer = function(id, data, cb) {
  data.answer = data.answer.toLowerCase();
  if(this.activeQuestion.userAnswers[data.answer] === undefined) {
    this.activeQuestion.userAnswers[data.answer] = {};
    this.activeQuestion.userAnswers[data.answer].creators = [];
  }

  var userAnswer = data.answer.toLowerCase();
  var realAnswers = [this.activeQuestion.answer.toLowerCase()];
  for(ans in this.activeQuestion.alternate_spellings)
    realAnswers.push(ans.toLowerCase());

  if(realAnswers.indexOf(userAnswer) != -1) {
    cb(false);
    return;
  }

  if(this.activeQuestion.userAnswers[data.answer].creators.indexOf(id) == -1)
    this.activeQuestion.userAnswers[data.answer].creators.push(id);

  cb(true);

  if(Object.keys(this.activeQuestion.userAnswers).length >= Object.keys(io.sockets.adapter.rooms[this.room].sockets).length) {
    clearTimeout(this.endSubTimer);
    endSubmissionTime.bind(this)();
  }
}

liarliar.prototype.selectAnswer = function(id, data, cb) {
  data.answer = data.answer.toLowerCase();
  if(this.activeQuestion.userAnswers[data.answer].votes === undefined)
    this.activeQuestion.userAnswers[data.answer].votes = [];

  this.activeQuestion.userVotes += 1;
  this.activeQuestion.userAnswers[data.answer].votes.push(id);

  if(this.activeQuestion.userVotes >= Object.keys(io.sockets.adapter.rooms[this.room].sockets).length - 1) {
    clearTimeout(this.endSelTimer);
    endSelectionTime.bind(this)();
  }
}

function transformQuestion(question) {
  return question.replace("<BLANK>", "________");
}

liarliar.prototype.start = function() {
  this.startRound();
  setTimeout(this.checkRoomStatus.bind(this), 5000);
}

liarliar.prototype.startRound = function() {
  this.questionID = parseInt(Math.random() * (Object.keys(questions).length - 1));
  this.activeQuestion = questions[this.questionID];
  this.activeQuestion.answer = this.activeQuestion.answer.toLowerCase();
  this.activeQuestion.userAnswers = {};
  this.activeQuestion.userVotes = 0;
  this.activeQuestion.userAnswers[this.activeQuestion.answer] = {correct: true};
  this.activeQuestion.userAnswers[this.activeQuestion.answer].creators = [];

  console.log(this.activeQuestion.answer);

  this.io.to(this.room).emit('question_selected', {question: transformQuestion(this.activeQuestion.question)});
  this.endSubTimer = setTimeout(endSubmissionTime.bind(this), 30000);
}

liarliar.prototype.checkRoomStatus = function() {
  if(this.io.sockets.adapter.rooms[this.room] === undefined) {
    this.end(this.room);
    return false;
  }

  return true;
}

liarliar.prototype.endGame = function() {
  setTimeout(function() {
    this.end(this.room)
  }.bind(this), 500);
}

function endSubmissionTime() {
  if(!this.checkRoomStatus()) {
    return;
  }

  if(this.activeQuestion.userAnswers[this.activeQuestion.answer] === undefined) {
    this.activeQuestion.userAnswers[this.activeQuestion.answer] = {};
  }

  var answers = Object.keys(this.activeQuestion.userAnswers);
  while(answers.length < 9) {
    var index = Math.floor(Math.random() * (this.activeQuestion.suggestions.length));
    var suggest = this.activeQuestion.suggestions[index];
    if(answers.indexOf(suggest.toLowerCase()) == -1) {
      answers.push(suggest.toLowerCase());
      this.activeQuestion.userAnswers[suggest.toLowerCase()] = {};
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
  this.endSelTimer = setTimeout(endSelectionTime.bind(this), 30000);
}

function endSelectionTime() {
  if(!this.checkRoomStatus()) {
    return;
  }

  var scores = {};

  var roundAnswers = this.activeQuestion.userAnswers;

  var clients = io.sockets.adapter.rooms[this.room].sockets;

  for(client in clients) {
    if(this.players[client] !== undefined) {
      scores[client] = {
        id: client,
        nick: this.players[client],
        score: 0
      };
    }
    this.io.to(client).emit('scores_posted', {scores: scores});
  }

  var roundNo = Object.keys(this.rounds).length;

  for(ans in roundAnswers) {
    var ans = roundAnswers[ans];
    for(voter in ans.votes) {
      voter = ans.votes[voter];
      if(ans.correct) {
        scores[voter].score += 1000 * (roundNo+1);
      } else {
        for(crtr in ans.creators) {
          crtr = ans.creators[crtr];
          scores[crtr].score += 500 * (roundNo+1);
        }
        if(ans.creators === undefined) {
          scores[voter].score -= 250 * (roundNo+1);
        }
      }
    }
  }

  if(Object.keys(this.rounds).length > 0) {
    var lastScores = this.rounds[roundNo-1].scores;
    for(user in scores) {
      scores[user].score += lastScores[user].score;
    }
  }

  for(user in scores) {
    if(scores[user].score < 0)
      scores[user].score = 0;
  }

  this.rounds[Object.keys(this.rounds).length] = {
    question: this.activeQuestion,
    scores: scores
  };

  var gameID = md5(String(new Date().valueOf()));
  var gameobject = JSON.stringify(this.rounds);

  if(!local) {
    var dbClient = new pg.Client(config);

    dbClient.connect(function(err) {
      if (err) {
       response.status(500).send(err);
      } else {
        dbClient.query('INSERT INTO games(id,gameobject) VALUES($1, $2)', [gameID, gameobject], function (err,result){
          if (err) {
            console.log(err)
          }
        });
      }
    });
  }

  this.io.to(this.room).emit('scores_posted', {scores: scores, correctAnswer: this.activeQuestion.answer, gameID: gameID, roundNo: Object.keys(this.rounds).length});
}

module.exports = liarliar;
