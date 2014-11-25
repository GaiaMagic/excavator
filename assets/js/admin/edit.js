/*
  for gettext:
    - tr('forms::(unlabeled)')
*/
angular.module('excavator.admin.edit', []).

controller('controller.control.form.edit', [
  '$injector',
  '$scope',
  '$timeout',
  '$route',
  'schemes',
  'form.access.control',
  'form.create.new',
  'func.array',
  'func.dom.input.remember.state',
  'func.localstorage.load',
  'func.localstorage.remove',
  'func.localstorage.save',
  'func.scheme.parse',
  'func.scheme.stringify',
  'func.panic',
  'currentForm',
  'i18n.translate',
  'shared.domains',
  function (
    $injector,
    $scope,
    $timeout,
    $route,
    schemes,
    accessControl,
    createNew,
    funcArray,
    rememberState,
    load,
    remove,
    save,
    parse,
    stringify,
    panic,
    currentForm,
    tr,
    domains
  ) {
  if (angular.isUndefined(currentForm)) {
    this.form = {};
    this.form.content = load('schemedata', parse) || {scheme:[]};
    this.isNew = true;
  } else if (currentForm === false) {
    return panic(tr('forms::Form is corrupted.'));
  } else {
    this.form = currentForm;
    this.isNew = false;
  }

  this.form.content.data = this.form.content.data || {};

  this.def_formdata = tr('forms::Form data will appear here ' +
    'once you submit the form.', undefined, { fake: true });
  this.submit = function () {
    this.formdata = angular.toJson(this.form.content.data, true);
  };

  this.showPreview = true;

  this.clearData = function () {
    var data = this.form.content.data;
    for (var key in data) {
      delete data[key];
    }
  };

  this.save = function () {
    var self = this;
    createNew(currentForm, this.form.content).then(function () {
      if (currentForm) {
        $route.reload();
      }
    }).catch(function (data) {
      save('schemedata', self.schemedata);
    });
  };

  this.access = function () {
    var self = this;
    accessControl(currentForm).then(function (form) {
      self.form.form.managers = form.managers;
    });
  };

  this.schemes = schemes.list();

  this.add = function (name, version) {
    var scheme = schemes.get(name, version);
    if (angular.isUndefined(scheme)) return panic(tr('forms::No such item.'));
    var schemeDefaults;
    if (angular.isArray(scheme.schemeDefaults)) {
      schemeDefaults = $injector.invoke(scheme.schemeDefaults);
    }
    var schemeToAdd = angular.extend({
      type: name,
      version: version
    }, schemeDefaults);
    this.form.content.scheme.push(schemeToAdd);
  };

  this.clear = function () {
    this.form.content.scheme.splice(0);
    remove('schemedata');
  };

  this.array = funcArray;
  this.tr = tr;
  this.domains = domains;

  var self = this;
  var debounce;
  $scope.$watch(function () {
    return self.form.content.scheme;
  }, function (value) {
    if (debounce) {
      $timeout.cancel(debounce);
    }
    debounce = $timeout(function () {
      $scope.$broadcast('update scheme view', value, rememberState());
      self.schemedata = stringify(self.form.content, ['scheme']);
      debounce = undefined;
    }, 100);
  }, true);
}]);
