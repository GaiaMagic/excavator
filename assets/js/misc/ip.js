angular.module('excavator.misc.ip', []).

factory('misc.ip', [
  '$q',
  '$window',
  'misc.async.load',
  function ($q, $window, load) {
    var url = 'http://int.dpool.sina.com.cn';
    url += '/iplookup/iplookup.php?format=js&ip=';
    // ip can be an array or a string
    return function (ip) {
      if (!ip || (angular.isArray(ip) && ip.length === 0)) {
        return $q(function (resolve, reject) { reject(); });
      }
      return load(url + ip, {
        type: 'js',
        removeScriptTag: true
      }).then(function () {
        var info = $window.remote_ip_info;
        var ret = {};
        for (var i in info) {
          var v = info[i];
          var val = (v.country || '').trim();
          val += (v.province || '').trim();
          if (v.province !== v.city) {
            val += (v.city || '').trim();
          }
          ret[i] = val;
        }
        return ret;
      });
    };
  }
]);
