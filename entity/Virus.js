var Cell = require("./Cell");

function Virus() {
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 2;
  this.spiked = 1;
  this.fed = 0;
}

module.exports = Virus;
Virus.prototype = new Cell();

Virus.prototype.calcMove = null; // Only for player controlled movement

Virus.prototype.feed = function (feeder, gameServer) {
  this.setAngle(feeder.getAngle()); // Set direction if the virus explodes
  this.mass += feeder.mass;
  this.fed++; // Increase feed count
  gameServer.removeNode(feeder);

  // Check if the virus is going to explode
  if (this.fed >= gameServer.config.virusFeedAmount) {
    this.mass = gameServer.config.virusStartMass; // Reset mass
    this.fed = 0;
    gameServer.shootVirus(this);
  }
};

// Main Functions

Virus.prototype.getEatingRange = function () {
  return this.getSize() * 0.4; // 0 for ejected cells
};

Virus.prototype.onConsume = function (consumer, gameServer) {
  var client = consumer.owner;

  // Determine the maximum splits based on the client's current number of cells
  var maxSplits = Math.max(0, 16 - client.cells.length);

  // Determine the initial number of splits based on consumer mass
  var numSplits = 0;
  if (consumer.mass <= 800 && client.cells.length !== 16)
    numSplits = Math.min(14, maxSplits);
  else if (
    client.cells.length === 4 &&
    consumer.mass >= 800 &&
    consumer.mass <= 1000
  )
    numSplits = Math.min(10, maxSplits);
  else if (consumer.mass >= 1000 && consumer.mass < 2500)
    numSplits = Math.min(12, maxSplits);
  else if (consumer.mass >= 2500) numSplits = Math.min(14, maxSplits);

  // Calculate the mass to be split for each split
  var splitMass = Math.min(consumer.mass / (numSplits + 1), 36); // Maximum size of new splits

  // Cell consumes mass before splitting
  consumer.addMass(this.mass);

  // Cell cannot split any further
  if (numSplits <= 0) {
    return;
  }

  // Big cells will split into cells larger than 36 mass (1/4 of their mass)
  var bigSplits = 0;
  var endMass = consumer.mass - numSplits * splitMass;
  if (endMass > 300 && numSplits > 0) {
    bigSplits++;
    numSplits--;
  }
  if (endMass > 1200 && numSplits > 0) {
    bigSplits++;
    numSplits--;
  }
  if (endMass > 3000 && numSplits > 0) {
    bigSplits++;
    numSplits--;
  }

  // Splitting
  var angle = 0; // Starting angle
  for (var k = 0; k < numSplits; k++) {
    angle += 6 / numSplits; // Get directions of splitting cells
    gameServer.newCellVirused(client, consumer, angle, splitMass, 540);
    consumer.mass -= splitMass;
  }

  for (var k = 0; k < bigSplits; k++) {
    angle = Math.random() * 8; // Random directions
    splitMass = consumer.mass / 4;
    gameServer.newCellVirused(client, consumer, angle, splitMass, 500);
    consumer.mass -= splitMass;
  }

  // Prevent consumer cell from merging with other cells
  consumer.calcMergeTime(gameServer.config.playerRecombineTime);
};

Virus.prototype.onAdd = function (gameServer) {
  gameServer.nodesVirus.push(this);
};

Virus.prototype.onRemove = function (gameServer) {
  var index = gameServer.nodesVirus.indexOf(this);
  if (index != -1) {
    gameServer.nodesVirus.splice(index, 1);
  } else {
    console.log("[Warning] Tried to remove a non existing virus!");
  }
};
