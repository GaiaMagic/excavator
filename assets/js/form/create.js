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
                '<div class="form-group" ng-if="form.parent">',
                  '<label for="parent" class="col-sm-2 control-label">',
                    'Parent</label>',
                  '<div class="col-sm-10" ng-if="!parentDirty">',
                    '<p class="form-control-static">',
                      '<span ng-bind="form.parent"></span> ',
                      '<a href ng-click="$parent.parentDirty=true">edit</a>',
                    '</p>',
                  '</div>',
                  '<div class="col-sm-10" ng-if="parentDirty">',
                    '<input type="text" class="form-control" id="parent" ',
                      'placeholder="Parent of the form" ',
                      'ng-model="form.parent">',
                  '</div>',
                '</div>',
                '<div class="form-group">',
                  '<label for="title" class="col-sm-2 control-label">',
                    'Title</label>',
                  '<div class="col-sm-10">',
                    '<input type="text" class="form-control" id="title" ',
                      'placeholder="Title of the form" ng-model="form.title">',
                  '</div>',
                '</div>',
              '</div>',
              '<div class="modal-footer">',
                '<button type="submit" class="btn btn-info" ',
                  'ng-disabled="!form.title">Save</button>',
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
    return function (currentForm, schemeData) {
      var deferred = $q.defer();
      var modal;
      if (angular.isObject(currentForm)) {
        modal = $modal({
          title: 'Save Changes To ' + currentForm.title,
          template: 'form.create.new.template'
        });
        modal.$scope.form = {
          title: currentForm.title,
          parent: currentForm.form._id
        };
        modal.$scope.submit = function () {
          modal.hide();
          var title = modal.$scope.form.title;
          var content = stringify(schemeData);
          var parent = modal.$scope.form.parent;
          create(title, content, parent).then(function (res) {
            alert('Successfully updated ' + title + '.', 'OK');
            deferred.resolve(res.data);
          }, function (err) {
            panic(err);
            deferred.reject({
              content: content
            });
          });
        };
      } else {
        modal = $modal({
          title: 'Create New Form',
          template: 'form.create.new.template'
        });
        modal.$scope.form = form;
        modal.$scope.submit = function () {
          modal.hide();
          var content = stringify(schemeData);
          create(form.title, content).then(function (res) {
            alert('Successfully created ' + form.title + '.', 'OK');
            deferred.resolve(res.data);
          }, function (err) {
            panic(err);
            deferred.reject({
              content: content
            });
          });
        };
      }
      return deferred.promise;
    };
  }
]);
