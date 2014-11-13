angular.module('excavator.backend.manager', []).

factory('backend.manager.get', [
  '$http',
  function ($http) {
    return function (id) {
      return $http.get('/backend/managers/' + id);
    };
  }
]).

factory('backend.manager.list', [
  '$http',
  function ($http) {
    return function () {
      return $http.get('/backend/managers');
    };
  }
]);
