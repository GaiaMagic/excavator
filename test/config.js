module.exports = {
  testDBAddress: 'mongodb://localhost/excavatorTest',

  fixtures: {
    admin: {
      username: 'caiguanhao',
      password: 'cTHhHzCyNfeYv6KzyuGYAeaGoBHFVm8koTpLgERWLLMyWVmDo2'
    },
    form: {
      title: 'Music Festival Volunteer Application Form',
      content: '{"form":"test"}'
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
