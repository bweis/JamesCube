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


function getGameData(id, cb) {
  var dbClient = new pg.Client(config);
  dbClient.connect(function(err) {
    if (err) {
      console.log('DB Connect Err');
    } else {
      dbClient.query('SELECT gameobject from games WHERE id = $1', [id], function (err,result){
        if (err) {
          console.log("DB Query Err:");
          console.log(err);
        } else {
          cb(result.rows);
        }
      });
    }
  });
}

module.exports = getGameData;
