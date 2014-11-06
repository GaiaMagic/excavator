angular.module('excavator.admin.manage', []).

controller('AdminManageController', [
  'backend.form.list',
  function (list) {
    var self = this;
    list().then(function (res) {
      self.forms = res.data;
    });
  }
]);
