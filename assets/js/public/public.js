angular.module('excavator.public.public', [
  'excavator.func.localstorage',
  'excavator.i18n',
  'mgcrea.ngStrap.datepicker'
]).

config([
  '$datepickerProvider',
  function ($datepickerProvider) {
    $datepickerProvider.defaults.template = '/vendors/datepicker.html';
  }
]).

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
