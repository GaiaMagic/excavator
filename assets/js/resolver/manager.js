angular.module('excavator.resolver.manager', []).

constant('resolver.managers', function formsResolver () {
  return [
    'backend.manager.list',
    'func.panic',
    function currentForms (list, panic) {
      return list().then(function (res) {
        return res.data;
      }, panic);
    }
  ];
});
