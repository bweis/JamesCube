// constructor
function liarliar(room) {
  console.log("LiarLiar game created");

  this.room = room;
  this.scores = {};
  this.rounds = {};
}

// methods
liarliar.prototype.start = function(players) {

}

module.exports = liarliar;
