angular.module('excavator.misc.async', []).

constant('misc.libs', {
  jquery2: {
    url: '/js/jquery-2.1.3.min.js',
    get: function () {
      return window.jQuery;
    }
  },
  "dropdowns-enhancement": {
    url: '/js/dropdowns-enhancement-3.1.1.min.js',
    get: function () {
      return window.jQuery.fn.dropdown;
    }
  },
  qrcode: {
    url: '/js/qrcode.min.js',
    get: function () {
      return window.QRCode;
    }
  }
}).

factory('misc.async', [
  '$q',
  'misc.async.load',
  'misc.libs',
  function ($q, load, LIBS) {
    return function (libs) {
      if (!angular.isArray(libs)) {
        throw 'libs should be an array';
      }
      return libs.reduce(function (prev, next) {
        return prev.then(function () {
          var lib = LIBS[next];
          if (!lib) throw 'lib "' + next + '" does not exist.';
          return load(lib);
        });
      }, $q(function (resolve) {resolve()}));
    };
  }
]).

factory('misc.async.load', [
  '$document',
  '$q',
  'shared.domains',
  function ($document, $q, domains) {
    return function (lib) {
      if (!lib) throw 'no lib to load';
      if (!lib.promise) {
        if (angular.isFunction(lib.get) && lib.get()) {
          lib.promise = $q(function (resolve) {
            resolve(lib.get());
          });
        } else {
          lib.promise = $q(function (resolve, reject) {
            var script = $document[0].createElement('script');
            script.onload = function () {
              if (angular.isFunction(lib.get)) {
                resolve(lib.get());
              } else {
                resolve();
              }
            };
            $document[0].body.appendChild(script);
            var url = lib.url;
            if (domains.cdn) {
              url = domains.cdn + url;
            }
            script.src = url;
          });
        }
      }
      return lib.promise;
    }
  }
]);
