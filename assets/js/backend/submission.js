angular.module('excavator.backend.submission', []).

factory('backend.submission.create', [
  '$http',
  function ($http) {
    return function (form, data) {
      return $http.post('/backend/submissions/create', {
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
      return $http.get('/backend/submissions/' + id);
    };
  }
]).

factory('backend.submission.list', [
  '$http',
  function ($http) {
    return function (params) {
      return $http.get('/backend/submissions', {params: params});
    };
  }
]).

factory('backend.submission.status', [
  '$http',
  function ($http) {
    return function (prefix, id, status) {
      prefix = prefix || '/backend';
      return $http.put(prefix + '/submissions/' + id + '/status/' + status);
    };
  }
]);
