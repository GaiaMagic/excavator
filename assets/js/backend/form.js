angular.module('excavator.backend.form', []).

factory('backend.form.create', [
  '$http',
  function ($http) {
    return function (title, content, parent, slug) {
      return $http.post('/backend/forms/create', {
        title: title,
        content: content,
        parent: parent,
        slug: slug
      });
    };
  }
]).

factory('backend.form.get', [
  '$http',
  function ($http) {
    return function (id, revid) {
      return $http.get('/backend/forms/' + id + (revid ? '/' + revid : ''));
    };
  }
]).

factory('backend.form.list', [
  '$http',
  function ($http) {
    return function (params) {
      return $http.get('/backend/forms', {params: params});
    };
  }
]).

factory('backend.form.search', [
  '$http',
  function ($http) {
    return function (query) {
      return $http.get('/backend/forms/search', {params: {query: query}});
    };
  }
]).

factory('backend.form.update.managers', [
  '$http',
  function ($http) {
    return function (formid, operation) {
      return $http.post('/backend/forms/' + formid + '/managers', operation);
    };
  }
]);
