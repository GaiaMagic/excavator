angular.module('excavator.public.public', []).

factory('public.public.forms', [
  '$http',
  function ($http) {
    return function (formid) {
      return $http.get('/public/forms/' + formid);
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
