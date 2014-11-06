angular.module('excavator.scheme', [
  'excavator.scheme.editor'
]).

service('schemes', ['func.error', function (error) {
  this.all = require('../../../models/schemes/index.js');

  this.list = function () {
    var self = this;
    return Object.keys(this.all).map(function (name) {
      var scheme = self.all[name];
      return {
        name: scheme.title || scheme.name || '(untitled)'
      };
    });
  };

  this.get = function (name, version) {
    var module = this.all[name];
    if (!angular.isObject(module)) {
      error('Module', name, 'does not exist!');
      return undefined;
    }
    if (angular.isDefined(module[version])) {
      return module[version];
    }
    if (angular.isDefined(module[module.latest])) {
      error('Module', name, 'version', version, 'does not exist,',
        'however, the latest version', module.latest, 'is used.');
      return module[module.latest];
    }
    error('Module', name, 'version', version, 'does not exist!');
    return undefined;
  };
}]).

directive('scheme', [
  '$compile',
  '$injector',
  '$interpolate',
  'func.dom.input.restore.state',
  'func.enumerate',
  'schemes',
  function (
    $compile,
    $injector,
    $interpolate,
    restoreState,
    enumerate,
    schemes
  ) {
  return {
    link: function ($scope, $elem, $attrs) {
      function updateSchemeView (e, state) {
        var data = $scope.$eval($attrs.schemeData);
        var scheme = $scope.$eval($attrs.scheme);
        var proto = schemes.get(scheme.type, scheme.version);
        if (angular.isUndefined(proto)) return;

        var render = $attrs.schemeRender || 'template';
        if (!proto[render]) {
          throw 'scheme does not contain render type ' + render;
        }
        var renderInit = proto[render + 'Init'];

        $scope.data = data || {};
        if (angular.isArray(renderInit) || angular.isFunction(renderInit)) {
          $injector.invoke(renderInit, $scope);
        }

        var html = enumerate(proto[render], $scope).join('');
        html = $interpolate(html)(scheme);
        html = html.replace(/\[\[/g, '{{').replace(/\]\]/g, '}}');
        $elem.html(html);

        $compile($elem.contents())($scope);

        // restore focus and selection start
        if (state) restoreState(state, $elem[0]);
      }

      $scope.$on('update scheme view', updateSchemeView);
      updateSchemeView();
    }
  };
}]);
