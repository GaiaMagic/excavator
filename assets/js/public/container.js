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
  '$templateCache',
  function ($compile, $templateCache) {
    return {
      restrict: 'E',
      link: function ($scope, $elem, $attrs) {
        $elem.html($templateCache.get('form-container'));
        $compile($elem.contents())($scope);
      }
    };
  }
]);
