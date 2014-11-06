angular.module('excavator.form.create', []).

run([
  '$templateCache',
  function (cache) {
    cache.put('form.create.new.template', [
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
                  '<label for="name" class="col-sm-2 control-label">',
                    'Name</label>',
                  '<div class="col-sm-10">',
                    '<input type="text" class="form-control" id="name" ',
                      'placeholder="Name of the form" ng-model="form.name">',
                  '</div>',
                '</div>',
              '</div>',
              '<div class="modal-footer">',
                '<button type="submit" class="btn btn-info" ',
                  'ng-disabled="!form.name">Create</button>',
              '</div>',
            '</form>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''));
  }
]).

factory('form.create.new', [
  '$modal',
  '$q',
  'backend.form.create',
  'func.panic',
  'func.panic.alert',
  'func.scheme.stringify',
  function ($modal, $q, create, panic, alert, stringify) {
    var form = {};
    return function (object) {
      var deferred = $q.defer();
      var modal = $modal({
        title: 'Create New Form',
        template: 'form.create.new.template'
      });
      modal.$scope.form = form;
      modal.$scope.submit = function () {
        modal.hide();
        var content = stringify(object);
        create(form.name, content).then(function (res) {
          alert('Successfully created ' + form.name + '.', 'OK');
          deferred.resolve(res.data);
        }, function (err) {
          panic(err);
          deferred.reject({
            content: content
          });
        });
      };
      return deferred.promise;
    };
  }
]);
