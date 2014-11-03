angular.module('excavator.func.formatter', []).

constant('func.formatter.function.reindent', function (func) {
  var lines = func.toString().split(/\n/);

  var zeroSpaceCount = 0
  var minSpaces;
  for (var i = 0; i < lines.length; i++) {
    var spaces = (lines[i].match(/^(\s+)/) || [''])[0].length;
    if (spaces > 0) {
      if (minSpaces === undefined || minSpaces > spaces) minSpaces = spaces;
    } else {
      zeroSpaceCount++;
    }
  }

  if (zeroSpaceCount < 2) {
    lines = lines.map(function (line) {
      if (/^\s+/.test(line)) {
        line = line.slice(minSpaces);
      }
      return line;
    });
  }

  return lines.join('\n');
});
