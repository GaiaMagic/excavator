angular.module('excavator.vendor.angular.strap', [
  'mgcrea.ngStrap.modal',
  'mgcrea.ngStrap.datepicker',
  'mgcrea.ngStrap.collapse'
]).

config([
  '$datepickerProvider',
  function ($datepickerProvider) {
    $datepickerProvider.defaults.template = '/datepicker.html';
  }
]);
