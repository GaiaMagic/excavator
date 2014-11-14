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
              '<li ng-if="status.loggedIn" class="dropdown" ',
                'ng-class="{open: loggedInOpen}">',
                '<a href ng-click="loggedInOpen=!loggedInOpen">Logged in as ',
                  '<b ng-bind="status.username"></b> ',
                  '<span class="caret"></span></a>',
                '<ul class="dropdown-menu" role="menu">',
                  '<li><a href ng-click="logout(); ',
                    'loggedInOpen=false">Log out</a></li>',
                '</ul>',
              '</li>',
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
