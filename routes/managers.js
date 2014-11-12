var express = require('express');
var router = express.Router();
var Manager = require('../models/manager');
var jsonParser = require('body-parser').json();
var panic = require('../lib/panic');

router.get('/status', function (req, res, next) {
  require('./token-auth')({
    model: 'Manager',
    returnPromise: true
  })(req).then(function () {
    res.send({status: 'OK'});
  }, function () {
    next(panic(200, {
      type:    'invalid-token',
      message: 'Invalid token.'
    }));
  });
});

router.post('/login', jsonParser, function (req, res, next) {
  Manager.authenticate(
    req.body.username,
    req.body.password
  ).then(function (user) {
    res.send({
      token: user.token
    });
  }).catch(function (err) {
    if (err.type === 'invalid-username' || err.type === 'invalid-password') {
      err = panic(403, {
        type:    'invalid-username-or-password',
        message: 'Either username or password is wrong.'
      });
    }
    next(err);
  });
});

module.exports = router;
