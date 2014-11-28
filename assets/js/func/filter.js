angular.module('excavator.func.filter', []).

filter('b64size', [
  function () {
    return function (base64) {
      var realsize = base64.length / 4 * 3;
      if (realsize < 1024 * 1024) {
        realsize /= 1024;
        return realsize.toFixed(3) + 'KB';
      } else {
        realsize /= 1024 * 1024;
        return realsize.toFixed(3) + 'MB';
      }
    };
  }
]);
