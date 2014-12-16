angular.module('excavator.admin.templates', []).

controller('controller.control.template.edit', [
  '$route',
  'func.array',
  'misc.template.filetypes',
  'tpl.create',
  'currentTpl',
  function (
    $route,
    array,
    filetypes,
    create,
    currentTpl
  ) {
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
      this.tpl.files.push({ type: 'text/css', content: '' });
    };

    this.save = function () {
      create(currentTpl, this.tpl).then(function () {
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
  }
]).

controller('controller.control.template.list', [
  'templates',
  function (templates) {
    this.tpls = templates;
  }
]);
