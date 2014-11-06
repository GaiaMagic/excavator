angular.module('excavator.backend.form', []).

factory('backend.form.create', [
  '$http',
  function ($http) {
    return function (title, content, parent) {
      return $http.post('/forms/create', {
        title: title,
        content: content,
        parent: parent
      });
    };
  }
]).

factory('backend.form.get', [
  '$http',
  function ($http) {
    return function (formid) {
      return $http.get('/forms/' + formid);
    };
  }
]).

factory('backend.form.list', [
  '$http',
  function ($http) {
    return function (title, content) {
      return $http.get('/forms');
    };
  }
]);
