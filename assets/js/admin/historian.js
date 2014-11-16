angular.module('excavator.admin.historian', []).

directive('historian', [
  '$parse',
  '$window',
  'func.localstorage.keys',
  'func.localstorage.load',
  'func.localstorage.remove',
  'func.localstorage.save',
  'func.scheme.parse',
  'func.scheme.stringify',
  function ($parse, $window, keys, load, remove, save, parse, stringify) {
    var historian = 'scheme.historian.entry';
    var historianIndex = historian + '.index';
    var maxEntries = 21;
    return {
      link: function ($scope, $element, $attrs) {
        // clear old history data
        keys().filter(function (key) {
          return key.slice(0, historian.length) === historian;
        }).forEach(function (key) {
          remove(key);
        });
        save(historian, []);
        save(historianIndex, 0);

        function write (object) {
          var key = Date.now();
          var entries = load(historian, angular.fromJson);
          if (!angular.isArray(entries)) entries = [];
          var index = parseInt(load(historianIndex)) || 0;
          save(historian + '.' + key, stringify(object));
          var deleted = entries.splice(0, index);
          for (var i = 0; i < deleted.length; i++) {
            remove(historian + '.' + deleted[i]);
          }
          entries.unshift(key);
          var overflow = entries.splice(maxEntries);
          for (var i = 0; i < overflow.length; i++) {
            remove(historian + '.' + overflow[i]);
          }
          save(historian, entries);
          save(historianIndex, 0);
        }

        var writable = true;
        $scope.$on('update scheme view', function (e, value) {
          if (writable) {
            write(value);
          } else {
            writable = true;
          }
        }, true);

        $scope.undoable = function (reverse) {
          var entries = load(historian, angular.fromJson);
          if (!angular.isArray(entries) || entries.length < 2) return;
          var index = parseInt(load(historianIndex));
          if (!angular.isNumber(index)) return;
          if (reverse) {
            if (index < 1) return;
            index--;
          } else {
            if (index >= entries.length - 1) return;
            index++;
          }
          return {
            entries: entries,
            index: index
          };
        };

        $scope.undo = function (reverse) {
          var undoable = $scope.undoable(reverse);
          if (!undoable) return;
          var entries = undoable.entries;
          var index = undoable.index;
          save(historianIndex, index);
          var latest = entries[index];
          if (!angular.isNumber(latest)) return;
          var object = load(historian + '.' + latest, parse);
          writable = false;
          var ref = $parse($attrs.historian)($scope);
          ref.length = 0;
          angular.extend(ref, object);
        };
      }
    };
  }
]);
