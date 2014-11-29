angular.module('excavator.shared.subs.value', []).

constant('subs.value.get.image.suffix', function (img, type) {
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

constant('subs.value.get.image.source', function getImageSource (img, suffix) {
  if (!angular.isObject(img)) return '';
  return [img.dir, '/', img.filename, suffix || '', '.', img.format].join('');
}).

constant('subs.value.image.formats', [
  'jpg'
]).

directive('subsValue', [
  'subs.value.get.image.source',
  'subs.value.get.image.suffix',
  'subs.value.image.formats',
  function (
    getImageSource,
    getImageSuffix,
    imageFormats
  ) {
    function imageWrapper (img, options) {
      var suffix = getImageSuffix(img, options.imageSize);
      return [
        '<div class="subs-image-', (options.imageSize || 'small'), '">',
          '<a href="', getImageSource(img), '" target="_blank">',
            '<img src="', getImageSource(img, suffix),'" class="img-rounded">',
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
        if (options.imageOnly) return;
        return angular.toJson(value, true);
      }
      if (options.imageOnly) return;
      if (angular.isString(value)) {
        if (value.indexOf('\n') > -1 || value.length > 200) {
          return multilineWrapper(value);
        }
      }
      return value;
    }

    return {
      link: function ($scope, $element, $attrs) {
        var value = $scope.$eval($attrs.subsValue);
        var options = $scope.$eval($attrs.subsValueOptions) || {};
        $element.html(display(value, options));
      }
    };
  }
]);
