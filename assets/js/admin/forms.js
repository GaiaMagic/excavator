angular.module('excavator.admin.forms', []).

controller('controller.control.form.list', [
  '$injector',
  '$location',
  '$route',
  '$routeParams',
  'form.access.control',
  'forms',
  'resolver.form',
  'shared.domains',
  function (
    $injector,
    $location,
    $route,
    $routeParams,
    accessControl,
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
    this.domains = domains;
  }
]);
