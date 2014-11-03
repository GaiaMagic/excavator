angular.module('excavator.func.array', []).

factory('func.array', [function () {
  return {
    edgeT: function (array, index) {
      return index === 0;
    },
    edgeB: function (array, index) {
      return index === array.length - 1;
    },
    delete: function (array, index) {
      if (!angular.isArray(array)) return;
      array.splice(index, 1);
    },
    duplicate: function (array, index) {
      if (!angular.isArray(array)) return;
      array.splice(index, 0, angular.copy(array[index]));
    },
    moveup: function (array, index) {
      if (!angular.isArray(array) || index < 1) return;
      var item = array[index];
      array[index] = array[index - 1];
      array[index - 1] = item;
    },
    movedown: function (array, index) {
      if (!angular.isArray(array) || index > array.length - 2) return;
      var item = array[index];
      array[index] = array[index + 1];
      array[index + 1] = item;
    }
  };
}]);
