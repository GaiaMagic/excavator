angular.module('excavator.resolver.submission', []).

constant('resolver.submissions',
  function submissionsResolver (service, extraService) {
  return [
    '$injector',
    '$route',
    '$q',
    service,
    'func.panic',
    'misc.pager',
    'shared.nav.meta',
    function currentSubmissions ($injector, $route, $q, list, panic, pager, meta) {
      var $params = $route.current.params;
      var params = {};

      var form = $params.formid || $params.form;
      params.form = form;
      params.status = $params.status;
      params.page = $params.page;
      if ($params.k) { params.k = $params.k; }
      if ($params.o) { params.o = $params.o; }
      if ($params.v) { params.v = $params.v; }

      var promises;
      if (extraService && form) {
        var get = $injector.get(extraService);
        promises = $q.all([
          list(params),
          get(form)
        ]);
      } else {
        promises = $q.all([ list(params) ]);
      }
      return promises.then(function (res) {
        var list = res[0];
        pager.analyze('submission', list);

        meta.set('submission', {
          formid: form
        });

        var data = list.data;
        if (form) data.formId = form;

        var formDetails = res[1];
        if (formDetails) {
          data.form = formDetails.data;
        }

        return data;
      }, panic);
    }
  ];
}).

constant('resolver.submission', function submissionResolver (service) {
  return [
    '$route',
    service,
    'func.panic',
    'shared.nav.meta',
    function currentSubmission ($route, get, panic, meta) {
      var subid = $route.current.params.subid;
      return get(subid).then(function (res) {
        if (res.data.form._id !== $route.current.params.formid) {
          return false;
        }

        meta.set(undefined);

        res.data.data = res.data.data || {};
        var rawdata = res.data.data;

        var rawscheme = angular.fromJson(res.data.form_revision.content);
        if (typeof rawscheme !== 'object') return false;

        var data = [];
        var schemes = rawscheme.scheme;
        for (var i = 0; i < schemes.length; i++) {
          if (angular.isArray(schemes[i].models)) {
            schemes[i].models.forEach(function (model) {
              data.push({
                label: model.label,
                value: rawdata[model.model]
              });
            });
            continue;
          }
          if (angular.isUndefined(rawdata[schemes[i].model])) continue;
          data.push({
            label: schemes[i].label || schemes[i].model,
            value: rawdata[schemes[i].model]
          });
        }

        var title = res.data.form_revision.title;

        meta.set('submission', {
          title: '#' + (res.data.form_index + 1),
          subid: subid,
          formid: res.data.form._id
        });

        return {
          title: title,
          data: data,
          rawdata: angular.toJson(rawdata, true),
          rawscheme: angular.toJson(rawscheme, true),
          sub: res.data
        };
      }, panic);
    }
  ];
});
