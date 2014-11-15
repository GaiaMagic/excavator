angular.module('excavator.admin.managers', []).

controller('controller.control.manager.list', [
  '$route',
  'backend.manager.register',
  'managers',
  'func.panic',
  function ($route, register, managers, panic) {
    this.managers = managers;

    this.manager = {
      register: function () {
        var self = this;
        register(this.username, this.password).then(function () {
          self.username = undefined;
          self.password = undefined;
          $route.reload();
        }).catch(panic);
      }
    };
  }
]);
