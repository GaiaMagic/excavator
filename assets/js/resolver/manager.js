angular.module('excavator.resolver.manager', []).

constant('resolver.managers', function formsResolver () {
  return [
    'backend.manager.list',
    'func.panic',
    function currentManagers (list, panic) {
      return list().then(function (res) {
        return res.data;
      }, panic);
    }
  ];
}).

constant('resolver.manager', function managerResolver (options) {
  return [
    '$route',
    'backend.manager.get',
    'func.panic',
    function currentManager ($route, get, panic) {
      options = options || {};
      var managerid = options.managerId || $route.current.params.managerid;
      return get(managerid).then(function (res) {
        return res.data;
      }, panic);
    }
  ];
});
