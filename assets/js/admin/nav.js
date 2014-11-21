angular.module('excavator.admin.nav', []).

directive('navView', [
  '$location',
  'backend.user.login.status',
  'backend.user.logout',
  'func.panic.alert',
  'i18n.linguist',
  function ($location, status, logout, alert, linguist) {
  return {
    scope: true,
    templateUrl: '/nav.html',
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
      $scope.linguist = linguist;
    }
  };
}]);
