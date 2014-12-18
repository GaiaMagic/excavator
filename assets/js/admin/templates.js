angular.module('excavator.admin.templates', []).

controller('controller.control.template.edit', [
  '$route',
  '$sce',
  '$scope',
  'func.array',
  'misc.template.filetypes',
  'shared.domains',
  'tpl.create',
  'currentTpl',
  function (
    $route,
    $sce,
    $scope,
    array,
    filetypes,
    domains,
    save,
    currentTpl
  ) {
    var self = this;
    this.array = array;
    this.types = filetypes;

    if (currentTpl) {
      this.tpl = currentTpl;
      this.isNew = false;
    } else {
      this.tpl = {};
      this.isNew = true;
    }
    this.add = function () {
      this.tpl.files = this.tpl.files || [];
      this.tpl.files.push({
        type: 'text/css',
        content: ''
      });
    };

    this.save = function () {
      save(currentTpl, this.tpl).then(function () {
        if (currentTpl) {
          $route.reload();
        }
      });
    };
    this.savable = function () {
      if (!currentTpl) {
        return angular.isArray(this.tpl.files) && this.tpl.files.length;
      }
      return true;
    };

    $scope.$watch(function () {
      return self.tpl;
    }, function (tpl, old) {
      if (angular.equals(tpl, old)) return;
      save(currentTpl, tpl, { silent: true }).then(function () {
        $scope.$emit('update template preview');
      });
    }, true);

    var previewUrl = '//' + domains.public + '/' + currentTpl.form + '/preview:' + currentTpl._id;
    this.previewUrl = $sce.trustAsResourceUrl(previewUrl);
  }
]).

controller('controller.control.template.list', [
  'templates',
  function (templates) {
    this.tpls = templates;
  }
]).

directive('templatePreview', [
  function () {
    return {
      link: function ($scope, $element, $attrs) {
        $scope.$on('update template preview', function () {
          $element[0].src += '';
        });
      }
    };
  }
]);
