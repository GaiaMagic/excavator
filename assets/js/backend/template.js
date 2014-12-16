angular.module('excavator.backend.template', []).

factory('backend.template.create', [
  '$http',
  function ($http) {
    return function (name, form, files) {
      return $http.post('/backend/templates', {
        name: name,
        form: form,
        files: files
      });
    };
  }
]).

factory('backend.template.get', [
  '$http',
  function ($http) {
    return function (templateid) {
      return $http.get('/backend/templates/' + templateid);
    };
  }
]).

factory('backend.template.list', [
  '$http',
  function ($http) {
    return function () {
      return $http.get('/backend/templates');
    };
  }
]).

factory('backend.template.update', [
  '$http',
  function ($http) {
    return function (templateid, name, form, files) {
      return $http.put('/backend/templates/' + templateid, {
        name: name,
        form: form,
        files: files
      });
    };
  }
]);
