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

run([
  '$rootScope',
  '$document',
  function ($rootScope, $document) {
    $rootScope.$on('global-meta', function (e, val) {
      if (angular.isObject(val) && angular.isString(val.title)) {
        $document[0].title = val.title;
      }
    });
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
