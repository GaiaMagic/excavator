angular.module('excavator.routes', [
  'excavator.resolver'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'resolver.forms',
  'resolver.form',
  'resolver.submissions',
  'resolver.submission',
  function(
    $routeProvider,
    $locationProvider,
    formsResolver,
    formResolver,
    submissionsResolver,
    submissionResolver
  ) {
    var needsAuth = [
      'backend.admin.login.status', '$location',
      function(status, $location) {
        return status.update().then(function (loggedIn) {
          if (!loggedIn) $location.path('/control/login');
          return loggedIn;
        });
      }
    ];

    $routeProvider.

    when('/control/login', {
      templateUrl: '/control/login.html',
      controller: 'AdminLoginController as alc',
    }).

    when('/control/forms/create', {
      templateUrl: '/control/forms/edit.html',
      controller: 'AdminEditController as aec',
      resolve: {
        loggedIn: needsAuth,
        currentForm: [function () {
          return undefined;
        }]
      }
    }).

    when('/control/forms/edit/:formid', {
      templateUrl: '/control/forms/edit.html',
      controller: 'AdminEditController as aec',
      resolve: {
        loggedIn: needsAuth,
        currentForm: formResolver('backend.form.get')
      }
    }).

    when('/control/forms', {
      templateUrl: '/control/forms/list.html',
      controller: 'controller.control.form.list as ccfl',
      resolve: {
        loggedIn: needsAuth,
        forms: formsResolver()
      }
    }).

    when('/control/submissions', {
      templateUrl: '/control/submissions/list.html',
      controller: 'controller.control.submission.list as ccsl',
      resolve: {
        loggedIn: needsAuth,
        submissions: submissionsResolver()
      }
    }).

    when('/control/submissions/view/:subid', {
      templateUrl: '/control/submissions/view.html',
      controller: 'controller.control.submission.view as ccsv',
      resolve: {
        loggedIn: needsAuth,
        currentSubmission: submissionResolver()
      }
    }).

    otherwise({
      redirectTo: '/control/forms'
    });

    $locationProvider.html5Mode(true);
  }
]);
