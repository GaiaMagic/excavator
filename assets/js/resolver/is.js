angular.module('excavator.resolver.is', []).

constant('resolver.is', function isResolver (value) {
  return [
    '$q',
    function ($q) {
      return $q.when(value);
    }
  ];
});
