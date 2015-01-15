angular.module('excavator.shared.subs.filter', []).

service('shared.subs.filter', [
  '$location',
  '$routeParams',
  'func.scheme.parse',
  function (
    $location,
    $routeParams,
    parse
  ) {
    var self = this;

    this.operators = [
      'subs::filter::Equal / Include',    /* tr('subs::filter::Equal / Include')    */
      'subs::filter::Not Equal / Except'  /* tr('subs::filter::Not Equal / Except') */
    ];

    var allowedTypes = [
      'switch',
      'dropdown',
      'checkbox',
      'multiple-choice'
    ];

    this.setKeys = function (formContent) {
      var scheme = parse(formContent).scheme;
      for (var i = 0; i < scheme.length; i++) {
        var item = scheme[i];
        if (allowedTypes.indexOf(item.type) > -1) {
          this.indexes.push(i);
          this.keys.push(item.label || item.name);
          this.vals.push(item.enum);
        }
      }
    };

    this.init = function (formContent) {
      this.key = [];
      this.operator = [];
      this.val = [];

      this.indexes = [];
      this.keys = [];
      this.vals = [];

      this.setKeys(formContent);

      var k = $routeParams.k;
      var v = $routeParams.v;
      var o = $routeParams.o;

      if (k && v && o) {
        k = k.split(',');
        v = v.split(',');
        o = o.split(',');
        k = k.map(function (item) { return +item; });
        o = o.map(function (item) { return +item; });
        v = v.map(function (item) { return +item; });
        o.length = k.length;
        v.length = k.length;
        this.key = k;
        this.operator = o;
        this.val = v;
      }

      return this;
    };

    this.update = function () {
      if (this.key.length === 0) {
        return $location.search('k', null).search('o', null).search('v', null);
      }
      var keys = this.key.map(function (item) { return self.indexes[item]; });
      var operators = this.operator;
      var vals = this.val;
      $location.
        search('k', keys.join(',')).
        search('o', operators.join(',')).
        search('v', vals.join(','));
    };

    this.changeKey = function (index) {
      this.val[index] = 0;
    };

    this.add = function () {
      this.key.push(0);
      this.operator.push(0);
      this.changeKey(this.key.length - 1);
    };

    this.remove = function (index) {
      this.key.splice(index, 1);
      this.operator.splice(index, 1);
      this.val.splice(index, 1);
    };
  }
]);
