angular.module('excavator.resolver.template', []).

constant('resolver.template', function templateResolver () {
  return [
    '$route',
    'backend.template.get',
    'func.panic',
    'shared.nav.meta',
    function currentTemplate ($route, get, panic, meta) {
      var tplid = $route.current.params.tplid;
      return get(tplid).then(function (res) {
        meta.set('template', {
          name: res.data.name,
          tplid: res.data._id
        });

        return res.data;
      }, panic);
    }
  ];
}).

constant('resolver.templates', function templatesResolver () {
  return [
    'backend.template.list',
    'func.panic',
    function currentTemplates (list, panic) {
      return list().then(function (res) {
        return res.data;
      }, panic);
    }
  ];
});
