angular.module('excavator.scheme.file', []).

directive('file', [
  '$timeout',
  'func.panic',
  'i18n.translate',
  function ($timeout, panic, tr) {
    return {
      link: function ($scope, $element, $attrs) {
        if (!$attrs.file) return;
        $element.on('change', function () {
          if (!this.files.length) return;
          var file = this.files[0];
          if (file.type !== 'image/jpeg') {
            $scope.data[$attrs.file] = '';
            $element[0].value = '';
            panic(tr('forms::You must select a JPEG image file.'));
            return;
          }
          $timeout(function () {
            $scope.data[$attrs.file] = '';
            $scope.imageLoading = true;
          });
          $timeout(function () {
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (event) {
              $scope.data[$attrs.file] = reader.result;
              $element[0].value = '';
              $scope.imageLoading = false;
            };
          }, 1000);
        });
      }
    };
  }
]);
