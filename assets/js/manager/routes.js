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

    when('/submissions', {
      templateUrl: '/submissions/list.html',
      controller: 'controller.shared.submission.list as cssl',
      resolve: {
        loggedIn: authNeededResolver,
        submissions: submissionsResolver('backend.manager.submission.list')
      }
    }).

    when('/submissions/view/:subid', {
      templateUrl: '/submissions/view.html',
      controller: 'controller.shared.submission.view as cssv',
      resolve: {
        loggedIn: authNeededResolver,
        setStatusPrefix: isResolver('/backends'),
        currentSubmission: submissionResolver('backend.manager.submission.get')
      }
    }).

    when('/login', {
      templateUrl: '/login.html',
      controller: 'controller.manager.manager.login as cmml',
    }).

    otherwise({
      redirectTo: '/submissions'
    });

    $locationProvider.html5Mode(true);
  }
]);
