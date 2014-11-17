angular.module('excavator.form.manager', []).

run([
  '$templateCache',
  function (cache) {
    cache.put('manager.access.control.template', [
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
                '<div class="row">',
                  '<div class="col-xs-6">',
                    '<div class="panel panel-default">',
                      '<div class="panel-heading">Search results</div>',
                      '<div class="list-group">',
                        '<div class="list-group-item">',
                          '<input class="form-control" type="text" ',
                            'placeholder="Search form" ng-model="query" ',
                            'ng-model-options="{debounce: 300}">',
                        '</div>',
                        '<div class="list-group-item" ',
                          'ng-repeat="result in results">',
                          '<a href="/control/forms/edit/{{ result._id }}" ',
                            'target="_blank" ng-bind="result.title"></a>',
                          '<div class="pull-right">',
                            '<button class="btn btn-xs btn-success" ',
                              'type="button" ng-click="add(forms, result)">',
                              'Add</button>',
                          '</div>',
                        '</div>',
                      '</div>',
                    '</div>',
                  '</div>',
                  '<div class="col-xs-6">',
                    '<div class="panel panel-default">',
                      '<div class="panel-heading">Current forms</div>',
                      '<div class="list-group">',
                        '<div class="list-group-item" ',
                          'ng-if="!forms || !forms.length">',
                          '<p>This manager will have no access to any form.',
                          '</p>',
                        '</div>',
                        '<div class="list-group-item" ',
                          'ng-repeat="form in forms">',
                          '<a href="/control/forms/edit/{{ form._id }}" ',
                            'target="_blank" ng-bind="form.title"></a>',
                          '<div class="pull-right">',
                            '<button class="btn btn-xs btn-danger" ',
                              'type="button" ng-click="remove(forms, $index)">',
                              'Remove</button>',
                          '</div>',
                        '</div>',
                      '</div>',
                    '</div>',
                  '</div>',
                '</div>',
              '</div>',
              '<div class="modal-footer">',
                '<div class="btn-toolbar">',
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

factory('manager.access.control', [
  '$injector',
  '$modal',
  '$q',
  'backend.form.search',
  'backend.manager.form.save',
  'func.panic',
  'resolver.manager',
  function ($injector, $modal, $q, search, save, panic, managerResolver) {
    return function (user) {
      var deferred = $q.defer();
      var modal;
      modal = $modal({
        title: 'Form access for ' + user.username,
        template: 'manager.access.control.template'
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
