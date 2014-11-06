angular.module('excavator.routes', []).

config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.

    when('/login', {
      templateUrl: '/login.html',
      controller: 'AdminLoginController as alc',
    }).

    when('/edit', {
      templateUrl: '/edit.html',
      controller: 'AdminEditController as aec',
      resolve: {
        loggedIn: [
          'backend.admin.login.status', '$location',
          function(status, $location) {
            return status.update().then(function (loggedIn) {
              if (!loggedIn) $location.path('/login');
              return loggedIn;
            });
          }
        ]
      }
    }).

    otherwise({
      redirectTo: '/edit'
    });

    $locationProvider.html5Mode(true);
  }
]);
