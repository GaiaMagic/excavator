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
      }
    };
  }
]);
