var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var Submission = require('../models/submission');
var Q = require('q');
var panic = require('../lib/panic');
var Status = require('../models/status');

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
    var form = req.query.form;
    if (form) {
      promise = makePromise(Form.findOne(
        /^[a-f0-9]{24}$/.test(form) ? { _id: form } : { slug: form }
      )).then(function (form) {
        if (!form) return;
        return { form: form._id };
      });
    } else {
      promise = Q({});
    }
    promise = promise.then(function (condition) {
      if (!condition) return [];
      var status = Status.findById(req.query.status);
      if (status) {
        condition.status = status.id;
      }
      return condition;
    }).then(function (condition) {
      return makePromise(Submission.find(condition).sort({ _id: -1 }).
        populate('form_revision'));
    });
  }
  promise.then(function (submissions) {
    if (!submissions) return next('not-found');
    res.send(submissions);
  }).catch(next);
});

router.put('/:submissionid([a-f0-9]{24})/status/:status([0-9]+)',
function (req, res, next) {
  var id = req.params.submissionid;
  var status = Status.findById(req.params.status);
  if (!status) {
    return next(panic(422, {
      type:    'invalid-status',
      message: 'Status does not exist.'
    }));
  }
  Q.nbind(Submission.findByIdAndUpdate, Submission)(id,
    { $set: { status: status.id } }).then(function (submission) {
      res.send({status: 'OK'});
    }).catch(next);
});

module.exports = router;
