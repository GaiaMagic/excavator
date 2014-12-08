angular.module('excavator.shared.validator', []).

// this is a validator for front-end:
service('shared.validator', [
  'misc.bytes',
  'schemes',
  'i18n.translate',
  function (
    bytes,
    Schemes,
    tr
  ) {
    function $unsetError () {
      if (this.$error) this.$error = 0;
    }

    // since backend validator is hard to be emulated in web-browser,
    // so we will use a simple validator, though it may look like a mess
    this.validate = function (schemes, data) {
      var errors = 0;
      for (var i = 0; i < schemes.length; i++) {
        var scheme = schemes[i];
        scheme.$unsetError = $unsetError;
        var schemeData = data[scheme.model];
        var validator = scheme.validator;
        if (typeof validator === 'string' && validator) {
          try {
            validator = new Function('data', 'return ' + validator.trim());
          } catch (e) {}
        }
        if (typeof validator !== 'function') {
          validator = Schemes.get(scheme.type, scheme.version).validator;
        }
        if (typeof validator !== 'function') {
          continue;
        }
        var result = this.evaluate(validator, scheme, data);
        if (result !== true) {
          scheme.$error = true;
          errors++;
        }
      }
      return errors;
    };

    this.evaluate = function (func, scheme, data) {
      if (func.length <= 1) {
        var value = data[scheme.model];
        var ret = func(value);
        if (typeof ret === 'function') {
          return this.evaluate(ret, scheme, data);
        } else {
          return ret;
        }
      } else {
        var ret = func.call({tr: tr, bytes: bytes}, scheme, data);
        return ret.result;
      }
    };
  }
]);
