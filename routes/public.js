var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var Submission = require('../models/submission');
var jsonParser = require('body-parser').json();

router.get('/forms/:formid', function (req, res, next) {
  Form.findById(req.params.formid).populate('head').exec().
  then(function (revision) {
    if (!revision) return next('not-found');
    res.send(revision);
  }, next);
});

router.post('/submit', jsonParser, function (req, res, next) {
  Submission.submit(
    req.body.form,
    req.body.data
  ).then(function (submission) {
    res.send(submission);
  }).catch(next);
});

router.all('*', function (req, res, next) {
  next('not-found');
});

module.exports = router;
