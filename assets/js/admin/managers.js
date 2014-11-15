angular.module('excavator.admin.managers', []).

controller('controller.control.manager.list', [
  '$route',
  'backend.manager.register',
  'backend.manager.remove',
  'managers',
  'func.panic',
  'func.panic.confirm',
  function ($route, register, remove, managers, panic, confirm) {
    this.managers = managers;

    this.manager = {
      delete: function (manager) {
        confirm(
          'Are you sure you want to delete manager ' + manager.username + ' ?',
          undefined,
          { class: 'btn-danger',
            text: 'Yes, delete this manager' },
          { text: 'Cancel' }
        ).then(function () {
          remove(manager._id).then(function () {
            $route.reload();
          }).catch(panic);
        });
      },
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
