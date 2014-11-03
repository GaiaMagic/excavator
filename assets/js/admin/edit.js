angular.module('excavator.admin.edit', [
  'excavator.fixtures'
]).

controller('AdminEditController', [
  '$scope',
  '$timeout',
  '$document',
  'schemes',
  'fixtures.admin.edit',
  'func.array',
  'func.dom.input.remember.state',
  'func.localstorage.load',
  'func.localstorage.remove',
  'func.localstorage.save',
  'func.scheme.parse',
  'func.scheme.stringify',
  function (
    $scope,
    $timeout,
    $document,
    schemes,
    fixturesAdminEdit,
    funcArray,
    rememberState,
    load,
    remove,
    save,
    parse,
    stringify
  ) {
  this.formdata = 'Form data will appear here once you submit the form.';
  this.submit = function () {
    this.formdata = angular.toJson(this.object.data, true);
  };

  this.clear = function () {
    var data = this.object.data;
    for (var key in data) {
      delete data[key];
    }
  };

  this.schemedata = 'Scheme data will appear here once you save the scheme.';
  this.save = function () {
    this.schemedata = stringify(this.object);
    save('schemedata', this.schemedata);
  };

  this.reset = function () {
    remove('schemedata');
    this.object = fixturesAdminEdit;
  };

  this.schemes = schemes.list();
  this.object = load('schemedata', parse) || fixturesAdminEdit;
  this.array = funcArray;

  var self = this;
  var debounce;
  $scope.$watch(function () {
    return self.object.scheme;
  }, function (scheme) {
    if (debounce) {
      $timeout.cancel(debounce);
    }
    debounce = $timeout(function () {
      $scope.$broadcast('update scheme view', rememberState());
      debounce = undefined;
    }, 500);
  }, true);
}]);
