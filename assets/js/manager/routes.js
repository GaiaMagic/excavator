angular.module('excavator.manager.routes', []).

config([
  '$routeProvider',
  '$locationProvider',
  'backend.user.auth.needed.resolver',
  function(
    $routeProvider,
    $locationProvider,
    authNeededResolver
  ) {
    $routeProvider.

    when('/manager', {
      templateUrl: '/manager/submissions/list.html',
      resolve: {
        loggedIn: authNeededResolver
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
