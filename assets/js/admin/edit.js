angular.module('excavator.admin.edit', [
  'excavator.fixtures'
]).

controller('AdminEditController', [
  '$scope',
  '$timeout',
  '$document',
  '$route',
  '$routeParams',
  'schemes',
  'fixtures.admin.edit',
  'form.create.new',
  'func.array',
  'func.dom.input.remember.state',
  'func.localstorage.load',
  'func.localstorage.remove',
  'func.localstorage.save',
  'func.scheme.parse',
  'func.panic',
  'currentForm',
  function (
    $scope,
    $timeout,
    $document,
    $route,
    $routeParams,
    schemes,
    fixtures,
    createNew,
    funcArray,
    rememberState,
    load,
    remove,
    save,
    parse,
    panic,
    currentForm
  ) {
  if (angular.isUndefined(currentForm)) {
    this.form = {};
    this.form.content = load('schemedata', parse) || fixtures;
    this.form.title = undefined;
  } else if (currentForm === false) {
    return panic('Form is corrupted.');
  } else {
    this.form = currentForm;
  }

  this.formdata = 'Form data will appear here once you submit the form.';
  this.submit = function () {
    this.formdata = angular.toJson(this.form.content.data, true);
  };

  this.clear = function () {
    var data = this.form.content.data;
    for (var key in data) {
      delete data[key];
    }
  };

  this.schemedata = 'Scheme data will appear here once you save the scheme.';
  this.save = function () {
    var self = this;
    createNew(currentForm, this.form.content).then(function () {
      if (currentForm) {
        $route.reload();
      }
    }).catch(function (data) {
      self.schemedata = data.content;
      save('schemedata', self.schemedata);
    });
  };

  this.schemes = schemes.list();

  this.add = function (name, version) {
    var scheme = schemes.get(name, version);
    if (angular.isUndefined(scheme)) return panic('No such item.');
    var schemeToAdd = angular.extend({
      type: name,
      version: version
    }, scheme.schemeDefaults);
    this.form.content.scheme.push(schemeToAdd);
  };

  this.array = funcArray;

  var self = this;
  var debounce;
  $scope.$watch(function () {
    return self.form.content.scheme;
  }, function () {
    if (debounce) {
      $timeout.cancel(debounce);
    }
    debounce = $timeout(function () {
      $scope.$broadcast('update scheme view', rememberState());
      debounce = undefined;
    }, 500);
  }, true);
}]);
