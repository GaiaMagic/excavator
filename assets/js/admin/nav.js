angular.module('excavator.admin.nav', []).

directive('navView', [
  '$location',
  'data.admin.nav.menu',
  function ($location, menu) {
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
              '<li ng-repeat="item in menu" ',
                'ng-class="{active: item.link === currentPath}">',
                '<a href="{{ item.link }}" ng-bind="item.text"></a>',
              '</li>',
            '</ul>',
            '<ul class="nav navbar-nav navbar-right">',
              '<li><a href="/">Log out</a></li>',
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
      $scope.menu = menu;
    }
  };
}]);
