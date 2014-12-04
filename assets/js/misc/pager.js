angular.module('excavator.misc.pager', []).

service('misc.pager', [
  function () {
    this.data = {};
    this.analyze = function (namespace, res) {
      var range = res.headers('content-range') || '';
      var match = range.match(/^([0-9]+)-([0-9]+)\/([0-9]+)$/);
      if (match) {
        var per = +match[2] - +match[1] + 1;
        this.data[namespace] = {
          start: +match[1],
          end: Math.min(+match[2], +match[3]),
          per: per,
          page: Math.ceil(+match[1] / per),
          total: +match[3]
        };
      }
    };
  }
]).

directive('pager', [
  '$location',
  'misc.pager',
  'misc.url',
  function ($location, pager, url) {
    return {
      templateUrl: '/pager.html',
      link: function ($scope, $element, $attrs) {
        var data = pager.data[$attrs.namespace];
        if (!angular.isObject(data)) return;

        $scope.total = data.total;
        $scope.start = data.start;
        $scope.end = data.end;
        $scope.page = data.page;
        $scope.numPages = Math.ceil(data.total / data.per);

        var linkGroupSize = 3;
        $scope.linkGroupFirst = function() {
          var rightDebt = Math.max(0, linkGroupSize -
            ($scope.numPages - 1 - ($scope.page + 2)));
          return Math.max(0, $scope.page - (linkGroupSize + rightDebt));
        };
        $scope.linkGroupLast = function() {
          var leftDebt = Math.max(0, linkGroupSize - ($scope.page - 2));
          return Math.min($scope.numPages - 1, $scope.page +
            (linkGroupSize + leftDebt));
        };
        $scope.isFinite = function() {
          return $scope.numPages < Infinity;
        };

        $scope.makeRange = function (lowBound, highBound) {
          lowBound = lowBound || 0;
          highBound = highBound || 0;
          var result = [];
          if (highBound < 1) return result;
          for (var i = lowBound; i <= highBound; i++) {
            result.push(i);
          }
          return result;
        };

        $scope.href = function (page) {
          var params = angular.copy($location.search());
          angular.extend(params, { page: page });
          if (page < 2) {
            delete params.page;
          }
          return url.buildUrl($location.path(), params);
        };
      }
    };
  }
]);
