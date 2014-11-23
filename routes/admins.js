var express = require('express');
var router = express.Router();
var Admin = require('../models/admin');
var jsonParser = require('body-parser').json();
var panic = require('../lib/panic');

router.get('/status', require('./token-auth').statusRoute('Admin'));

router.post('/login', jsonParser, function (req, res, next) {
  Admin.authenticate(
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
