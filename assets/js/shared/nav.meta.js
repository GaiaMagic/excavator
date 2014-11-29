angular.module('excavator.shared.nav.meta', []).

service('shared.nav.meta', [
  function () {
    this.meta = {};
    this.set = function (meta) {
      if (angular.isUndefined(meta)) {
        for (var key in this.meta) {
          delete this.meta[key];
        }
      } else {
        angular.extend(this.meta, meta);
      }
    };
    this.watch = function ($scope, func) {
      var self = this;
      var unwatch = $scope.$watch(function () {
        return self.meta;
      }, func, true);
      $scope.$on('$destroy', function () {
        unwatch();
      });
    };
  }
]);
