module.exports = {
  testDBAddress: 'mongodb://localhost/excavatorTest',

  fixtures: {
    admin: {
      username: 'caiguanhao',
      password: 'cTHhHzCyNfeYv6KzyuGYAeaGoBHFVm8koTpLgERWLLMyWVmDo2',
      token: '313d4c51226c3ce901111e5dbfd82f645003435fb7856e0e18f29b84f437f1a1'
    },
    form: {
      slug: 'music-festival',
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
