angular.module('excavator.func.value', []).

constant('func.value.image.suffix', function (img, type) {
  if (!angular.isObject(img)) return;
  if (!angular.isArray(img.suffixes)) return;
  var suffixes = img.suffixes;
  suffixes = suffixes.map(function (suffix) {
    var size = suffix.match(/([0-9]+).*?([0-9]+)/);
    var s1 = +size[1] || 0;
    var s2 = +size[2] || 0;
    var max = Math.max(s1, s2);
    return {
      suffix: suffix,
      size: max * (Math.min(s1, s2) || max)
    };
  });
  suffixes.sort(function (a, b) {
    return a.size > b.size ? 1 : -1;
  });
  if (type === 'small') {
    return suffixes[0].suffix;
  } else if (type === 'medium') {
    return suffixes[Math.floor(suffixes.length/2)].suffix;
  } else if (type === 'large') {
    return suffixes[suffixes.length - 1].suffix;
  }
  return ''; // original
}).

constant('func.value.image', function getImageSrc (img, suffix) {
  if (!angular.isObject(img)) return '';
  return [img.dir, '/', img.filename, suffix || '', '.', img.format].join('');
}).

constant('func.value.image.formats', [
  'jpg'
]).

directive('valueAsImage', [
  'func.value.image',
  'func.value.image.formats',
  'func.value.image.suffix',
  function (
    getImageSrc,
    imageFormats,
    getSuffix
  ) {
    function imageWrapper (img, options) {
      var suffix = getSuffix(img, options['image-size']);
      if (!suffix) return '-';
      return [
        '<div>',
          '<a href="', getImageSrc(img), '" target="_blank">',
            '<img src="', getImageSrc(img, suffix),'" class="img-rounded">',
          '</a>',
        '</div>'
      ].join('');
    }

    return {
      link: function ($scope, $element, $attrs) {
        var value = $scope.$eval($attrs.valueAsImage);
        var options = $scope.$eval($attrs.valueOptions) || {};
        $element.html(imageWrapper(value, options));
      }
    };
  }
]).

directive('valueResolve', [
  'func.value.image',
  'func.value.image.formats',
  'func.value.image.suffix',
  function (
    getImageSrc,
    imageFormats,
    getSuffix
  ) {
    function imageWrapper (img, options) {
      var suffix = getSuffix(img, options['image-size']);
      return [
        '<div>',
          '<a href="', getImageSrc(img), '" target="_blank">',
            '<img src="', getImageSrc(img, suffix),'" class="img-rounded">',
          '</a>',
        '</div>'
      ].join('');
    }

    function multilineWrapper (value) {
      return [ '<pre><code>', value, '</code></pre>' ].join('');
    }

    function display (value, options) {
      if (angular.isObject(value)) {
        if (angular.isString(value.format) &&
          imageFormats.indexOf(value.format) > -1) {
          return imageWrapper(value, options);
        }
        return angular.toJson(value, true);
      } else if (angular.isString(value) && value.indexOf('\n') > -1) {
        return multilineWrapper(value);
      }
      return value;
    }

    return {
      link: function ($scope, $element, $attrs) {
        var value = $scope.$eval($attrs.valueResolve);
        var options = $scope.$eval($attrs.valueOptions) || {};
        $element.html(display(value, options));
      }
    };
  }
]);
