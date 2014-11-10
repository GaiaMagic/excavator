angular.module('excavator.func.panic', []).

run([
  '$templateCache',
  function (cache) {
    cache.put('func.panic.modal.template', [
      '<div class="modal" tabindex="-1" role="dialog">',
        '<div class="modal-dialog">',
          '<div class="modal-content panel-{{ modalType }}">',
            '<div class="modal-header panel-heading" ng-show="title">',
              '<button type="button" class="close" ',
                'ng-click="$hide()">&times;</button>',
              '<h4 class="modal-title" ng-bind="title"></h4>',
            '</div>',
            '<div class="modal-body">',
              '<p ng-bind="content" ng-if="!errorMsgs"></p>',
              '<ul ng-if="errorMsgs">',
                '<li ng-repeat="msg in errorMsgs" ng-bind="msg"></li>',
              '</ul>',
            '</div>',
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
      var errorMsgs;
      if (angular.isString(err)) {
        errorMsg = err;
      } else {
        if (angular.isObject(err)) details = err.data;
        if (details) {
          errorMsg = details.message;
          errorMsgs = details.messages;
        } else {
          if (err.status === 0) {
            errorMsg = 'Unable to access network. Check your network settings.';
          } else {
            errorMsg = 'Unexpected error was encountered.';
          }
        }
      }
      var modal = $modal({
        title: 'Error',
        content: errorMsg,
        template: 'func.panic.modal.template'
      });
      modal.$scope.modalType = 'danger';
      modal.$scope.errorMsgs = errorMsgs;
    };
  }
]).

factory('func.panic.alert', [
  '$location',
  '$modal',
  '$timeout',
  function ($location, $modal, $timeout) {
    /**
     * show an alert modal window
     * @param  {string}   content  the body of the alert window
     * @param  {string}   title    the title of the alert window
     * @param  {str/func} hide     function to be executed after modal window
     *                             is hidden, if this is a URI string, it will
     *                             go to this location
     * @return {undefined}         this function returns nothing
     */
    return function (content, title, hide) {
      var modal = $modal({
        title: title || 'Info',
        content: content,
        template: 'func.panic.modal.template'
      });
      modal.$scope.modalType = 'info';
      var hideEvent;
      if (angular.isString(hide)) {
        hideEvent = function () {
          $location.path(hide);
        };
      } else if (angular.isFunction(hide)) {
        hideEvent = hide;
      }
      if (angular.isFunction(hideEvent)) {
        modal.$scope.$on('modal.hide', function () {
          $timeout(hideEvent);
        });
      }
    };
  }
]);
