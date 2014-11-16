var express = require('express');
var router = express.Router();
var Submission = require('../models/submission');
var Q = require('q');

function makePromise (promise) {
  return Q.nbind(promise.exec, promise)();
}

router.get('/:submissionid([a-f0-9]{24})?', function (req, res, next) {
  var promise;
  var subid = req.params.submissionid;
  if (subid) {
    promise = makePromise(Submission.findById(subid).
    populate('form form_revision')).then(function (submission) {
      if (!submission) return;
      return Q.all([
        makePromise(Submission.find({
          _id:  { $gt: subid },
          form: submission.form._id
        }).sort({ _id: 1 }).limit(1).select('_id')),
        makePromise(Submission.find({
          _id:  { $lt: subid },
          form: submission.form._id
        }).sort({ _id: -1 }).limit(1).select('_id'))
      ]).then(function (ret) {
        submission = submission.toObject();
        submission.newer = ret[0][0] ? ret[0][0]._id : null;
        submission.older = ret[1][0] ? ret[1][0]._id : null;
        return submission;
      });
    });
  } else {
    promise = makePromise(Submission.find({}).
      sort({ _id: -1 }).populate('form_revision'));
  }
  promise.then(function (submissions) {
    if (!submissions) return next('not-found');
    res.send(submissions);
  }).catch(next);
});

module.exports = router;
