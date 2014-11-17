angular.module('excavator.routes', [
  'excavator.resolver'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.needed.resolver',
  'resolver.forms',
  'resolver.form',
  'resolver.is',
  'resolver.submissions',
  'resolver.submission',
  'resolver.managers',
  function(
    $routeProvider,
    $locationProvider,
    authNeededResolver,
    formsResolver,
    formResolver,
    isResolver,
    submissionsResolver,
    submissionResolver,
    managersResolver
  ) {
    $routeProvider.

    when('/control/login', {
      templateUrl: '/control/login.html',
      controller: 'controller.control.admin.login as ccal',
    }).

    when('/control/forms/create', {
      templateUrl: '/control/forms/edit.html',
      controller: 'controller.control.form.edit as ccfe',
      resolve: {
        loggedIn: authNeededResolver,
        currentForm: [function () {
          return undefined;
        }]
      }
    }).

    when('/control/forms/edit/:formid', {
      templateUrl: '/control/forms/edit.html',
      controller: 'controller.control.form.edit as ccfe',
      resolve: {
        loggedIn: authNeededResolver,
        currentForm: formResolver('backend.form.get')
      }
    }).

    when('/control/forms', {
      templateUrl: '/control/forms/list.html',
      controller: 'controller.control.form.list as ccfl',
      reloadOnSearch: true,
      resolve: {
        loggedIn: authNeededResolver,
        forms: formsResolver()
      }
    }).

    when('/control/submissions', {
      templateUrl: '/control/submissions/list.html',
      controller: 'controller.shared.submission.list as cssl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver('backend.submission.list')
      }
    }).

    when('/control/submissions/view/:subid', {
      templateUrl: '/control/submissions/view.html',
      controller: 'controller.shared.submission.view as cssv',
      resolve: {
        loggedIn: authNeededResolver,
        setStatusPrefix: isResolver(),
        currentSubmission: submissionResolver('backend.submission.get')
      }
    }).

    when('/control/managers', {
      templateUrl: '/control/managers/list.html',
      controller: 'controller.control.manager.list as ccml',
      resolve: {
        loggedIn: authNeededResolver,
        managers: managersResolver()
      }
    }).

    otherwise({
      redirectTo: '/control/forms'
    });

    $locationProvider.html5Mode(true);
  }
]);
