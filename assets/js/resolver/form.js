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
    '$q',
    '$rootScope',
    '$route',
    '$timeout',
    service,
    'func.panic',
    'func.scheme.parse',
    'shared.nav.meta',
    function currentForm (
      $q,
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

      var promises = [];

      var isPreview = false;
      if (angular.isString(formrevid)) {
        var matches = formrevid.match(/^preview:([a-f0-9]{24})$/);
        if (matches) {
          var tplId = matches[1];
          if (tplId) {
            isPreview = true;
            var injector = angular.element(document.body).injector();
            var getTpl = injector.get('public.public.template.get');
            promises.push(getTpl(tplId));
            formrevid = undefined;
          }
        }
      }

      promises.unshift(get(formid, formrevid));
      return $q.all(promises).then(function (res) {
        var form = res[0].data;
        if (res[1]) {
          form.head.template = res[1].data;
        }
        return form;
      }).then(function (form) {
        if (options.simple) {
          return {
            title: form.head.title,
            form: form
          };
        }

        meta.set(undefined);

        var head = 'head';
        var isViewingRevision = false;
        var isLatest = true;

        if (!angular.isObject(form[head])) return false;

        if (angular.isObject(form.index)) {
          head = 'index';
          isViewingRevision = true;
          isLatest = form.index._id === form.head._id;
        }

        var title = form[head].title;
        if (!angular.isString(title) || !title) return false;

        var slug = form.slug;

        var content = parse(form[head].content);
        if (!angular.isObject(content) ||
            !angular.isObject(content.scheme)) return false;

        meta.set('form', {
          title: title,
          formid: form._id
        });

        var link = '/' + slug;
        var latestPermalink = link + '/' + form.head._id;
        var currentPermalink = link + '/' + form[head]._id;

        return {
          isViewingRevision: isViewingRevision,
          isLatest: isLatest,
          link: link,
          latestPermalink: latestPermalink,
          currentPermalink: currentPermalink,

          title: title,
          content: content,
          slug: slug,
          form: form
        };
      }, panic);
    }
  ];
});
