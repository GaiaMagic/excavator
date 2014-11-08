angular.module('excavator.admin.nav', []).

directive('navView', [
  '$location',
  'backend.admin.login.status',
  'backend.admin.logout',
  'func.panic.alert',
  function ($location, status, logout, alert) {
  return {
    scope: true,
    template: [
      '<nav class="navbar navbar-default navbar-fixed-top" role="navigation">',
        '<div class="container-fluid">',
          '<div class="navbar-header">',
            '<a class="navbar-brand" href="/">Form Generator Admin</a>',
          '</div>',
          '<div>',
            '<ul class="nav navbar-nav">',
              '<li ng-class="{active: isActive(\'/control/forms\')}">',
                '<a href="/control/forms">All Forms</a>',
              '</li>',
              '<li ng-class="{active: isActive(\'/control/forms/edit\')}" ',
                'ng-if="is(\'form-edit\')">',
                '<a href="/control/forms/edit/{{metaData.id}}">Editing ',
                  '{{metaData.title}}</a>',
              '</li>',
              '<li ng-class="{active:isActive(\'/control/forms/create\')}">',
                '<a href="/control/forms/create">Create</a>',
              '</li>',
              '<li ng-class="{active:isActive(\'/control/submissions\')}">',
                '<a href="/control/submissions">Submissions</a>',
              '</li>',
            '</ul>',
            '<ul class="nav navbar-nav navbar-right">',
              '<li ng-if="status.loggedIn"><a href ng-click="logout()">',
                'Log out</a></li>',
              '<li ng-if="!status.loggedIn"><a href="/control/login">',
                'Log In</a></li>',
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
      $scope.isActive = function (path) {
        if (path.slice(-1) !== '/') path += '/';
        var currentPath = $scope.currentPath;
        if (currentPath.slice(-1) !== '/') currentPath += '/';
        return currentPath.slice(0, path.length) === path;
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
