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
    return function (currentTpl, tplData, options) {
      var deferred = $q.defer();
      var modal;
      options = options || {};

      function __update () {
        return update(currentTpl._id,
          modal ? modal.$scope.tpl.name : currentTpl.name,
          tplData.form, tplData.files);
      }

      function __add () {
        return create(tpl.name, tplData.form, tplData.files);
      }

      if (angular.isObject(currentTpl)) {
        if (options.silent) return __update();
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
          __update().then(function (res) {
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
        if (options.silent) return __add();
        modal = $modal({
          title: tr('tpl::Create New Template'),
          template: '/templates/create.html'
        });
        modal.$scope.submit = function () {
          modal.hide();
          __add().then(function (res) {
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
]).

run([
  '$templateCache',
  'i18n.translate',
  function ($templateCache, tr) {
    $templateCache.put('code-editor', [
      '<div class="modal" tabindex="-1" role="dialog">',
        '<div class="modal-dialog" style="width: 90%; ',
          'margin-left: auto; margin-right: auto; height: calc(100% - 60px);">',
          '<div class="modal-content" style="height: 100%;">',
            '<div class="modal-body" style="height: calc(100% - 65px);">',
              '<textarea class="form-control monospace" behave-editor="code" ',
                'ng-model="code" style="height: 100%;"></textarea>',
            '</div>',
            '<div class="modal-footer">',
              '<p class="text-danger pull-left" ng-bind="errorText"></p>',
              '<button type="button" class="btn btn-primary" ',
                'ng-click="save()">',
                tr('tpl::Save Code'),
              '</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''));
  }
]).

factory('tpl.code', [
  '$modal',
  'i18n.translate',
  function ($modal, tr) {
    return function showCodeEditor (currentTpl) {
      if (!currentTpl) return;
      var modal = $modal({
        template: 'code-editor'
      });
      var scope = modal.$scope;
      scope.code = angular.toJson(currentTpl.files, true);
      scope.save = function () {
        var code = scope.$getcode();
        try {
          code = angular.fromJson(code);
        } catch (e) {
          return scope.errorText = e.message;
        }
        if (!angular.isArray(code)) {
          return scope.errorText = tr('tpl::Code should return an ' +
            'array of files.');
        }
        modal.hide();
        if (angular.isArray(currentTpl.files)) {
          currentTpl.files.splice(0, currentTpl.files.length);
        } else {
          currentTpl.files = [];
        }
        code.forEach(function (file) {
          currentTpl.files.push(file);
        });
      };
    };
  }
]);
