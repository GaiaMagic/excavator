angular.module('excavator.misc.async', []).

constant('misc.libs', {
  jquery2: {
    url: '/js/jquery-2.1.3.min.js',
    get: function () {
      return window.jQuery;
    }
  },
  "dropdowns-enhancement": {
    url: [
      '/js/dropdowns-enhancement-3.1.1.min.js',
      '/css/dropdowns-enhancement-3.1.1.css'
    ],
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
    function load (URL) {
      var lib = this;
      return $q(function (resolve, reject) {
        var head = $document[0].getElementsByTagName('head')[0];
        if (/\.js$/.test(URL)) {
          var script = $document[0].createElement('script');
          script.onload = function () {
            if (angular.isFunction(lib.get)) {
              resolve(lib.get());
            } else {
              resolve();
            }
          };
          head.appendChild(script);
          script.src = cdnify(URL);
          return;
        } else if (/\.css$/.test(URL)) {
          var link = $document[0].createElement('link');
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = cdnify(URL);
          head.appendChild(link);
          resolve();
          return;
        }
        reject();
      });
    }

    function cdnify (URL) {
      if (domains.cdn) {
        URL = domains.cdn + URL;
      }
      return URL;
    }

    return function (lib) {
      if (!lib) throw 'no lib to load';
      if (!lib.promise) {
        if (angular.isFunction(lib.get) && lib.get()) {
          lib.promise = $q(function (resolve) {
            resolve(lib.get());
          });
        } else {
          if (angular.isArray(lib.url)) {
            lib.promise = $q.all(lib.url.map(function (url) {
              return load.call(lib, url);
            }));
          } else {
            lib.promise = load.call(lib, lib.url);
          }
        }
      }
      return lib.promise;
    }
  }
]);
