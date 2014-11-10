var express = require('express');
var router = express.Router();
var Submission = require('../models/submission');

router.get('/', function (req, res, next) {
  Submission.find({}).sort('-created_at').skip(0).limit(20).
  populate('form_revision', 'title').exec().
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

module.exports = router;
