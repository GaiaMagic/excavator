angular.module('excavator.public.container', []).

run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('form-container',
      '<div class="main container" ng-if="cpf.form">' +
        '<div class="main-form col-xs-10 col-xs-offset-1">' +
          '<h2 class="text-center" ng-bind="cpf.form.title"></h2>' +
          '<hr>' +
          '<form class="form-horizontal" ng-submit="cpf.submit()">' +
            '<div scheme="scheme" scheme-data="cpf.form.content.data" ' +
              'ng-repeat="scheme in cpf.form.content.scheme"></div>' +
          '</form>' +
        '</div>' +
      '</div>'
    );
  }
]).

directive('container', [
  '$compile',
  '$document',
  '$templateCache',
  function ($compile, $document, $templateCache) {
    function findFilesByType(tpl, filetype, limit) {
      var files = [];
      if (angular.isObject(tpl) && angular.isArray(tpl.files)) {
        for (var i = 0; i < tpl.files.length; i++) {
          if (tpl.files[i].type === filetype) {
            files.push(tpl.files[i].content);
            if (i + 1 === limit) break;
          }
        }
      }
      return files;
    }

    return {
      link: function ($scope, $elem, $attrs) {
        var cpf = $scope.cpf;
        if (!cpf) return;
        var tpl = cpf.form.form.template;
        var html = findFilesByType(tpl, 'text/html', 1)[0];
        if (!html) {
          html = $templateCache.get('form-container');
        }
        $elem.html(html);
        $compile($elem.contents())($scope);
        if (tpl) {
          var head = $document[0].getElementsByTagName('head')[0];
          var files = findFilesByType(tpl, 'text/css');
          files.forEach(function (file) {
            var style = $document[0].createElement('style');
            style.innerHTML = file;
            head.appendChild(style);
          });
        }
      }
    };
  }
]);
