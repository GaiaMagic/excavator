angular.module('excavator.form.manager', []).

factory('manager.access.control', [
  '$injector',
  '$modal',
  '$q',
  'backend.form.search',
  'backend.manager.form.save',
  'func.panic',
  'i18n.translate',
  'resolver.manager',
  function ($injector, $modal, $q, search, save, panic, tr, managerResolver) {
    return function (user) {
      var deferred = $q.defer();
      var modal;
      modal = $modal({
        title: tr('forms::Form access for {{username}}', {
          username: user.username
        }),
        template: '/forms/manager.html'
      });
      modal.$scope.remove = function (list, index) {
        if (!angular.isArray(list)) return;
        list.splice(index, 1);
        update();
      };
      modal.$scope.add = function (list, item) {
        if (!angular.isArray(list)) return;
        list.push(item);
        update();
      };
      var results;
      modal.$scope.$watch('query', function (query) {
        search(query || '').then(function (res) {
          results = res.data;
          modal.$scope.results = angular.copy(results);
          update();
        }).catch(function () {
          modal.$scope.results = [];
        });
      });
      function update () {
        if (!angular.isArray(modal.$scope.forms)) return;
        if (!angular.isArray(results)) return;
        var added = modal.$scope.forms.map(function (form) {
          return form._id;
        });
        modal.$scope.results = results.filter(function (result) {
          return added.indexOf(result._id) === -1;
        });
      }
      var forms;
      $injector.invoke(managerResolver({
        managerId: user._id
      })).then(function (user) {
        modal.$scope.forms = user.forms;
        update();
        forms = user.forms.map(function (form) {
          return form._id;
        });
      }, panic);
      modal.$scope.changed = function () {
        var curr = modal.$scope.forms || [];
        return !angular.equals(forms, curr.map(function (form) {
          return form._id;
        }));
      };
      modal.$scope.submit = function () {
        var forms = modal.$scope.forms;
        if (!angular.isArray(forms)) return;
        forms = forms.map(function (form) {
          return form._id;
        });
        save(user._id, forms).then(function () {
          deferred.resolve();
        }).catch(function (err) {
          panic(err);
          deferred.reject();
        }).finally(function () {
          modal.hide();
        });
      };
      return deferred.promise;
    };
  }
]);
