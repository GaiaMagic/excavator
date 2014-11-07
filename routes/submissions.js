var express = require('express');
var router = express.Router();
var Submission = require('../models/submission');
var jsonParser = require('body-parser').json();

router.get('/', function (req, res, next) {
  Submission.find({}).sort('-created_at').skip(0).limit(20).exec().
  then(function (submissions) {
    res.send(submissions);
  }, next);
});

router.get('/:submissionid', function (req, res, next) {
  Submission.findById(req.params.submissionid).exec().
  then(function (submission) {
    if (!submission) return next('not-found');
    res.send(submission);
  }, next);
});

router.post('/create', jsonParser, function (req, res, next) {
  Submission.submit(
    req.body.form,
    req.body.data
  ).then(function (submission) {
    res.send(submission);
  }).catch(next);
});

module.exports = router;
