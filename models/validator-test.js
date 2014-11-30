var expect = require('chai').expect;
var validate = require('./validator');
var translate = require('../lib/i18n').translate;

describe('simple validator (one or zero argument)', function () {
  describe('should pass validation', function () {
    function expectPass (validator) {
      var errorMsgs = validate([{
        type: 'short-text',
        version: '1.0',
        model: 'name',
        label: 'Name',
        validator: validator,
        validatorMessage: "be a non-empty string"
      }], { name: 'Sam' });
      expect(errorMsgs).to.be.an('array').and.have.length(0);
    }

    it('if validator is an expression', function () {
      expectPass("typeof data === 'string' && data.length > 1");
    });

    it('if validator is a function', function () {
      expectPass(function (input) {
        return typeof input === 'string' && input.length > 1;
      });
    });

    it('if validator is a function string', function () {
      expectPass("function (input) { " +
        "return typeof input === 'string' && input.length > 1 }");
    });

    it('if validator is a function without argument', function () {
      expectPass("function () { return true }");
    });

    it('if validator is a function block', function () {
      expectPass("(function (input) { " +
        "return typeof input === 'string' && input.length > 1 })(data)");
    });

    it('if validator is a decorated function', function () {
      expectPass("/*__*FUNCTION*__*/\nfunction (input) { " +
        "return typeof input === 'string' && input.length > 1 " +
        "}\n/*__*FUNCTION*__*/");
    });

    it('if validator is true', function () {
      expectPass("true");
    });
  });

  describe('should fail validation', function () {
    function expectFail (validator, errs, scheme) {
      var errorMsgs = validate([scheme || {
        type: 'short-text',
        version: '1.0',
        model: 'name',
        label: 'Name',
        validator: validator,
        validatorMessage: "be a non-empty string"
      }], { name: 'Sam' }).map(function (msg) {
        return translate(msg.string, 'en', msg.context);
      });
      expect(errorMsgs).to.be.an('array').and.have.length(errs.length);
      for (var i = 0; i < errs.length; i++) {
        expect(errorMsgs[i]).to.be.equal(errs[i]);
      }
    }

    it('if scheme does not exist', function () {
      expectFail(undefined, ['Scheme "short-text-not-exist" does not exist.'], {
        type: 'short-text-not-exist',
        version: '1.0',
        model: 'name',
        label: 'Name',
        validator: 'true',
        validatorMessage: "be a non-empty string"
      });
    });

    it('if scheme version does not exist', function () {
      expectFail(undefined, ['Scheme "short-text" with version "0.0" ' +
        'does not exist.'], {
        type: 'short-text',
        version: '0.0',
        model: 'name',
        label: 'Name',
        validator: 'true',
        validatorMessage: "be a non-empty string"
      });
    });

    it('if validator contains infinite loop', function () {
      expectFail("(function (input) { while(true){}; return true })(data)",
        ['Timed out validating "Name". It may contain infinite loop.']);
    });

    it('if validator is false', function () {
      expectFail("false", ['Item "Name" should be a non-empty string.']);
    });

    it('if validator is 123', function () {
      expectFail("123", ['Item "Name" should be a non-empty string.']);
    });

    function expectInvalid (validator) {
      expectFail(validator, ['Unable to validate "Name".']);
    }

    it('if validator is an invalid string', function () {
      expectInvalid("invalid");
    });

    it('if validator is an invalid function', function () {
      expectInvalid("function");
      expectInvalid("function }{");
      expectInvalid("function {}");
    });

    it('if validator contains out-of-context things like console.log',
    function () {
      expectInvalid("console.log('die')");
      expectInvalid("function(){console.log('die');return false}");
    });

    it('if validator contains out-of-context things like require',
    function () {
      expectInvalid("require('fs')");
      expectInvalid("function(){require('fs');return false}");
    });
  });
});

describe('validator (two arguments)', function () {
  describe('should pass validation', function () {
    function expectPass (validator) {
      var errorMsgs = validate([{
        type: 'short-text',
        version: '1.0',
        model: 'name',
        label: 'Name',
        validator: validator,
        validatorMessage: "be a non-empty string"
      }], { name: 'Sam' });
      expect(errorMsgs).to.be.an('array').and.have.length(0);
    }

    it('if validator is a function', function () {
      expectPass(function (scheme, data) {
        var input = data[scheme.model];
        if (typeof input === 'string' && input.length > 1) {
          return { result: true };
        } else {
          return { result: false, errorMsgs: [ 'fail' ] };
        }
      });
    });

    it('if validator always has a this.tr function', function () {
      expectPass(function (scheme, data) {
        if (this.tr) {
          return { result: true };
        } else {
          return { result: false, errorMsgs: [ 'fail' ] };
        }
      });
    });

    it('even if validator has heavy calculations (no timeout)', function () {
      expectPass(function (scheme, data) {
        var s = '';
        for (var i = 0; i < 100000; i++) {
          s += i;
        }
        return { result: true };
      });
    });
  });

  describe('should fail validation', function () {
    function expectFail (validator, errs, scheme) {
      var errorMsgs = validate([scheme || {
        type: 'short-text',
        version: '1.0',
        model: 'name',
        label: 'Name',
        validator: validator,
        validatorMessage: "be a non-empty string"
      }], { name: 'Sam' }).map(function (msg) {
        return translate(msg.string, 'en', msg.context);
      });
      expect(errorMsgs).to.be.an('array').and.have.length(errs.length);
      for (var i = 0; i < errs.length; i++) {
        expect(errorMsgs[i]).to.be.equal(errs[i]);
      }
    }

    it('if validator returns true (not an object)', function () {
      expectFail(function (scheme, data) {
        return true;
      }, ['Unable to validate "Name".']);
    });

    it('if validator contains infinite loop', function () {
      expectFail(function (scheme, data) {
        while (true) {}
        var input = data[scheme.model];
        if (typeof input === 'string' && input.length > 1) {
          return { result: true };
        } else {
          return { result: false, errorMsgs: [ 'fail' ] };
        }
      }, ['Timed out validating "Name". It may contain infinite loop.']);
    });

    it('if validator contains infinite loop string', function () {
      expectFail("function (scheme, data) { while(true){}; return true }",
        ['Timed out validating "Name". It may contain infinite loop.']);
    });
  });
});
