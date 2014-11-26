var expect = require('chai').expect;
var i18n = require('./i18n');

var libtimeago = require('./timeago');

function timeago (/* arguments */) {
  var ret = libtimeago.apply({ tr: i18n.tr }, arguments);
  if (typeof ret === 'object') {
    return i18n.translate(ret.string, 'en', ret.context);
  }
  return i18n.translate(ret, 'en');
}

function padding (expected) {
  return expected + new Array(15 - expected.length).join(' ');
}

function formatDate (input) {
  var ret = new Date(input).toJSON();
  return ret.replace('T', ' ').replace(/\..*$/, '');
}

var now = +new Date;
describe('if time now is ' + formatDate(now) + ', time-ago', function () {
  var tests = {
    'just now':       now,
    'just now.2':     now - 1000 * 9,
    '10 seconds ago': now - 1000 * 10,
    '59 seconds ago': now - 1000 * 59,
    '1 minute ago':   now - 1000 * 60 * 1,
    '2 minutes ago':  now - 1000 * 60 * 2,
    '59 minutes ago': now - 1000 * 60 * 59,
    '1 hour ago':     now - 1000 * 60 * 60 * 1,
    '2 hours ago':    now - 1000 * 60 * 60 * 2,
    '12 hours ago':   now - 1000 * 60 * 60 * 12,
    '23 hours ago':   now - 1000 * 60 * 60 * 23,
    '1 day ago':      now - 1000 * 60 * 60 * 24 * 1,
    '2 days ago':     now - 1000 * 60 * 60 * 24 * 2,
    '6 days ago':     now - 1000 * 60 * 60 * 24 * 6,
    '1 week ago':     now - 1000 * 60 * 60 * 24 * 7 * 1,
    '2 weeks ago':    now - 1000 * 60 * 60 * 24 * 7 * 2,
    '4 weeks ago':    now - 1000 * 60 * 60 * 24 * 7 * 4,
    '1 month ago':    now - 1000 * 60 * 60 * 24 * 7 * 5,
    '2 months ago':   now - 1000 * 60 * 60 * 24 * 30 * 2,
    '11 months ago':  now - 1000 * 60 * 60 * 24 * 30 * 11,
    '12 months ago':  now - 1000 * 60 * 60 * 24 * 30 * 12,
    '1 year ago':     now - 1000 * 60 * 60 * 24 * 365 * 1,
    '2 years ago':    now - 1000 * 60 * 60 * 24 * 365 * 2,
    '99 years ago':   now - 1000 * 60 * 60 * 24 * 365 * 99
  };

  for (var key in tests) {
    var expected = key.replace(/\..*$/, '');
    it('should return ' + padding(expected) + ' if time is ' +
    formatDate(tests[key]), (function (key, expected) {
      return function (done) {
        expect(timeago(tests[key])).to.equal(expected);
        done();
      };
    })(key, expected));
  }
});
