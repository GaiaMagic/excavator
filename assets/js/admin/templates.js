angular.module('excavator.admin.templates', []).

controller('controller.control.template.edit', [
  '$route',
  '$sce',
  '$scope',
  'func.array',
  'func.localstorage.load',
  'func.localstorage.save',
  'misc.template.filetypes',
  'shared.domains',
  'tpl.create',
  'currentTpl',
  function (
    $route,
    $sce,
    $scope,
    array,
    load,
    save,
    filetypes,
    domains,
    saveTpl,
    currentTpl
  ) {
    var self = this;
    this.array = array;
    this.types = filetypes;
    this.live = load('template.live');
    if (this.live === 'false') {
      this.live = false;
    } else {
      this.live = true;
    }

    this.toggleLive = function () {
      this.live = !this.live;
      if (this.live) {
        this.update();
      }
      save('template.live', this.live);
    };

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
      saveTpl(currentTpl, this.tpl).then(function () {
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
    this.update = function () {
      if (!this.tpl.form || !this.tpl._id) return;
      var previewUrl = '//' + domains.public + '/' + this.tpl.form +
        '/preview:' + this.tpl._id;
      this.previewUrl = $sce.trustAsResourceUrl(previewUrl);
      saveTpl(this.tpl, this.tpl, { silent: true }).then(function () {
        $scope.$emit('update template preview');
      });
    };
    this.update();

    $scope.$watch(function () {
      return self.tpl;
    }, function (tpl, old) {
      if (angular.equals(tpl, old)) return;
      if (!self.live) return;
      self.update();
    }, true);
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
