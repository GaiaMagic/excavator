angular.module('excavator.scheme.bulk', []).

factory('scheme.bulk.enable.submit.buttons', [
  '$timeout',
  'i18n.translate',
  function ($timeout, tr) {
    function setStates (schemes, enable) {
      for (var i = 0; i < schemes.length; i++) {
        var scheme = schemes[i];
        if (scheme.type !== 'button') continue;
        if (!angular.isArray(scheme.enum)) continue;
        for (var j = 0; j < scheme.enum.length; j++) {
          var item = scheme.enum[j];
          if (item.type !== 'submit') continue;
          if (enable) {
            if (angular.isDefined(item._label)) {
              item.label = item._label;
            }
            item.disabled = item._disabled;
            delete item._label;
            delete item._disabled;
            if (angular.isUndefined(item.disabled)) delete item.disabled;
            continue;
          }
          item._label = item.label;
          item._disabled = item.disabled;
          item.label = tr('forms::Please wait...');
          item.disabled = true;
        }
      }
    }

    return function (schemes, enable) {
      var timeout = $timeout(function () {
        setStates(schemes, enable);
      }, 100);
      timeout.cancel = function () {
        return $timeout.cancel(timeout);
      };
      return timeout;
    };
  }
]);
