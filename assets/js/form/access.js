angular.module('excavator.form.access', []).

factory('form.access.control', [
  '$injector',
  '$modal',
  '$q',
  'backend.form.update.managers',
  'func.panic',
  'func.panic.alert',
  'i18n.translate',
  'resolver.managers',
  function (
    $injector,
    $modal,
    $q,
    updateManagers,
    panic,
    alert,
    tr,
    managersResolver
  ) {
    var form = {};
    return function (currentForm) {
      var deferred = $q.defer();
      if (!angular.isObject(currentForm)) {
        panic(tr('forms::You must create a form first, so its access ' +
          'control settings can be modified.'));
        deferred.reject();
        return deferred.promise;
      }
      var modal;
      modal = $modal({
        title: tr('forms::Read-only access to {{title}}', {
          title: currentForm.title
        }),
        template: '/forms/access.html'
      });
      var managers = $injector.invoke(managersResolver());
      var accessibles = {};
      managers.then(function (managers) {
        for (var i = 0; i < managers.length; i++) {
          managers[i].accessible = false;
          if (angular.isArray(managers[i].forms) &&
            managers[i].forms.indexOf(currentForm.form._id) > -1) {
            managers[i].accessible = true;
            accessibles[managers[i]._id] = true;
          }
        }
        modal.$scope.managers = managers;
      }, panic);
      modal.$scope.set = function (array, key, value) {
        for (var i = 0; i < array.length; i++) {
          array[i][key] = value;
        }
      };
      function selected () {
        var ret = {};
        var keys = Object.keys(accessibles);
        var managers = modal.$scope.managers || [];
        for (var i = 0; i < managers.length; i++) {
          var manager = managers[i];
          if (manager.accessible && keys.indexOf(manager._id) === -1) {
            ret[manager._id] = true;
          } else if (angular.isDefined(accessibles[manager._id])) {
            ret[manager._id] = managers[i].accessible;
          }
        }
        return ret;
      }
      modal.$scope.changed = function () {
        return !angular.equals(accessibles, selected());
      };
      modal.$scope.submit = function () {
        modal.hide();
        updateManagers(currentForm.form._id, selected()).then(function (res) {
          alert(tr('forms::Successfully updated access control.'),
            tr('forms::Success'));
          deferred.resolve(res.data);
        }, function (err) {
          panic(err);
          deferred.reject();
        });
      };
      return deferred.promise;
    };
  }
]);
