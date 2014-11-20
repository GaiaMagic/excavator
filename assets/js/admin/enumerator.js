angular.module('excavator.admin.enumerator', []).

directive('enumerator', [
  '$compile',
  '$modal',
  '$parse',
  'func.array',
  'func.formatter.function.reindent',
  function ($compile, $modal, $parse, funcArray, reindent) {
    function stringORprimitive (string) {
      try {
        return new Function('return ' + string)();
      } catch (e) {
        return string;
      }
    }

    function helper (parentScope, src, attr) {
      var modal = $modal({
        title: 'Configure enumerator',
        template: '/forms/enumerators.html'
      });

      var scope = modal.$scope;

      var data = $parse(src)(parentScope);
      var defaultValue = data[attr];

      scope.pages = [{
        label: 'NUMBER RANGE',
        value: 'number'
      }, {
        label: 'LIST',
        value: 'list'
      }, {
        label: 'CUSTOM',
        value: 'custom'
      }];

      scope.min = 18;
      scope.max = 60;
      scope.tpl = '';

      scope.list = [''];
      scope.label = [''];
      scope.array = funcArray;

      scope.multiline = '';
      scope.multi2list = function () {
        scope.list = scope.multiline.split('\n').map(function (line) {
          return line.trim();
        }).filter(function (line) {
          return line;
        });
        scope.multiline = '';
      };

      scope.check = function () {
        if (scope.custom) {
          try {
            var ret = new Function('return ' + scope.custom)();
            if (angular.isFunction(ret)) ret = ret();
            if (!(ret instanceof Array)) throw 'Return value should be an array.';
          } catch (e) {
            scope.errors = e.message ? e.message : e;
            return;
          }
        }
        scope.errors = 'No errors (as of ' + (new Date).toJSON() + ').';
      };
      scope.check();

      var isList = true;
      if (angular.isArray(defaultValue)) {
        scope.page = 'list';
        if (angular.isObject(defaultValue[0])) {
          var list = [];
          var label = [];
          for (var i = 0; i < defaultValue.length; i++) {
            if (angular.isUndefined(defaultValue[i].value)) {
              isList = false;
              break;
            }
            list.push(defaultValue[i].value);
            label.push(defaultValue[i].label);
          }
          if (isList) {
            scope.list = list;
            scope.label = label;
            scope.customlabel = true;
          }
        } else {
          scope.list = angular.copy(defaultValue);
        }
      }
      if (!isList) {
        var isCustom = true;
        var string = defaultValue.toString();
        var matches = string.match(/length:\s*(\d+)[\S\s]+i\s*\+\s*(\d+)/);
        if (matches && string.indexOf('label') === -1) {
          var n1 = +matches[1], n2 = +matches[2];
          if (n1 > 0 && n2 > 0) {
            scope.min = n2;
            scope.max = n1 + n2 - 1;
            isCustom = false;
          }
        }
        if (isCustom) {
          scope.page = 'custom';
          if (angular.isFunction(defaultValue)) {
            scope.custom = reindent(defaultValue);
          } else {
            scope.custom = angular.toJson(defaultValue, true);
          }
        } else {
          scope.page = 'number';
        }
      }

      scope.make = function () {
        var ret;

        if (scope.page === 'custom') {
          return scope.custom;
        }

        if (scope.page === 'list') {
          var ret = scope.list.filter(function (p) {
            return !(typeof p === 'string' && p.length === 0);
          }).map(function (p) {
            return stringORprimitive(p);
          });
          if (scope.customlabel) {
            ret = ret.map(function (p, i) {
              return {
                label: scope.label[i] || p,
                value: stringORprimitive(p)
              };
            });
          }
          return angular.toJson(ret, true);
        }

        var exp = '(i + ' + scope.min + ')';
        if (angular.isString(scope.tpl) && scope.tpl && scope.tpl !== '%d') {
          var label;
          label = angular.toJson(scope.tpl);
          label = label.replace(/%d/g, '" + ' + exp + ' + "');
          label = label.replace(/(""\s*\+\s*|\s*\+\s*"")/g, '');
          ret = [
            'function () {',
            '  return Array.apply(undefined, {length: ' +
              (scope.max - scope.min + 1) + '}).map(function (v, i) {',
            '    return {',
            '      label: ' + label + ',',
            '      value: i + ' + scope.min + '',
            '    };',
            '  });',
            '}'
          ];
        } else {
          ret = [
            'function () {',
            '  return Array.apply(undefined, {length: ' +
              (scope.max - scope.min + 1) + '}).map(function (v, i) {',
            '    return i + ' + scope.min + ';',
            '  });',
            '}'
          ];
        }
        return ret.join('\n');
      };
      scope.ok = function () {
        modal.hide();
        var data = $parse(src)(parentScope);
        data[attr] = new Function('return ' + scope.make())();
      };
    }

    return {
      restrict: 'E',
      link: function ($scope, $elem, $attrs) {
        var tpl = [
          '<div class="enumerator">',
            '<pre><code ng-bind="', $attrs.for, '.',
              $attrs.attr, ' | stringify"></code></pre>',
            '<button type="button" class="btn btn-xs btn-default"',
              'ng-click="$enumerator(this, \'', $attrs.for,
              '\', \'', $attrs.attr, '\')">',
              'Open Helper...</button>',
          '</div>'
        ];
        $elem.html(tpl.join(''));
        $compile($elem.contents())($scope);
        $scope.$enumerator = helper;
      }
    };
  }
]);
