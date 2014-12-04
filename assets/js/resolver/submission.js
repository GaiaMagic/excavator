angular.module('excavator.resolver.submission', []).

constant('resolver.submissions', function submissionsResolver (service) {
  return [
    '$route',
    service,
    'func.panic',
    'misc.pager',
    'shared.nav.meta',
    function currentSubmissions ($route, list, panic, pager, meta) {
      var params = {};

      var form = $route.current.params.formid || $route.current.params.form;
      params.form = form;

      params.status = $route.current.params.status;

      params.page = $route.current.params.page;

      return list(params).then(function (res) {
        pager.analyze('submission', res);

        meta.set('submission', {
          formid: form
        });

        var data = res.data;
        if (form) data.formId = form;
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
