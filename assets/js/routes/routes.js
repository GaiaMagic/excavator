angular.module('excavator.routes', []).

config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    var needsAuth = [
      'backend.admin.login.status', '$location',
      function(status, $location) {
        return status.update().then(function (loggedIn) {
          if (!loggedIn) $location.path('/login');
          return loggedIn;
        });
      }
    ];

    $routeProvider.

    when('/login', {
      templateUrl: '/login.html',
      controller: 'AdminLoginController as alc',
    }).

    when('/edit/:formid?', {
      templateUrl: '/edit.html',
      controller: 'AdminEditController as aec',
      resolve: {
        loggedIn: needsAuth,
        currentForm: [
          '$route',
          'backend.form.get',
          'func.scheme.parse',
          function ($route, get, parse) {
            var formid = $route.current.params.formid;
            if (angular.isUndefined(formid)) return;
            return get(formid).then(function (res) {
              if (!angular.isObject(res.data.head)) return false;

              var title = res.data.head.title;
              if (!angular.isString(title) || !title) return false;

              var content = parse(res.data.head.content);
              if (!angular.isObject(content) ||
                  !angular.isObject(content.scheme)) return false;

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

    when('/manage', {
      templateUrl: '/manage.html',
      controller: 'AdminManageController as amc',
      resolve: {
        loggedIn: needsAuth
      }
    }).

    otherwise({
      redirectTo: '/edit'
    });

    $locationProvider.html5Mode(true);
  }
]);
