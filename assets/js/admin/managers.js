angular.module('excavator.admin.managers', []).

controller('controller.control.manager.list', [
  '$route',
  'backend.manager.ban',
  'backend.manager.register',
  'backend.manager.remove',
  'managers',
  'func.panic',
  'func.panic.alert',
  'func.panic.confirm',
  'manager.access.control',
  function (
    $route,
    ban,
    register,
    remove,
    managers,
    panic,
    alert,
    confirm,
    accessControl
  ) {
    this.managers = managers;
    this.manager = {
      access: function (manager) {
        accessControl(manager).then(function () {
          $route.reload();
        });
      },
      ban: function (manager) {
        var promise;
        if (manager.banned) {
          promise = ban(manager._id, true).catch(panic);
        } else {
          promise = confirm(
            'Are you sure you want to ban manager ' + manager.username + ' ?',
            undefined,
            { class: 'btn-danger',
              text: 'Yes, ban this manager' },
            { text: 'Cancel' }
          ).then(function () {
            return ban(manager._id, manager.banned).catch(panic);
          });
        }
        promise.then(function () {
          $route.reload();
        });
      },
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
