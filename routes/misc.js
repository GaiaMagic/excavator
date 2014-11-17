var express = require('express');
var router = express.Router();
var STATUSES = require('../models/status');

router.get('/statuses', function (req, res, next) {
  res.send(STATUSES.filter(function (status) {
    return status.enabled;
  }));
});

router.all('*', function (req, res, next) {
  next('not-found');
});

module.exports = router;
