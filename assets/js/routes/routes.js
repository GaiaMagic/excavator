angular.module('excavator.routes', []).

config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
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
      templateUrl: '/login.html',
      controller: 'AdminLoginController as alc',
    }).

    when('/control/forms/create', {
      templateUrl: '/edit.html',
      controller: 'AdminEditController as aec',
      resolve: {
        loggedIn: needsAuth,
        currentForm: [function () {
          return undefined;
        }]
      }
    }).

    when('/control/forms/edit/:formid', {
      templateUrl: '/edit.html',
      controller: 'AdminEditController as aec',
      resolve: {
        loggedIn: needsAuth,
        currentForm: [
          '$rootScope',
          '$route',
          'backend.form.get',
          'func.scheme.parse',
          function ($rootScope, $route, get, parse) {
            var formid = $route.current.params.formid;
            return get(formid).then(function (res) {
              $rootScope.$broadcast('global-meta', undefined);

              if (!angular.isObject(res.data.head)) return false;

              var title = res.data.head.title;
              if (!angular.isString(title) || !title) return false;

              var content = parse(res.data.head.content);
              if (!angular.isObject(content) ||
                  !angular.isObject(content.scheme)) return false;

              $rootScope.$broadcast('global-meta', {
                type: 'form-edit',
                title: title,
                id: res.data._id
              });

              return {
                title: title,
                content: content,
                form: res.data
              };
            });
          }
        ]
      }
    }).

    when('/control/forms', {
      templateUrl: '/manage.html',
      controller: 'AdminManageController as amc',
      resolve: {
        loggedIn: needsAuth
      }
    }).

    when('/control/submissions', {
      templateUrl: '/submissions.html',
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
