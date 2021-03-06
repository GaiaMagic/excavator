angular.module('excavator.manager.routes', [
  'excavator.resolver.is',
  'excavator.resolver.submission'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.success.resolver',
  'backend.user.auth.needed.resolver',
  'resolver.is',
  'resolver.submissions',
  'resolver.submission',
  function(
    $routeProvider,
    $locationProvider,
    authSuccessResolver,
    authNeededResolver,
    isResolver,
    submissionsResolver,
    submissionResolver
  ) {
    $routeProvider.

    when('/', {
      redirectTo: '/submissions'
    }).

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
        setStatusPrefix: isResolver('/backend/managers'),
        currentSubmission: submissionResolver('backend.manager.submission.get')
      }
    }).

    when('/passwd', {
      templateUrl: '/passwd.html',
      controller: 'controller.shared.user.passwd as csup',
      resolve: {
        loggedIn: authNeededResolver
      }
    }).

    when('/login', {
      templateUrl: '/login.html',
      controller: 'controller.shared.user.login as csul',
      resolve: {
        loggedIn: authSuccessResolver
      }
    }).

    otherwise({
      redirectTo: '/login'
    });

    $locationProvider.html5Mode(true);
  }
]);
