module.exports = {
  Mode: require("./Mode"),
  FFA: require("./FFA"),
  Experimental: require("./Experimental"),
  Tournament: require("./Tournament"),
  Duel: require("./Duel"),
  Tournament2: require("./Tournament2vs2"),
};

var get = function (id) {
  var mode;
  switch (id) {
    case 1:
      mode = new module.exports.Tournament();
      break;
    case 2: // Experimental
      mode = new module.exports.Experimental();
      break;
    case 3: // Experimental
      mode = new module.exports.Tournament2();
      break;
    default: // FFA is default
      mode = new module.exports.FFA();
      break;
  }
  return mode;
};

module.exports.get = get;
