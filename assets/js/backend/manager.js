angular.module('excavator.backend.manager', []).

factory('backend.manager.ban', [
  '$http',
  function ($http) {
    return function (managerid, unban) {
      var verb = unban ? 'delete' : 'post';
      return $http[verb]('/backend/managers/' + managerid + '/ban');
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
]).

factory('backend.manager.register', [
  '$http',
  function ($http) {
    return function (username, password) {
      return $http.post('/backend/managers', {
        username: username,
        password: password
      });
    };
  }
]).

factory('backend.manager.remove', [
  '$http',
  function ($http) {
    return function (managerid) {
      return $http.delete('/backend/managers/' + managerid);
    };
  }
]).

factory('backend.manager.submission.get', [
  '$http',
  function ($http) {
    return function (id) {
      return $http.get('/backend/managers/submissions/' + id);
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
