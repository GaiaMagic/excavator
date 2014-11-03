angular.module('excavator.func.enumerate', []).

factory('func.enumerate', ['$injector',
  function ($injector) {
  /**
   * if enumberable is an array, return it;
   * if it is a function (w/wo DI), execute it and return its returned value
   */
  return function (enumerable, self) {
    if (angular.isFunction(enumerable)) return $injector.invoke(enumerable, self);
    if (angular.isArray(enumerable)) {
      if (angular.isFunction(enumerable[enumerable.length - 1])) {
        return $injector.invoke(enumerable, self);
      }
      return enumerable;
    }
    return undefined;
  };
}]).

constant('func.enumerate.stat', function (enumerated) {
  var ret = {
    isValid: false,
    isObject: false,
    isObjectHasGroup: false
  };
  if (!angular.isArray(enumerated)) return ret;
  ret.isValid = true;
  if (!angular.isObject(enumerated[0])) return ret;
  ret.isObject = true;
  if (!angular.isDefined(enumerated[0].group)) return ret;
  ret.isObjectHasGroup = true;
  return ret;
}).

constant('func.enumerate.groupBy', function (collection, property) {
  var groups = {};
  for (var i = 0; i < collection.length; i++) {
    var name = collection[i][property];
    groups[name] = groups[name] || [];
    groups[name].push(collection[i]);
  }
  return Object.keys(groups).map(function (name) {
    return groups[name];
  });
});
