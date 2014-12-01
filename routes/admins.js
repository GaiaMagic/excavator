var express = require('express');
var router = express.Router();
var Admin = require('../models/admin');
var jsonParser = require('body-parser').json();
var panic = require('../lib/panic');
var tr = require('../lib/i18n').tr;
var Q = require('q');

var needsAdminAuth = require('./token-auth')({
  model: 'Admin'
});

router.post('/passwd', needsAdminAuth, jsonParser, function (req, res, next) {
  if (req.body.password && req.body.newpassword &&
      req.body.password === req.body.newpassword) {
    return next(panic(422, {
      type:    'password-unchanged',
      message: tr('New password should be different than the old one.')
    }));
  }
  Admin.authenticate(
    req.authorizedUser.username,
    req.body.password
  ).then(function (user) {
    user.password = req.body.newpassword;
    return Q.nbind(user.save, user)().then(function () {
      return user;
    });
  }).then(function (user) {
    res.send({
      token: user.token
    });
  }).catch(next);
});

// need no auth:

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
        message: tr('Either username or password is wrong.')
      });
    }
    next(err);
  });
});

module.exports = router;
