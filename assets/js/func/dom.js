angular.module('excavator.func.dom', []).

factory('func.dom.input.remember.state', [
  '$document',
  function ($document) {
    return function () {
      var activeElement = $document[0].activeElement;
      var node = activeElement.nodeName.toLowerCase();
      var index = -1;
      var selectionStart = -1;
      if (node === 'input' || node === 'textarea') {
        var all = $document[0].querySelectorAll(node);
        index = Array.prototype.indexOf.call(all, activeElement);
        try {
          selectionStart = activeElement.selectionStart;
        } catch (e) {}
      }
      return {
        nodeName: node,
        nodeIndex: index,
        selectionStart: selectionStart
      };
    };
  }
]).

factory('func.dom.input.restore.state', [
  '$document', '$timeout',
  function ($document, $timeout) {
    return function (state, element) {
      var elems = document.querySelectorAll(state.nodeName);
      var sameKind;
      if (state.nodeIndex > -1 && elems && elems[state.nodeIndex]) {
        sameKind = element.querySelectorAll(state.nodeName);
        sameKind = Array.prototype.slice.call(sameKind);
        if (sameKind.indexOf(elems[state.nodeIndex]) > -1) {
          elems[state.nodeIndex].focus();
          $timeout(function () {
            var start = state.selectionStart;
            if (start === -1) return;
            elems[state.nodeIndex].setSelectionRange(start, start);
          });
        }
      }
    };
  }
]).

factory('func.dom.preview.scroll.editor', [
  '$timeout',
  '$window',
  'shared.scroll',
  function ($timeout, $window, scrollTo) {
    return function (panelNumber) {
      var editor = $window.document.getElementById('editor-left');
      var panel = editor.querySelector('.panel-' + panelNumber);
      if (panel) {
        $timeout(function () {
          scrollTo.top(editor, panel.offsetTop - 5);
          var preview = $window.document.getElementById('editor-right');
          var scheme = preview.querySelector('.scheme-item-' + panelNumber);
          if (scheme) {
            scrollTo.top(preview, scheme.offsetTop - 10);
          }
        }, 150);
      }
    };
  }
]);
