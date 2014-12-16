angular.module('excavator.tpl.create', []).

factory('tpl.create', [
  '$modal',
  '$q',
  'backend.template.create',
  'backend.template.update',
  'func.panic',
  'func.panic.alert',
  'i18n.translate',
  function (
    $modal,
    $q,
    create,
    update,
    panic,
    alert,
    tr
  ) {
    var tpl = {};
    return function (currentTpl, tplData) {
      var deferred = $q.defer();
      var modal;
      if (angular.isObject(currentTpl)) {
        modal = $modal({
          title: tr('tpl::Save Changes To {{name}}', {
            name: currentTpl.name
          }),
          template: '/templates/create.html'
        });
        modal.$scope.tpl = {
          name: currentTpl.name
        };
        modal.$scope.submit = function () {
          modal.hide();
          update(currentTpl._id, modal.$scope.tpl.name,
          tplData.form, tplData.files).then(function (res) {
            alert(tr('tpl::Successfully updated {{name}}.', {
              name: currentTpl.name
            }), tr('tpl::Success'));
            deferred.resolve(res.data);
          }, function (err) {
            panic(err);
            deferred.reject(err);
          });
        };
      } else {
        modal = $modal({
          title: tr('tpl::Create New Template'),
          template: '/templates/create.html'
        });
        modal.$scope.submit = function () {
          modal.hide();
          create(tpl.name, tplData.form, tplData.files).then(function (res) {
            alert(
              tr(
                'tpl::Successfully created {{name}}. You will be ' +
                'redirected to the template edit page.', {
                  name: tpl.name
                }
              ),
              tr('tpl::Success'),
              '/templates/edit/' + res.data._id
            );
            deferred.resolve(res.data);
          }, function (err) {
            panic(err);
            deferred.reject(err);
          });
        };
        modal.$scope.tpl = tpl;
      }
      return deferred.promise;
    };
  }
]);
