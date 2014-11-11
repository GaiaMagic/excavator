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
      if (!angular.isArray(array)) return this;
      array.splice(index, 1);
      return this;
    },
    duplicate: function (array, index) {
      if (!angular.isArray(array)) return this;
      array.splice(index, 0, angular.copy(array[index]));
      return this;
    },
    moveup: function (array, index) {
      if (!angular.isArray(array) || index < 1) return this;
      var item = array[index];
      array[index] = array[index - 1];
      array[index - 1] = item;
      return this;
    },
    movedown: function (array, index) {
      if (!angular.isArray(array) || index > array.length - 2) return this;
      var item = array[index];
      array[index] = array[index + 1];
      array[index + 1] = item;
      return this;
    },
    push: function (array, what) {
      if (!angular.isArray(array)) return this;
      array.push(what);
      return this;
    }
  };
}]);
