angular.module('excavator.shared.nav.meta', []).

service('shared.nav.meta', [
  function () {
    this.metaNamespace = '';
    this.meta = {};
    this.set = function (namespace, meta) {
      if (this.metaNamespace !== namespace) {
        for (var key in this.meta) {
          delete this.meta[key];
        }
      }
      if (namespace && meta) {
        this.metaNamespace = namespace;
        angular.extend(this.meta, meta);
      }
    };
    this.watch = function ($scope, func) {
      var self = this;
      var unwatch = $scope.$watch(function () {
        return {
          data: self.meta,
          namespace: self.metaNamespace
        };
      }, func, true);
      $scope.$on('$destroy', function () {
        unwatch();
      });
    };
  }
]);
