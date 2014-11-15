angular.module('excavator.admin.forms', []).

controller('controller.control.form.list', [
  '$location',
  '$routeParams',
  'forms',
  function (
    $location,
    $routeParams,
    forms
  ) {
    this.forms = forms;
    this.manager = $routeParams.manager;
    this.filter = function () {
      $location.search('manager', this.manager || null);
    };
  }
]);
