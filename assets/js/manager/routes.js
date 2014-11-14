angular.module('excavator.manager.routes', [
  'excavator.resolver.submission'
]).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.needed.resolver',
  'resolver.submissions',
  function(
    $routeProvider,
    $locationProvider,
    authNeededResolver,
    submissionsResolver
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
