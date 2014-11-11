angular.module('excavator.public.public', []).

factory('public.public.forms', [
  '$http',
  function ($http) {
    return function (id, revid) {
      return $http.get('/public/forms/' + id + (revid ? '/' + revid : ''));
    };
  }
]).

factory('public.public.forms.submit', [
  '$http',
  function ($http) {
    return function (formid, data) {
      return $http.post('/public/submit', {
        form: formid,
        data: data
      });
    };
  }
]);
