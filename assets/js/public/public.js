angular.module('excavator.public.public', [
  'excavator.func.localstorage',
  'excavator.i18n',
  'excavator.misc.share',
  'excavator.shared.domains',
  'excavator.shared.nav.meta',
  'mgcrea.ngStrap.datepicker'
]).

config([
  '$datepickerProvider',
  function ($datepickerProvider) {
    $datepickerProvider.defaults.template = '/datepicker.html';
  }
]).

run([
  '$rootScope',
  '$document',
  'shared.nav.meta',
  function ($rootScope, $document, meta) {
    meta.watch($rootScope, function (val) {
      if (angular.isObject(val.data) && angular.isString(val.data.title)) {
        $document[0].title = val.data.title;
      }
    });
  }
]).

factory('public.public.template.get', [
  '$http',
  function ($http) {
    return function (templateid) {
      return $http.get('/public/templates/' + templateid);
    };
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
]).

directive('link', [
  'shared.domains',
  function (domains) {
    return {
      link: function ($scope, $element, $attrs) {
        if ($attrs.rel === 'cdn') {
          if ($attrs.href.indexOf('//') > -1) {
            domains.cdn = $attrs.href.replace(/\/+$/, '');
          }
        }
      }
    };
  }
]);
