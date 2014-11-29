var bytes = require('./bytes');
var expect = require('chai').expect;

describe('bytes function', function () {
  var tests;

  tests = {
    '1B': 1,
    '512B': 512,
    '1KB': 1024,
    '1.875 KB': 1920,
    '1 mB': Math.pow(1024, 2),
    '1  Gb': Math.pow(1024, 3),
    '1   tb': Math.pow(1024, 4),
    '1024 TB': Math.pow(1024, 5),
    '3.141 No': 3.141
  };

  for (var key in tests) {
    it('should return ' + tests[key] + ' if bytes is ' + key,
    (function (key, value) {
      return function (done) {
        expect(bytes(key)).to.equal(value);
        done();
      };
    })(key, tests[key]));
  }

  tests = {
    '1B': 1,
    '512B': 512,
    '1KB': 1024,
    '1.88KB': 1920,
    '1MB': Math.pow(1024, 2),
    '1GB': Math.pow(1024, 3),
    '1TB': Math.pow(1024, 4),
    '1024TB': Math.pow(1024, 5)
  };

  for (var key in tests) {
    it('should return ' + key + ' if bytes is ' + tests[key],
    (function (key, value) {
      return function (done) {
        expect(bytes(value)).to.equal(key);
        done();
      };
    })(key, tests[key]));
  }
});
