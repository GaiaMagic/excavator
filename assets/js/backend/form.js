angular.module('excavator.backend.form', []).

factory('backend.form.create', [
  '$http',
  'func.panic',
  function ($http, panic) {
    return function (title, content) {
      return $http.post('/forms/create', {
        title: title,
        content: content
      });
    };
  }
]);
