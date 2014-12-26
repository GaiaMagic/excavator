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

service('file.manager', [
  function () {
    function findFilesByType (tpl, filetype, limit) {
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

    this.findFilesByType = findFilesByType;

    var replaceables = ['image'];

    function findFileByName (tpl, name, restrictTypes) {
      if (angular.isObject(tpl) && angular.isArray(tpl.files)) {
        for (var i = 0; i < tpl.files.length; i++) {
          if (
              tpl.files[i].name === name &&
              (
               !restrictTypes ||
               restrictTypes.indexOf(tpl.files[i].type) > -1
              )
             ) {
            return tpl.files[i];
          }
        }
      }
      return {};
    }

    this.findFileByName = findFileByName;

    function replaceVariable (tpl) {
      if (angular.isObject(tpl) && angular.isArray(tpl.files)) {
        for (var i = 0; i < tpl.files.length; i++) {
          if (replaceables.indexOf(tpl.files[i].type) === -1) {
            tpl.files[i].content = tpl.files[i].content.replace(/%%(.+?)%%/g,
            function (p0, p1) {
              return findFileByName(tpl, p1.trim(), replaceables).content || p0;
            });
          }
        }
      }
    }

    this.replaceVariable = replaceVariable;
  }
]).

directive('container', [
  '$compile',
  '$document',
  '$templateCache',
  'file.manager',
  function ($compile, $document, $templateCache, fileMan) {
    return {
      link: function ($scope, $elem, $attrs) {
        var cpf = $scope.cpf;
        if (!cpf || !cpf.form) return;
        var tpl = cpf.form.form.head.template;
        var html = fileMan.findFilesByType(tpl, 'text/html', 1)[0];
        if (!html) {
          html = $templateCache.get('form-container');
        }

        $elem.html(html);
        $compile($elem.contents())($scope);
        if (tpl) {
          fileMan.replaceVariable(tpl);
          var head = $document[0].getElementsByTagName('head')[0];
          var files = fileMan.findFilesByType(tpl, 'text/css');
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
