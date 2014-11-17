angular.module('excavator.backend.misc', []).

factory('backend.misc.statuses', [
  '$http',
  function ($http) {
    return $http.get('/backend/misc/statuses');
  }
]);
