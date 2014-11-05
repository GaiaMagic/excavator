angular.module('excavator.func.localstorage', []).

constant('func.localstorage.has', function (key) {
  return window.localStorage.hasOwnProperty(key);
}).

constant('func.localstorage.load', function (key, transFunc) {
  var value = window.localStorage.getItem(key);
  if (angular.isFunction(transFunc)) {
    return transFunc(value);
  }
  return value;
}).

constant('func.localstorage.remove', function (key) {
  window.localStorage.removeItem(key);
}).

constant('func.localstorage.save', function (key, value) {
  if (!angular.isString(value)) value = angular.toJson(value);

  window.localStorage.setItem(key, value);
});
