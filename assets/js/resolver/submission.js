angular.module('excavator.resolver.submission', []).

constant('resolver.submissions', function submissionsResolver (service) {
  return [
    '$route',
    service,
    'func.panic',
    function currentSubmissions ($route, list, panic) {
      var params = {};
      var form = $route.current.params.form;
      if (form) params.form = form;
      return list(params).then(function (res) {
        return res.data;
      }, panic);
    }
  ];
}).

constant('resolver.submission', function submissionResolver (service) {
  return [
    '$rootScope',
    '$route',
    service,
    'func.panic',
    function currentSubmission ($rootScope, $route, get, panic) {
      var subid = $route.current.params.subid;
      return get(subid).then(function (res) {
        $rootScope.$broadcast('global-meta', undefined);

        var rawdata = res.data.data;
        if (typeof rawdata !== 'object') return false;

        var rawscheme = angular.fromJson(res.data.form_revision.content);
        if (typeof rawscheme !== 'object') return false;

        var data = [];
        var schemes = rawscheme.scheme;
        for (var i = 0; i < schemes.length; i++) {
          if (angular.isUndefined(rawdata[schemes[i].model])) continue;
          data.push({
            label: schemes[i].label || schemes[i].model,
            value: rawdata[schemes[i].model]
          });
        }

        var title = res.data.form_revision.title;

        $rootScope.$broadcast('global-meta', {
          type: 'submission-view',
          title: subid,
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
