angular.module('excavator.admin.validator', []).

service('admin.validator', [
  'i18n.translate',
  function (tr) {
    this.make = function (scope, options) {
      options = options || {};

      if (scope.page === 'general') {
        var general = scope.general;
        if (!angular.isObject(general)) return 'false';
        return general.value;
      }

      if (scope.page === 'choices') {
        var ret = scope.choices.filter(function (choice) {
          return choice;
        }).map(angular.toJson).join(', ');
        if (!ret) return 'false';
        if (options.valueIsArray) {
          return 'data instanceof Array && ' +
            'data.every(function (item) { return [' + ret +
            '].indexOf(item) > -1; })';
        }
        return '[' + ret + '].indexOf(data) > -1';
      }

      if (scope.page === 'boolean') {
        return 'data === true || data === false';
      }

      if (scope.page === 'numeric') {
        return 'typeof +data === "number" && +data >= ' + (scope.min || 0) +
          ' && +data <= ' + (scope.max || 100);
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

    this.say = function (scope, options) {
      options = options || {};

      if (scope.page === 'general') {
        var general = scope.general;
        if (!angular.isObject(general)) return tr('forms::should be empty');
        return general.say;
      }

      if (scope.page === 'choices') {
        var ret = scope.choices.filter(function (choice) {
          return choice;
        }).map(angular.toJson).join(', ');
        if (!ret) return tr('forms::should be empty');
        if (options.valueIsArray) {
          return tr('forms::should select at least one item of: ') + ret;
        }
        return tr('forms::should be one of the following: ') + ret;
      }

      if (scope.page === 'boolean') {
        return tr('forms::should be yes or no');
      }

      if (scope.page === 'numeric') {
        return tr('forms::should be a number between {{min}} to {{max}}', {
          min: scope.min, max: scope.max
        });
      }

      var ret = [];
      for (var i = 0; i < scope.charsets.length; i++) {
        if (scope.charsets[i].selected) {
          ret.push(scope.charsets[i].say);
        }
      }
      var con = { inc: ret, min: scope.min, max: scope.max };
      if (ret.length > 0) {
        return tr('forms::should include {{inc.join(", ")}} and ' +
          'have {{min}}-{{max}} characters', con);
      } else {
        return tr('forms::should have {{min}}-{{max}} characters', con);
      }
    };
  }
]).

directive('validator', [
  '$compile',
  '$modal',
  'admin.validator',
  'i18n.translate',
  'misc.general.validators',
  function ($compile, $modal, validator, tr, generalValidators) {

    function helper (parentScope, attr) {
      var modal = $modal({
        title: tr('forms::Configure validator'),
        template: '/forms/validators.html'
      });
      var scope = modal.$scope;

      var defaultString = parentScope.$eval(attr);

      scope.pages = [{
        label: tr('forms::GENERAL'),
        value: 'general'
      }, {
        label: tr('forms::STRING'),
        value: 'string'
      }, {
        label: tr('forms::NUMERIC'),
        value: 'numeric'
      }, {
        label: tr('forms::CHOICES'),
        value: 'choices'
      }, {
        label: tr('forms::BOOLEAN'),
        value: 'boolean'
      }];

      scope.generals = generalValidators(tr);
      for (var i = 0; i < scope.generals.length; i++) {
        if (scope.generals[i].value === defaultString) {
          scope.page = 'general';
          scope.general = scope.generals[i];
        }
      }

      if (!scope.page) {
        if (/("|')string\1/.test(defaultString)) {
          scope.page = 'string';
        } else if (/("|')number\1/.test(defaultString)) {
          scope.page = 'numeric';
        } else if (angular.isString(defaultString) &&
          defaultString.indexOf('true') > -1 &&
          defaultString.indexOf('false') > -1) {
          scope.page = 'boolean';
        } else if (defaultString.indexOf('indexOf') > -1) {
          scope.page = 'choices';
        } else {
          scope.page = 'general';
        }
      }

      scope.choices = [''];
      scope.add = function (index) {
        scope.choices.splice(index + 1, 0, '');
      };
      scope.minus = function (index) {
        scope.choices.splice(index, 1);
      };
      scope.charsets = [{
        label: tr('forms::Lowercase letters'),
        say: tr('forms::lowercase letters'),
        value: 'a-z'
      }, {
        label: tr('forms::Uppercase letters'),
        say: tr('forms::uppercase letters'),
        value: 'A-Z'
      }, {
        label: tr('forms::Chinese'),
        say: tr('forms::Chinese characters'),
        value: '\\u4e00-\\u9fff'
      }, {
        label: tr('forms::Numeric'),
        say: tr('forms::numbers'),
        value: '0-9'
      }];
      if (defaultString) {
        for (var i = 0; i < scope.charsets.length; i++) {
          if (defaultString.indexOf(scope.charsets[i].value) > -1) {
            scope.charsets[i].selected = true;
          }
        }
      }
      scope.min = 1;
      scope.max = 50;
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
        var matches = defaultString && defaultString.match(/(\[[\S\s]+?\])/);
        if (matches) {
          try {
            scope.choices = new Function('return ' + matches[1])();
          } catch (e) {}
        }
      }
      var options = {
        valueIsArray: parentScope.data.type === 'checkbox'
      };
      scope.make = function () {
        return validator.make(scope, options);
      };
      scope.say = function () {
        return validator.say(scope, options);
      };
      scope.ok = function () {
        modal.hide();
        parentScope.$eval(attr + '=' + angular.toJson(scope.make()));
        parentScope.$eval(attr + 'Message=' + angular.toJson(scope.say()));
      };
    }

    /**
     * Options: the 'static' attribute to disable helper and editing
     */
    return {
      restrict: 'E',
      link: function ($scope, $elem, $attrs) {
        var tpl;
        if (angular.isDefined($attrs.static)) {
          tpl = [
            '<div class="validator validator-static">',
              '<pre><code ng-bind="', $attrs.for, '"></code></pre>',
              '<input type="text" class="form-control" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
                'placeholder="', tr('forms::Help text'), '" ',
                'ng-change="', $attrs.for, 'MessageCustom = true" ',
                'ng-model="', $attrs.for, 'Message">',
            '</div>'
          ];
        } else {
          tpl = [
            '<div class="validator">',
              '<textarea class="form-control monospace" rows="3" placeholder="',
                tr('forms::JavaScript expression to pass validation'), '" ',
                'ng-model="', $attrs.for, '" ',
                'ng-model-options="{ updateOn: \'blur\'}"></textarea>',
              '<input type="text" class="form-control" ',
                'placeholder="', tr('forms::Help text'), '" ',
                'ng-model-options="{ updateOn: \'blur\'}" ',
                'ng-model="', $attrs.for, 'Message">',
              '<button type="button" class="btn btn-xs btn-default"',
                'ng-click="$helper(this, \'', $attrs.for, '\')">',
                tr('forms::Open Helper...'), '</button>',
            '</div>'
          ];
        }
        $elem.html(tpl.join(''));
        $compile($elem.contents())($scope);
        $scope.$helper = helper;
      }
    };
  }
]);
