angular.module('excavator.misc.share', []).

run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('share-qrcode', [
      '<div class="modal" tabindex="-1" role="dialog">',
        '<div class="modal-dialog" style="width: 310px; ',
          'margin-left: auto; margin-right: auto;">',
          '<div class="modal-content">',
            '<div class="modal-body">',
              '<qrcode text="{{url}}" width="280"></qrcode>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''));
  }
]).

directive('qrcode', [
  '$q',
  '$document',
  '$window',
  function ($q, $document, $window) {
    return {
      restrict: 'E',
      link: function ($scope, $element, $attrs) {
        $q(function (resolve, reject) {
          if ($window.QRCode) return resolve();
          var script = $document[0].createElement('script');
          var deferred = $q.defer();
          script.onload = function () {
            resolve();
          };
          $document[0].body.appendChild(script);
          script.src = '/js/qrcode.min.js';
        }).then(function () {
          var qrcode = new $window.QRCode($element[0], {
            text: $attrs.text || '',
            width: +$attrs.width || 200,
            height: +$attrs.width || 200
          });
          qrcode._el.title = '';
          $attrs.$observe('text', function (text) {
            qrcode.clear();
            qrcode.makeCode(text || '');
          });
        });
      }
    };
  }
]).

directive('shareTo', [
  '$modal',
  '$window',
  function ($modal, $window) {
    return {
      link: function ($scope, $element, $attrs) {
        var type = $attrs.shareTo;
        switch (type) {
        case 'weibo':
          var link = 'http://openapi.baidu.com/social/widget/share';
          link += '?method=share&media_type=sinaweibo';
          link += '&client_id=' + $attrs.weiboId;
          link += '&url=' + encodeURIComponent($window.location.href);
          link += '&pic_url=';
          link += '&u=' + encodeURIComponent($window.location.href);
          $element.attr('target', '_blank');

          $attrs.$observe('weiboContent', function (text) {
            var content = '&content=' + encodeURIComponent(text);
            $element.attr('href', link + content);
          });
          break;
        case 'wechat':
          $element.on('click', function () {
            var modal = $modal({
              template: 'share-qrcode'
            });
            modal.$scope.url = $window.location.href;
          });
          break;
        }
      }
    };
  }
]);
