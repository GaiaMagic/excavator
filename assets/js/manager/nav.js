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
            '<a class="navbar-brand" href="/">',
              'Manager</a>',
          '</div>',
          '<div>',
            '<ul class="nav navbar-nav">',
              '<li ng-class="{active: ifPathIs(\'/submissions\')}">',
                '<a href="/submissions">All Submissions</a>',
              '</li>',
              '<li ng-class="{active: ',
                'ifPathHas(\'/submissions/view\')}" ',
                'ng-if="is(\'submission-view\')">',
                '<a href="/submissions/view/{{metaData.id}}">Viewing ',
                  '{{metaData.title}}</a>',
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
                'ng-class="{active: ifPathIs(\'/login\')}">',
                  '<a href="/login">Log In</a></li>',
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
      $scope.ifPathHas = function (path) {
        if (path.slice(-1) !== '/') path += '/';
        var currentPath = $scope.currentPath;
        if (currentPath.slice(-1) !== '/') currentPath += '/';
        return currentPath.slice(0, path.length) === path;
      };
      $scope.ifPathIs = function (path) {
        return $scope.currentPath === path;
      };
      $scope.is = function (type) {
        return !!($scope.metaData && $scope.metaData.type === type);
      };
      $scope.status = status;
      $scope.$on('global-meta', function (e, data) {
        $scope.metaData = data;
      });
    }
  };
}]);
