angular.module('excavator.manager.nav', []).

directive('navView', [
  '$location',
  'backend.user.login.status',
  'backend.user.logout',
  'func.panic.alert',
  function ($location, status, logout, alert) {
  return {
    scope: true,
    template: [
      '<nav class="navbar navbar-default" role="navigation">',
        '<div class="container">',
          '<div class="navbar-header">',
            '<a class="navbar-brand" href="/manager">',
              'Manager</a>',
          '</div>',
          '<div>',
            '<ul class="nav navbar-nav">',
              '<li ng-class="{active: ifPathIs(\'/manager\')}">',
                '<a href="/manager">All Submissions</a>',
              '</li>',
            '</ul>',
            '<ul class="nav navbar-nav navbar-right">',
              '<li ng-if="status.loggedIn"><a href ng-click="logout()">',
                'Log out</a></li>',
              '<li ng-if="!status.loggedIn" ',
                'ng-class="{active: ifPathIs(\'/manager/login\')}">',
                  '<a href="/manager/login">Log In</a></li>',
            '</ul>',
          '</div>',
        '</div>',
      '</nav>'
    ].join(''),
    link: function ($scope) {
      $scope.currentPath = $location.path();
      $scope.$on('$routeChangeSuccess', function () {
        $scope.currentPath = $location.path();
      });
      $scope.logout = function () {
        logout();
        alert('You have successfully logged out.');
      };
      $scope.ifPathIs = function (path) {
        return $scope.currentPath === path;
      };
      $scope.status = status;
    }
  };
}]);
