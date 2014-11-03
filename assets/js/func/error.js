angular.module('excavator.func.error', []).

constant('func.error', function () {
  console.error(Array.prototype.slice.call(arguments).join(' '));
});
