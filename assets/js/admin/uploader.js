angular.module('excavator.admin.uploader', []).

directive('adminUploader', [
  'backend.template.upload',
  'func.panic',
  function (upload, panic) {
    return {
      scope: {
        image: '=adminUploader'
      },
      link: function ($scope, $element, $attrs) {
        $element.on('change', function () {
          var files = this.files;
          if (files.length === 0) return;
          var reader = new FileReader();
          reader.readAsDataURL(files[0]);
          reader.onload = function (event) {
            upload(reader.result).then(function (res) {
              var ret = res.data;
              $scope.image = ret.dir + '/' + ret.filename + '.' + ret.format;
            }).catch(panic);
          };
        });
      }
    };
  }
]);
