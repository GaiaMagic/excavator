angular.module('excavator.misc.ip', []).

factory('misc.ip', [
  '$http',
  '$q',
  '$window',
  function ($http, $q, $window) {
    function convert (v) {
      var val = (v.country || '').trim();
      if (v.country !== v.province) {
        val += (v.province || '').trim();
        if (v.province !== v.city) {
          val += (v.city || '').trim();
        }
      }
      return val.replace(/-$/, '');
    }

    function get (subs) {
      if (!subs || (angular.isArray(subs) && subs.length === 0)) {
        return $q(function (resolve, reject) { reject(); });
      }
      if (angular.isString(subs)) {
        subs = [subs];
      }
      return $http.post('/backend/submissions/ip', {
        submissions: subs
      }).then(function (res) {
        var ret = {};
        for (var i in res.data) {
          ret[i] = convert(res.data[i]);
        }
        return ret;
      });
    }

    get.convert = convert;

    return get;
  }
]);
