angular.module('excavator.admin.managers', []).

controller('controller.control.manager.list', [
  'managers',
  function (managers) {
    this.managers = managers;
  }
]);
