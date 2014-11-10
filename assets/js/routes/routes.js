angular.module('excavator.routes', [
  'excavator.resolver'
]).

config([
  '$routeProvider', '$locationProvider', 'resolver.form',
  function($routeProvider, $locationProvider, formResolver) {
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
      controller: 'AdminManageController as amc',
      resolve: {
        loggedIn: needsAuth
      }
    }).

    when('/control/submissions', {
      templateUrl: '/control/submissions/list.html',
      controller: 'AdminSubmissionsController as asc',
      resolve: {
        loggedIn: needsAuth
      }
    }).

    otherwise({
      redirectTo: '/control/forms'
    });

    $locationProvider.html5Mode(true);
  }
]);
