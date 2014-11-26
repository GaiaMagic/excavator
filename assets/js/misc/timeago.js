angular.module('excavator.misc.timeago', []).

run([
  '$rootScope',
  '$interval',
  function ($rootScope, $interval) {
    $interval(function () {
      $rootScope.$broadcast('per sec', new Date);
    }, 1000);
  }
]).

directive('timeAgo', [
  '$filter',
  'i18n.translate',
  'misc.timeago',
  function ($filter, tr, timeago) {
    return {
      link: function ($scope, $element, $attrs) {
        function calculate (e, now) {
          var from = new Date($scope.$eval($attrs.timeAgo));
          var calculated = timeago.call({ tr: tr }, +from);
          $element.text(calculated);
          $element.attr('title', $filter('date')(from, 'yyyy-MM-dd HH:mm:ss'));
        }
        calculate();
        $scope.$on('per sec', calculate);
      }
    };
  }
]);
