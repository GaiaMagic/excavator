angular.module('excavator.func.panic', []).

run([
  '$templateCache',
  function (cache) {
    cache.put('func.panic.modal.template', [
      '<div class="modal" tabindex="-1" role="dialog">',
        '<div class="modal-dialog">',
          '<div class="modal-content">',
            '<div class="modal-header" ng-show="title">',
              '<button type="button" class="close" ',
                'ng-click="$hide()">&times;</button>',
              '<h4 class="modal-title" ng-bind="title"></h4>',
            '</div>',
            '<div class="modal-body" ng-bind="content"></div>',
            '<div class="modal-footer">',
              '<button type="button" class="btn btn-default" ',
                'ng-click="$hide()">Close</button>',
            '</div>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''));
  }
]).

factory('func.panic', [
  '$modal',
  function ($modal) {
    return function (err) {
      var details;
      var errorMsg;
      if (angular.isObject(err)) details = err.data;
      if (details) {
        errorMsg = details.message;
      } else {
        errorMsg = 'Unexpected error was encountered.';
      }
      $modal({
        title: 'Error',
        content: errorMsg,
        template: 'func.panic.modal.template'
      });
    };
  }
]).

factory('func.panic.alert', [
  '$modal',
  function ($modal) {
    return function (content, title) {
      $modal({
        title: title || 'Info',
        content: content,
        template: 'func.panic.modal.template'
      });
    };
  }
]);
