angular.module('excavator.form.create', []).

factory('form.create.new', [
  '$modal',
  '$q',
  'backend.form.create',
  'func.panic',
  'func.panic.alert',
  'func.scheme.stringify',
  'i18n.translate',
  function ($modal, $q, create, panic, alert, stringify, tr) {
    var form = {};
    return function (currentForm, schemeData) {
      var deferred = $q.defer();
      var modal;
      if (angular.isObject(currentForm)) {
        modal = $modal({
          title: tr('forms::Save Changes To {{title}}', {
            title: currentForm.title
          }),
          template: '/forms/create.html'
        });
        var tpl = currentForm.form.head.template;
        modal.$scope.form = {
          title: currentForm.title,
          parent: currentForm.form._id,
          slug: currentForm.slug,
          template: tpl ? tpl._id : undefined
        };
        modal.$scope.submit = function () {
          modal.hide();
          var title = modal.$scope.form.title;
          var content = stringify(schemeData, ['scheme']);
          var parent = modal.$scope.form.parent;
          var slug = modal.$scope.form.slug;
          var tpl = modal.$scope.form.template;
          create(title, content, parent, slug, tpl).then(function (res) {
            alert(tr('forms::Successfully updated {{title}}.', {
              title: title
            }), tr('forms::Success'));
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
          title: tr('forms::Create New Form'),
          template: '/forms/create.html'
        });
        modal.$scope.form = form;
        modal.$scope.submit = function () {
          modal.hide();
          var content = stringify(schemeData, ['scheme']);
          var slug = form.slug;
          var tpl = form.template;
          create(form.title, content, undefined, slug, tpl).
          then(function (res) {
            alert(
              tr(
                'forms::Successfully created {{title}}. You will be ' +
                'redirected to the form edit page.', {
                  title: form.title
                }
              ),
              tr('forms::Success'),
              '/forms/edit/' + res.data.parent
            );
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
