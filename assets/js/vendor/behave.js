angular.module('excavator.vendor.behave', []).

directive('behaveEditor', [
  '$window',
  function ($window) {
    return {
      link: function ($scope, $element, $attrs) {
        var Behave;
        if (typeof require === 'undefined') {
          Behave = $window.Behave;
        } else {
          Behave = require('./vendors/js/behave.js');
        }
        new Behave({
          textarea: $element[0],
          replaceTab: true,
          softTabs: true,
          tabSize: 2,
          autoOpen: true,
          overwrite: true,
          autoStrip: true,
          autoIndent: true,
          fence: false
        });
        var name = $attrs.behaveEditor;
        if (name) {
          $scope['$get' + name] = function () {
            return $element[0].value;
          };
          $scope['$set' + name] = function (value) {
            $element[0].value = value;
          };
          var old;
          $element.on('change keyup paste', function () {
            if (typeof old === 'string' && old !== this.value) {
              $scope.$emit(name + ' changed');
              $scope.$apply();
            }
            old = this.value;
          });
        }
      }
    };
  }
]);
