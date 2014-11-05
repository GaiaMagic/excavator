var express = require('express');
var router = express.Router();
var Admin = require('../models/admin');
var jsonParser = require('body-parser').json();

router.post('/login', jsonParser, function (req, res, next) {
  Admin.authenticate(
    req.body.username,
    req.body.password
  ).then(function (user) {
    res.send(user.sanitize());
  }).catch(next);
});

module.exports = router;
