angular.module('excavator.admin.validator', []).

directive('validator', [
  '$compile',
  '$modal',
  function ($compile, $modal) {

    function helper (parentScope, attr) {
      var modal = $modal({
        title: 'Configure validator',
        template: '/control/forms/validators.html'
      });
      var scope = modal.$scope;

      var defaultString = parentScope.$eval(attr);

      scope.pages = [{
        label: 'STRING',
        value: 'string'
      }, {
        label: 'NUMERIC',
        value: 'numeric'
      }, {
        label: 'CHOICES',
        value: 'choices'
      }, {
        label: 'BOOLEAN',
        value: 'boolean'
      }];

      if (!defaultString || /("|')string\1/.test(defaultString)) {
        scope.page = 'string';
      } else if (/("|')number\1/.test(defaultString)) {
        scope.page = 'numeric';
      } else if (defaultString.indexOf('true') > -1 &&
        defaultString.indexOf('false') > -1) {
        scope.page = 'boolean';
      } else {
        scope.page = 'choices';
      }

      scope.choices = [''];
      scope.add = function (index) {
        scope.choices.splice(index + 1, 0, '');
      };
      scope.charsets = [{
        label: 'Lowercase letters',
        say: 'lowercase letters',
        value: 'a-z'
      }, {
        label: 'Uppercase letters',
        say: 'uppercase letters',
        value: 'A-Z'
      }, {
        label: 'Chinese',
        say: 'Chinese characters',
        value: '\\u4e00-\\u9fff'
      }, {
        label: 'Numeric',
        say: 'numbers',
        value: '0-9'
      }];
      if (defaultString) {
        for (var i = 0; i < scope.charsets.length; i++) {
          if (defaultString.indexOf(scope.charsets[i].value) > -1) {
            scope.charsets[i].selected = true;
          }
        }
      }
      scope.min = 0;
      scope.max = 100;
      if (scope.page === 'string') {
        var matches = defaultString && defaultString.match(/\{(\d+),(\d+)\}/);
        if (matches) {
          scope.min = +matches[1];
          scope.max = +matches[2];
        }
      } else if (scope.page === 'numeric') {
        var matches = defaultString && defaultString.match(/>=\s*(\d+)/);
        if (matches) {
          scope.min = +matches[1];
        }
        matches = defaultString.match(/<=\s*(\d+)/);
        if (matches) {
          scope.max = +matches[1];
        }
      } else if (scope.page === 'choices') {
        var matches = defaultString && defaultString.match(/(\[\s*".*"\s*\])/);
        if (matches) {
          scope.choices = new Function('return ' + matches[1])();
        }
      }
      scope.make = function () {
        if (scope.page === 'choices') {
          var ret = scope.choices.filter(function (choice) {
            return choice;
          }).map(angular.toJson).join(', ');
          return ret ? ('[' + ret + '].indexOf(data) > -1') : 'false';
        }

        if (scope.page === 'boolean') {
          return 'data === true || data === false';
        }

        if (scope.page === 'numeric') {
          return 'typeof data === "number" && data >= ' + (scope.min || 0) +
            ' && data <= ' + (scope.max || 100);
        }

        var regex = '';
        for (var i = 0; i < scope.charsets.length; i++) {
          if (scope.charsets[i].selected) {
            regex += scope.charsets[i].value
          }
        }
        return 'typeof data === "string" && /' + (regex ? ('[' + regex +
          ']') : '.') + '{' + (scope.min || 0) + ',' + (scope.max || 100) +
          '}/.test(data)';
      };
      scope.say = function () {
        if (scope.page === 'choices') {
          var ret = scope.choices.filter(function (choice) {
            return choice;
          }).map(angular.toJson).join(', ');
          return ret ? ('contain one of ' + ret) : '';
        }

        if (scope.page === 'boolean') {
          return 'be yes or no';
        }

        if (scope.page === 'numeric') {
          return 'be a number between ' + scope.min + ' to ' + scope.max;
        }

        var ret = [];
        for (var i = 0; i < scope.charsets.length; i++) {
          if (scope.charsets[i].selected) {
            ret.push(scope.charsets[i].say);
          }
        }
        var con = '';
        if (ret.length > 0) con = 'include ' + ret.join(', ') + ' and ';
        return con + 'have ' + scope.min + '-' + scope.max + ' characters';
      };
      scope.ok = function () {
        modal.hide();
        parentScope.$eval(attr + '=' + angular.toJson(scope.make()));
        parentScope.$eval(attr + 'Message=' + angular.toJson(scope.say()));
      };
    }

    return {
      restrict: 'E',
      link: function ($scope, $elem, $attrs) {
        var tpl = [
          '<div class="validator">',
            '<textarea class="form-control monospace" rows="3" ',
              'placeholder="JavaScript expression to pass validation" ',
              'ng-model="', $attrs.for, '" ',
              'ng-model-options="{ debounce: 500 }"></textarea>',
            '<input type="text" class="form-control" ',
              'placeholder="Help text" ',
              'ng-model="', $attrs.for, 'Message">',
            '<button type="button" class="btn btn-xs btn-default"',
              'ng-click="$helper(this, \'', $attrs.for, '\')">',
              'Open Helper...</button>',
          '</div>'
        ];
        $elem.html(tpl.join(''));
        $compile($elem.contents())($scope);
        $scope.$helper = helper;
      }
    };
  }
]);
