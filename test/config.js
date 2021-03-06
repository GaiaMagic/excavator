var form = {
  "scheme": [{
    "type": "short-text",
    "version": "1.0",
    "model": "fullname",
    "label": "Full Name",
    "placeholder": "Type your full name here.",
    "validator": "typeof data === \"string\" && " +
      "/[a-zA-Z\\u4e00-\\u9fff0-9]{1,100}/.test(data)",
    "validatorMessage": "include lowercase letters, uppercase letters, " +
      "Chinese characters, numbers and have 1-100 characters long"
  }]
};

var testDBAddress = require('../models').getAddress(undefined, 'excavatorTest');

module.exports = {
  testDBAddress: testDBAddress,

  fixtures: {
    admin: {
      username: 'caiguanhao',
      password: 'cTHhHzCyNfeYv6KzyuGYAeaGoBHFVm8koTpLgERWLLMyWVmDo2',
      token: '313d4c51226c3ce901111e5dbfd82f645003435fb7856e0e18f29b84f437f1a1'
    },
    manager: {
      username: 'iamamanager',
      password: 'QMeqhZk4rCyJFMtrbyUCGLbExgdFLZLJPnuTL6ztgW7JMbjWUY',
      token: 'fd4666d9f4e14766bc19b25420bffd58a533ececcf15787a1e3992cbe02e57b5'
    },
    form: {
      slug: 'music-festival',
      title: 'Music Festival Volunteer Application Form',
      content: JSON.stringify(form),
      submit: {
        fullname: 'fakename'
      }
    },
    template: {
      name: 'template-for-test',
      form: '548ead8beee943852a6e7499',
      files: [
        { type: 'text/css', content: 'body { margin: 0; padding: 0; }' },
        { type: 'text/javascript', content: '(function () { console.log("OK") })()' },
        { type: 'text/html', content: '<div>OK</div>' }
      ]
    }
  },

  fixturesOf: function () {
    var ret = {};
    for (var i = 0; i < arguments.length; i++) {
      var obj = module.exports.fixtures[arguments[i]];
      if (typeof obj !== 'object') continue;
      for (var key in obj) {
        ret[key] = obj[key];
      }
    }
    return ret;
  }
};
