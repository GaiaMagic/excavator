angular.module('excavator.manager.routes', [
  'excavator.resolver.submission'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.needed.resolver',
  'resolver.submissions',
  'resolver.submission',
  function(
    $routeProvider,
    $locationProvider,
    authNeededResolver,
    submissionsResolver,
    submissionResolver
  ) {
    $routeProvider.

    when('/manager', {
      templateUrl: '/manager/submissions/list.html',
      controller: 'controller.manager.manager.submission.list as ccsl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver('backend.manager.submission.list')
      }
    }).

    when('/manager/submissions/view/:subid', {
      templateUrl: '/manager/submissions/view.html',
      controller: 'controller.manager.manager.submission.view as ccsv',
      resolve: {
        loggedIn: authNeededResolver,
        currentSubmission: submissionResolver('backend.manager.submission.get')
      }
    }).

    when('/manager/login', {
      templateUrl: '/manager/login.html',
      controller: 'controller.manager.manager.login as cmml',
    }).

    otherwise({
      redirectTo: '/manager'
    });

    $locationProvider.html5Mode(true);
  }
]);
