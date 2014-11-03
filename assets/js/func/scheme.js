angular.module('excavator.func.scheme', []).

constant('func.scheme.func.decorate', function (string) {
  return '/*__*FUNCTION*__*/\n' + string + '\n/*__*FUNCTION*__*/';
}).

constant('func.scheme.func.undecorate', function (string) {
  var ph_s = '/*__*FUNCTION*__*/\n';
  var ph_e = '\n/*__*FUNCTION*__*/';
  if (angular.isString(string) &&
    string.slice(0, ph_s.length) === ph_s &&
    string.slice(-ph_e.length) === ph_e) {
    var func = string.slice(ph_s.length, string.length - ph_e.length);
    return new Function('return ' + func)();
  }
  return undefined;
}).

factory('func.scheme.parse', [
  'func.scheme.func.undecorate',
  function (undecorate) {
    return function (object) {
      return JSON.parse(object, function (key, val) {
        return undecorate(val) || val;
      });
    }
  }
]).

factory('func.scheme.stringify', [
  'func.formatter.function.reindent',
  'func.scheme.func.decorate',
  function (reindent, decorate) {
    return function (object) {
      return JSON.stringify(object, function (key, val) {
        if (angular.isString(key) && key.charAt(0) === '$') {
          val = undefined;
        } else if (angular.isFunction(val)) {
          val = reindent(val);
          val = decorate(val);
        }
        return val;
      }, 2);
    }
  }
]);
