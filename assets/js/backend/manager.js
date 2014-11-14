angular.module('excavator.backend.manager', []).

factory('backend.manager.list', [
  '$http',
  function ($http) {
    return function () {
      return $http.get('/backend/managers');
    };
  }
]).

factory('backend.manager.submission.list', [
  '$http',
  function ($http) {
    return function () {
      return $http.get('/backend/managers/submissions');
    };
  }
]);
