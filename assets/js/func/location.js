angular.module('excavator.func.location', []).

factory('func.location.goto', [
  '$location',
  function ($location) {
    return function (path) {
      $location.path(path);
    };
  }
]);
