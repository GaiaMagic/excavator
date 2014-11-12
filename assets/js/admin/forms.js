angular.module('excavator.admin.forms', []).

controller('controller.control.form.list', [
  'forms',
  function (forms) {
    this.forms = forms;
  }
]);
