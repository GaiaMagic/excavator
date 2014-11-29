angular.module('excavator.resolver.submission', []).

constant('resolver.submissions', function submissionsResolver (service) {
  return [
    '$route',
    service,
    'func.panic',
    function currentSubmissions ($route, list, panic) {
      var params = {};
      var form = $route.current.params.form;
      if (angular.isDefined(form)) params.form = form;
      var status = $route.current.params.status;
      if (angular.isDefined(status)) params.status = status;
      return list(params).then(function (res) {
        var data = res.data;
        if (form) data.hasFormQuery = true;
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

        meta.set({
          type: 'submission-view',
          title: '#' + (res.data.form_index + 1),
          id: subid
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
