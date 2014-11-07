angular.module('excavator.backend.submission', []).

factory('backend.submission.create', [
  '$http',
  function ($http) {
    return function (form, data) {
      return $http.post('/submissions/create', {
        form: form,
        data: data
      });
    };
  }
]).

factory('backend.submission.get', [
  '$http',
  function ($http) {
    return function (id) {
      return $http.get('/submissions/' + id);
    };
  }
]).

factory('backend.submission.list', [
  '$http',
  function ($http) {
    return function () {
      return $http.get('/submissions');
    };
  }
]);
