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

  var dbClient = new pg.Client(config);
}


function getGameData(id, cb) {
  dbClient.connect(function(err) {
    if (err) {
      response.status(500).send(err);
    } else {
      dbClient.query('select gameobject from games where id=$1', [id], function (err,result){
        if (err) {
          console.log(err)
        }
        cb(result);
      });
    }
  });
}

module.exports = getGameData;
