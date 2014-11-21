angular.module('excavator.i18n', [
  'excavator.i18n.dictionary'
]).

service('i18n.linguist', [
  '$rootScope',
  'i18n.dictionary',
  function ($rootScope, dictionary) {
    this.lang = 'zh';
    this.dict = dictionary(this.lang);

    this.langs = {
      'en': 'EN',
      'zh': '中'
    };

    this.setLang = function (langcode) {
      this.lang = langcode;
      this.dict = dictionary(this.lang);
      $rootScope.$broadcast('language change');
    };

    this.transform = function (text, scope) {
      return text.replace(/!!(.+?)!!/g, function (p0, p1) {
        return scope.$eval(p1);
      });
    };

    this.translate = function (src, scope) {
      if (!angular.isString(src)) return '(undefined)';
      var parts = src.split('::');
      var l = parts.length;
      var def = parts[l - 1];
      var current = this.dict;
      for (var i = 0; i < l + 1; i++) {
        if (angular.isUndefined(current)) return def;
        if (angular.isString(current)) {
          return this.transform(current, scope) || def;
        }
        if (i === l) return def;
        current = current[parts[i]];
      }
    };
  }
]).

directive('i18n', [
  'i18n.linguist',
  function (linguist) {
    return {
      link: function ($scope, $element, $attrs) {
        $scope.$on('language change', onLanguageChange)
        $scope.$emit('language change');
        function onLanguageChange () {
          var attr = $attrs.i18n.trim();
          if (attr[0] === '{') {
            var assigns;
            try {
              assigns = $scope.$eval(attr);
            } catch (e) {}
          } else {
            assigns = { text: attr };
          }
          if (!angular.isObject(assigns)) return;
          for (var key in assigns) {
            var translated = linguist.translate(assigns[key], $scope);
            var keys = key.split(',');
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i].trim();
              if (key === 'text') {
                $element.text(translated);
                continue;
              } else if (key) {
                $element.attr(key, translated);
              }
            }
          }
        }
      }
    };
  }
]);
