angular.module('excavator.func.scheme', []).

constant('func.scheme.func.decorate',
  require('../../../lib/decorate').decorate).

constant('func.scheme.func.undecorate',
  require('../../../lib/decorate').undecorate).

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
