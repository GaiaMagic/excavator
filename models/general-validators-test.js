var expect = require('chai').expect;
var validators = require('./general-validators');
var tr = require('../lib/i18n').translate;
var validations = validators(tr);

var fixtures = {
  'chinese-mobile': {
    pass: [
     '13024113672',
     '13859850538',
     '18262450557',
     '18434343657',
     '18362936490',
     '13262374735',
     '13660167129',
     '18844135736',
     '13516450715'
    ],
    fail: [
     'abcdefghijk',
     '4008555788',
     '04293106058',
     '0103937258',
     '83534819',
     '1825878',
     '40011809737'
    ]
  },
  'phone-number': {
    pass: [
     '4008555788',
     '15666081574',
     '01012345678',
     '0757-01234567'
    ],
    fail: [
      'abc',
      '1'
    ]
  },
  'email-address': {
    pass: [
      'caiguanhao@gmail.com',
      '2@2',
      's.2.asd.s@my.edu.us'
    ],
    fail: [
      '2@',
      'abcdef',
      '@adsd',
      'http://google.com/'
    ]
  },
  'url': {
    // https://gist.github.com/dperini/729294#comment-972393
    pass: [
      'http://✪df.ws/123',
      'http://userid:password@example.com:8080',
      'http://userid:password@example.com:8080/',
      'http://userid@example.com',
      'http://userid@example.com/',
      'http://userid@example.com:8080',
      'http://userid@example.com:8080/',
      'http://userid:password@example.com',
      'http://userid:password@example.com/',
      'http://142.42.1.1/',
      'http://142.42.1.1:8080/',
      'http://➡.ws/䨹',
      'http://⌘.ws',
      'http://⌘.ws/',
      'http://foo.com/blah_(wikipedia)#cite-1',
      'http://foo.com/blah_(wikipedia)_blah#cite-1',
      'http://foo.com/unicode_(✪)_in_parens',
      'http://foo.com/(something)?after=parens',
      'http://☺.damowmow.com/',
      'http://code.google.com/events/#&product=browser',
      'http://j.mp',
      'ftp://foo.bar/baz',
      'http://foo.bar/?q=Test%20URL-encoded%20stuff',
      'http://مثال.إختبار',
      'http://例子.测试'
    ],
    fail: [
      'http://',
      'http://.',
      'http://..',
      'http://../',
      'http://?',
      'http://??',
      'http://??/',
      'http://#',
      'http://##',
      'http://##/',
      'http://foo.bar?q=Spaces should be encoded',
      '//',
      '//a',
      '///a',
      '///',
      'http:///a',
      'foo.com',
      'rdar://1234',
      'h://test',
      'http:// shouldfail.com',
      ':// should fail',
      'http://foo.bar/foo(bar)baz quux',
      'ftps://foo.bar/',
      'http://-error-.invalid/',
      'http://-a.b.co',
      'http://a.b-.co',
      'http://0.0.0.0',
      'http://10.1.1.0',
      'http://10.1.1.255',
      'http://224.1.1.1',
      'http://1.1.1.1.1',
      'http://123.123.123',
      'http://3628126748',
      'http://.www.foo.bar/',
      'http://www.foo.bar./',
      'http://.www.foo.bar./',
      'http://10.1.1.1',
      'http://10.1.1.254'
    ]
  },
  'credit-card': {
    pass: [
      '346782857373126', // American Express
      '30294590495829', // Diners Club
      '6011740262432631', // Discover
      '201480893905183', // enRoute
      '3337976041001677', // JCB
      '210076991159142', // JCB 15
      '5152014668932961', // MasterCard
      '4929583430561071', // Visa
      '4024007108380', // Visa 13
      '869998881344142', // Voyager
    ],
    fail: [
      '1234567890123',
      '3337976041001676',
      '4024007108381'
    ]
  },
  'resident-id': {
    pass: [
      '220104197402109038',
      '22010419770515723X',
      '220104198109227697',
      '220104198503112599',
      '220104199006246814',
      '22010419760811545X'
    ],
    fail: [
      'abcdefghijklmnopqr'
    ]
  }
}

function validate (expr, input) {
  return new Function('data', 'return ' + expr)(input);
}

describe('General validator', function () {
  validations.forEach(function (validation) {
    describe(validation.label, function () {
      if (typeof fixtures[validation.name] !== 'object') return;
      it('should pass tests for valid inputs', function () {
        fixtures[validation.name].pass.forEach(function (fixture) {
          expect(validate(validation.value, fixture)).to.be.true;
        });
      });
      it('should fail tests for invalid inputs', function () {
        fixtures[validation.name].fail.forEach(function (fixture) {
          expect(validate(validation.value, fixture)).to.be.false;
        });
      });
    });
  });
});
