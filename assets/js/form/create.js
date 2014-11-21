angular.module('excavator.form.create', []).

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
          template: '/forms/create.html'
        });
        modal.$scope.form = {
          title: currentForm.title,
          parent: currentForm.form._id,
          slug: currentForm.slug
        };
        modal.$scope.submit = function () {
          modal.hide();
          var title = modal.$scope.form.title;
          var content = stringify(schemeData);
          var parent = modal.$scope.form.parent;
          var slug = modal.$scope.form.slug;
          create(title, content, parent, slug).then(function (res) {
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
          template: '/forms/create.html'
        });
        modal.$scope.form = form;
        modal.$scope.submit = function () {
          modal.hide();
          var content = stringify(schemeData);
          var slug = form.slug;
          create(form.title, content, undefined, slug).then(function (res) {
            alert('Successfully created ' + form.title + '. You will be ' +
              'redirected to the form edit page.', 'OK',
              '/forms/edit/' + res.data.parent);
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
