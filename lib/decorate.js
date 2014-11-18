function decorate (string) {
  return '/*__*FUNCTION*__*/\n' + string + '\n/*__*FUNCTION*__*/';
}

function undecorate (string) {
  var ph_s = '/*__*FUNCTION*__*/\n';
  var ph_e = '\n/*__*FUNCTION*__*/';
  if (typeof string === 'string' &&
    string.slice(0, ph_s.length) === ph_s &&
    string.slice(-ph_e.length) === ph_e) {
    var func = string.slice(ph_s.length, string.length - ph_e.length);
    return new Function('return ' + func)();
  }
  return undefined;
}

module.exports = {};
module.exports.decorate = decorate;
module.exports.undecorate = undecorate;
