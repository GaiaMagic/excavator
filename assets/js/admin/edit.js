angular.module('excavator.admin.edit', [
  'excavator.fixtures'
]).

controller('AdminEditController', [
  '$scope',
  '$timeout',
  '$document',
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
  'currentForm',
  function (
    $scope,
    $timeout,
    $document,
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
    currentForm
  ) {
  this.form = {};

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
    createNew(this.form.content).catch(function (data) {
      self.schemedata = data.content;
      save('schemedata', self.schemedata);
    });
  };

  this.schemes = schemes.list();

  if (angular.isUndefined(currentForm)) {
    this.form.content = load('schemedata', parse) || fixtures;
    this.form.title = undefined;
  } else {
    this.form.content = currentForm.content;
    this.form.title = currentForm.title;
  }

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
