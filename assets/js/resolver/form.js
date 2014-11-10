angular.module('excavator.resolver', []).

constant('resolver.form', function (service) {
  return [
    '$rootScope',
    '$route',
    service,
    'func.scheme.parse',
    function ($rootScope, $route, get, parse) {
      var formid = $route.current.params.formid;
      return get(formid).then(function (res) {
        $rootScope.$broadcast('global-meta', undefined);

        if (!angular.isObject(res.data.head)) return false;

        var title = res.data.head.title;
        if (!angular.isString(title) || !title) return false;

        var content = parse(res.data.head.content);
        if (!angular.isObject(content) ||
            !angular.isObject(content.scheme)) return false;

        $rootScope.$broadcast('global-meta', {
          type: 'form-edit',
          title: title,
          id: res.data._id
        });

        return {
          title: title,
          content: content,
          form: res.data
        };
      });
    }
  ];
});
