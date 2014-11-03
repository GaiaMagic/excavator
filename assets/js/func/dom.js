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
        selectionStart = activeElement.selectionStart;
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
            elems[state.nodeIndex].setSelectionRange(start, start);
          });
        }
      }
    };
  }
]);
