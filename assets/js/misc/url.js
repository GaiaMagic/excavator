angular.module('excavator.misc.url', []).

service('misc.url', [
  function () {
    // from Angular.JS source

    function sortedKeys (obj) {
      var keys = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys.sort();
    }

    function forEachSorted (obj, iterator, context) {
      var keys = sortedKeys(obj);
      for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
      }
      return keys;
    }

    function encodeUriQuery (val, pctEncodeSpaces) {
      return encodeURIComponent(val).
             replace(/%40/gi, '@').
             replace(/%3A/gi, ':').
             replace(/%24/g, '$').
             replace(/%2C/gi, ',').
             replace(/%3B/gi, ';').
             replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    function buildUrl (url, params) {
      if (!params) return url;
      var parts = [];
      forEachSorted(params, function(value, key) {
        if (value === null || angular.isUndefined(value)) return;
        if (!angular.isArray(value)) value = [value];
        for (var i = 0; i < value.length; i++) {
          var v = value[i];
          if (angular.isObject(v)) {
            if (angular.isDate(v)){
              v = v.toISOString();
            } else {
              v = angular.toJson(v);
            }
          }
          parts.push(encodeUriQuery(key) + '=' + encodeUriQuery(v));
        }
      });
      if(parts.length > 0) {
        url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
      }
      return url;
    }

    this.buildUrl = buildUrl;
  }
]);
