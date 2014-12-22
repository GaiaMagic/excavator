angular.module('excavator.admin.forms', []).

controller('controller.control.form.list', [
  '$injector',
  '$location',
  '$route',
  '$routeParams',
  'form.access.control',
  'form.set.template',
  'forms',
  'resolver.form',
  'shared.domains',
  function (
    $injector,
    $location,
    $route,
    $routeParams,
    accessControl,
    setTpl,
    forms,
    formResolver,
    domains
  ) {
    this.forms = forms;
    this.manager = $routeParams.manager;
    this.filter = function () {
      $location.search('manager', this.manager || null);
    };
    this.access = function (form) {
      var resolve = formResolver('backend.form.get', {
        formId: form._id,
        simple: true
      });
      var promise = $injector.invoke(resolve);
      promise.then(function (currentForm) {
        return accessControl(currentForm);
      }).then(function () {
        $route.reload();
      });
    };
    this.setTpl = function (form) {
      var resolve = formResolver('backend.form.get', {
        formId: form._id,
        simple: true
      });
      var promise = $injector.invoke(resolve);
      promise.then(function (currentForm) {
        return setTpl(currentForm);
      }).then(function () {
        $route.reload();
      });
    };
    this.domains = domains;
  }
]);
