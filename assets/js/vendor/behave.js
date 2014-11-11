angular.module('excavator.vendor.behave', []).

directive('behaveEditor', [
  function () {
    return {
      link: function ($scope, $element, $attrs) {
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
