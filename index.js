// Imports
var Commands = require("./modules/CommandList");
var FFA = require("./FFA");
var T1vs1 = require("./1vs1");

// Init variables
var showConsole = true;

// Handle arguments
process.argv.forEach(function (val) {
  if (val == "--noconsole") {
    showConsole = false;
  } else if (val == "--help") {
    console.log("Proper Usage: node index.js");
    console.log("    --noconsole         Disables the console");
    console.log("    --help              Help menu.");
    console.log("");
  }
});

// Run Ogar
var ffa = new FFA();
var t1vs1 = new T1vs1();
// var gameServer2 = new GameServer2();
exports.ffa = ffa;
// exports.gameServer2 = gameServer2;
ffa.start();
t1vs1.start();
// gameServer2.start();
// Add command handler
ffa.commands = Commands.list;
t1vs1.commands = Commands.list;
// Initialize the server console
if (showConsole) {
  var readline = require("readline");
  var in_ = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  setTimeout(prompt, 100);
}

// Console functions

function prompt() {
  in_.question(">", function (str) {
    parseCommands(str);
    return prompt(); // Too lazy to learn async
  });
}

function parseCommands(str) {
  // Log the string
  ffa.log.onCommand(str);
  t1vs1.log.onCommand(str);

  // Don't process ENTER
  if (str === "") return;

  // Splits the string
  var split = str.split(" ");

  // Process the first string value
  var first = split[0].toLowerCase();

  // Get command function
  var execute = ffa.commands[first];
  var execute = t1vs1.commands[first];
  if (typeof execute != "undefined") {
    execute(ffa, split);
    execute(t1vs1, split);
  } else {
    console.log("[Console] Invalid Command!");
  }
}
