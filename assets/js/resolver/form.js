angular.module('excavator.resolver.form', []).

constant('resolver.forms', function formsResolver () {
  return [
    '$route',
    'backend.form.list',
    'func.panic',
    function currentForms ($route, list, panic) {
      var params = {};
      var manager = $route.current.params.manager;
      if (manager) params.manager = manager;
      return list(params).then(function (res) {
        return res.data;
      }, panic);
    }
  ];
}).

constant('resolver.form', function formResolver (service, options) {
  return [
    '$rootScope',
    '$route',
    '$timeout',
    service,
    'func.panic',
    'func.scheme.parse',
    'shared.nav.meta',
    function currentForm (
      $rootScope,
      $route,
      $timeout,
      get,
      panic,
      parse,
      meta
    ) {
      options = options || {};
      var formid = options.formId || $route.current.params.formid;
      var formrevid = options.formRevId || $route.current.params.formrevid;
      return get(formid, formrevid).then(function (res) {
        if (options.simple) {
          return {
            title: res.data.head.title,
            form: res.data
          };
        }

        meta.set(undefined);

        var head = 'head';
        var isViewingRevision = false;
        var isLatest = true;

        if (!angular.isObject(res.data[head])) return false;

        if (angular.isObject(res.data.index)) {
          head = 'index';
          isViewingRevision = true;
          isLatest = res.data.index._id === res.data.head._id;
        }

        var title = res.data[head].title;
        if (!angular.isString(title) || !title) return false;

        var slug = res.data.slug;

        var content = parse(res.data[head].content);
        if (!angular.isObject(content) ||
            !angular.isObject(content.scheme)) return false;

        meta.set('form', {
          title: title,
          formid: res.data._id
        });

        var link = '/' + slug;
        var latestPermalink = link + '/' + res.data.head._id;
        var currentPermalink = link + '/' + res.data[head]._id;

        return {
          isViewingRevision: isViewingRevision,
          isLatest: isLatest,
          link: link,
          latestPermalink: latestPermalink,
          currentPermalink: currentPermalink,

          title: title,
          content: content,
          slug: slug,
          form: res.data
        };
      }, panic);
    }
  ];
});
