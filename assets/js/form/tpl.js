angular.module('excavator.form.template', []).

factory('form.set.template', [
  '$injector',
  '$modal',
  '$q',
  'backend.form.update.template',
  'func.panic',
  'func.panic.alert',
  'i18n.translate',
  'resolver.templates',
  'shared.domains',
  function (
    $injector,
    $modal,
    $q,
    applyTemplate,
    panic,
    alert,
    tr,
    templatesResolver,
    domains
  ) {
    return function (currentForm) {
      var deferred = $q.defer();
      if (!angular.isObject(currentForm)) {
        panic(tr('forms::You must create a form first, so you can ' +
          'assign a template for it.'));
        deferred.reject();
        return deferred.promise;
      }
      var modal;
      modal = $modal({
        title: tr('forms::Set template for {{title}}', {
          title: currentForm.title
        }),
        template: '/forms/tpl.html'
      });
      var templates = $injector.invoke(templatesResolver());
      templates.then(function (templates) {
        modal.$scope.templates = templates;
        if (currentForm.form.head.template) {
          modal.$scope.selected = templates.filter(function (tpl) {
            return tpl._id === currentForm.form.head.template._id;
          })[0];
        }
      }, panic);
      modal.$scope.submit = function () {
        modal.hide();
        var selected = modal.$scope.selected;
        var tplid;
        if (selected && selected._id) tplid = selected._id;
        applyTemplate(currentForm.form._id, tplid).then(function (res) {
          alert(tr('forms::Successfully updated template.'),
            tr('forms::Success'));
          deferred.resolve(res.data);
        }, function (err) {
          panic(err);
          deferred.reject();
        });
      };
      modal.$scope.preview = function () {
        var sel = modal.$scope.selected;
        return '//' + domains.public + '/' + currentForm.form.slug +
          (sel ? '/preview:' + sel._id : '');
      };
      return deferred.promise;
    };
  }
]);
