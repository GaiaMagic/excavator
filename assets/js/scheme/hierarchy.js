angular.module('excavator.scheme.hierarchy', []).

service('hierarchies', [
  '$http',
  '$q',
  function ($http, $q) {
    this.cached = {};
    this.get = function (url) {
      var self = this;
      if (self.cached[url]) {
        return $q.when(self.cached[url]);
      }
      self.cached[url] = $http.get(url).then(function (res) {
        return res.data;
      });
      return self.cached[url];
    };
  }
]).

directive('hierarchy', [
  'hierarchies',
  function (hierarchies) {
    return {
      scope: true,
      link: function ($scope, $element, $attrs) {
        var formScheme = $scope.$parent.scheme;
        var formData = $scope.$parent.data;

        var models = formScheme.models;
        if (!models) return;

        var url = $scope.$parent.hierarchy.location;
        if (!url) return;

        hierarchies.get(url).then(processHierarchy);

        function processHierarchy (data) {
          var slices = [];
          slices[0] = Object.keys(data);
          $scope.slices = slices;

          var selects = [];
          for (var i = 0; i < models.length; i++) {
            if (!angular.isObject(models[i])) continue;
            var select = formData[models[i].model];
            if (angular.isUndefined(select)) break;
            selects.push(select);
          }
          $scope.selects = selects;

          var unwatch = $scope.$watchCollection('selects', onSelectsChange);
          $scope.$on('$destroy', function() { unwatch(); });

          function onSelectsChange (selects, oldSelects) {
            var current = data;
            for (var i = 0; i < selects.length; i++) {
              if (!angular.isObject(current)) {  // this means hierarchy has
                selects = [];  // been changed, so set this to an empty array
                break;         // and break the loop to clear previous data
              }
              if (selects[i] !== oldSelects[i]) {
                selects.length = i + 1;
                $scope.slices.length = i + 1;
              }
              if (!selects[i]) continue;
              current = current[selects[i]];
              if (!angular.isObject(current)) continue;
              if (angular.isArray(current)) {
                $scope.slices[i + 1] = current;
              } else {
                $scope.slices[i + 1] = Object.keys(current);
              }
              var slice = $scope.slices[i + 1];
              if (angular.isArray(slice) && slice.length > 0) {
                if (angular.isUndefined($scope.selects[i + 1])) {
                  $scope.selects[i + 1] = slice[0];
                }
              } else {
                selects.length = i + 1;
                $scope.slices.length = i + 1;
                break;
              }
            }
            for (var i = 0; i < models.length; i++) {
              if (!angular.isObject(models[i])) continue;
              $scope.data[models[i].model] = selects[i];
            }
          }
        }
      }
    };
  }
]);
