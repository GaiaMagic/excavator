angular.module('excavator.routes', [
  'excavator.resolver'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.needed.resolver',
  'resolver.forms',
  'resolver.form',
  'resolver.submissions',
  'resolver.submission',
  function(
    $routeProvider,
    $locationProvider,
    authNeededResolver,
    formsResolver,
    formResolver,
    submissionsResolver,
    submissionResolver
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
      resolve: {
        loggedIn: authNeededResolver,
        forms: formsResolver()
      }
    }).

    when('/control/submissions', {
      templateUrl: '/control/submissions/list.html',
      controller: 'controller.control.submission.list as ccsl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver()
      }
    }).

    when('/control/submissions/view/:subid', {
      templateUrl: '/control/submissions/view.html',
      controller: 'controller.control.submission.view as ccsv',
      resolve: {
        loggedIn: authNeededResolver,
        currentSubmission: submissionResolver()
      }
    }).

    otherwise({
      redirectTo: '/control/forms'
    });

    $locationProvider.html5Mode(true);
  }
]);
