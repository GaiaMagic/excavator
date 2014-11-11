angular.module('excavator.scheme.editor', []).

filter('stringify', [
  'func.formatter.function.reindent',
  function (reindent) {
    return function (value) {
      if (angular.isFunction(value)) {
        return reindent(value);
      }
      return angular.toJson(value, true);
    };
  }
]).

// code-editor
directive('codeEditor', [
  'func.formatter.function.reindent',
  function (reindent) {
  return {
    require: 'ngModel',
    link: function ($scope, $elem, $attrs, ngModel) {
      if (!ngModel) return;
      ngModel.$formatters.push(function (value) {
        if (angular.isFunction(value)) {
          return reindent(value);
        }
        return angular.toJson(value, true);
      });
      ngModel.$parsers.push(function (value) {
        try {
          return new Function('return ' + value)();
        } catch (e) {
          console.error(e.message);
        }
        return value;
      });
    }
  };
}]);
