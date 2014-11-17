angular.module('excavator.manager.routes', [
  'excavator.resolver.is',
  'excavator.resolver.submission'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.needed.resolver',
  'resolver.is',
  'resolver.submissions',
  'resolver.submission',
  function(
    $routeProvider,
    $locationProvider,
    authNeededResolver,
    isResolver,
    submissionsResolver,
    submissionResolver
  ) {
    $routeProvider.

    when('/manager/submissions', {
      templateUrl: '/manager/submissions/list.html',
      controller: 'controller.shared.submission.list as cssl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver('backend.manager.submission.list')
      }
    }).

    when('/manager/submissions/view/:subid', {
      templateUrl: '/manager/submissions/view.html',
      controller: 'controller.shared.submission.view as cssv',
      resolve: {
        loggedIn: authNeededResolver,
        setStatusPrefix: isResolver('/backend/managers'),
        currentSubmission: submissionResolver('backend.manager.submission.get')
      }
    }).

    when('/manager/login', {
      templateUrl: '/manager/login.html',
      controller: 'controller.manager.manager.login as cmml',
    }).

    otherwise({
      redirectTo: '/manager/submissions'
    });

    $locationProvider.html5Mode(true);
  }
]);
