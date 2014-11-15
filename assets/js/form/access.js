angular.module('excavator.form.access', []).

run([
  '$templateCache',
  function (cache) {
    cache.put('form.access.control.template', [
      '<div class="modal" tabindex="-1" role="dialog">',
        '<div class="modal-dialog">',
          '<div class="modal-content">',
            '<form class="form-horizontal" role="form" ng-submit="submit()">',
              '<div class="modal-header" ng-show="title">',
                '<button type="button" class="close" ',
                  'ng-click="$hide()">&times;</button>',
                '<h4 class="modal-title" ng-bind="title"></h4>',
              '</div>',
              '<div class="modal-body">',
                '<div class="form-group">',
                  '<label for="filter" class="col-sm-2 control-label">',
                    'Managers</label>',
                  '<div class="col-sm-10">',
                    '<input type="text" class="form-control" id="filter" ',
                      'placeholder="Enter keyword to filter managers" ',
                      'ng-model="filter.username">',
                  '</div>',
                '</div>',
                '<div class="form-group">',
                  '<div class="col-sm-10 col-sm-offset-2">',
                    '<div class="list-group">',
                      '<a href class="list-group-item" ',
                        'ng-click="manager.accessible=!manager.accessible" ',
                        'ng-repeat="manager in managers | filter:filter">',
                        '<span ng-bind="manager.username"></span>',
                        '<span class="glyphicon glyphicon-ok pull-right" ',
                          'ng-show="manager.accessible"></span>',
                      '</a>',
                    '</div>',
                  '</div>',
                '</div>',
              '</div>',
              '<div class="modal-footer">',
                '<div class="btn-toolbar">',
                  '<div class="btn-group">',
                    '<button type="button" class="btn btn-default" ',
                      'ng-click="set(managers, \'accessible\', true)">',
                      'Select All</button>',
                    '<button type="button" class="btn btn-default" ',
                      'ng-click="set(managers, \'accessible\', false)">',
                      'Deselect All</button>',
                  '</div>',
                  '<button type="submit" class="btn btn-info" ',
                    'ng-disabled="!changed()">Save</button>',
                '</div>',
              '</div>',
            '</form>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''));
  }
]).

factory('form.access.control', [
  '$injector',
  '$modal',
  '$q',
  'backend.form.update.managers',
  'func.panic',
  'func.panic.alert',
  'resolver.managers',
  function (
    $injector,
    $modal,
    $q,
    updateManagers,
    panic,
    alert,
    managersResolver
  ) {
    var form = {};
    return function (currentForm) {
      var deferred = $q.defer();
      if (!angular.isObject(currentForm)) {
        panic('You must create a form first, so its access control settings ' +
          'can be modified.');
        deferred.reject();
        return deferred.promise;
      }
      var modal;
      modal = $modal({
        title: 'Read-only access to ' + currentForm.title,
        template: 'form.access.control.template'
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
          alert('Successfully updated access control.', 'OK');
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
