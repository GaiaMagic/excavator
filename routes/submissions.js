var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var Submission = require('../models/submission');
var Q = require('q');
var panic = require('../lib/panic');
var Status = require('../models/status');
var tr = require('../lib/i18n').tr;

function makePromise (promise) {
  return Q.nbind(promise.exec, promise)();
}

router.get('/:submissionid([a-f0-9]{24})?', function (req, res, next) {
  var subid = req.params.submissionid;

  if (subid) {
    return makePromise(Submission.findById(subid).
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
      ]).spread(function (newer, older) {
        submission = submission.toObject();
        submission.newer = newer[0] ? newer[0]._id : null;
        submission.older = older[0] ? older[0]._id : null;
        return submission;
      });
    }).then(function (submission) {
      if (!submission) return next('not-found');
      res.send(submission);
    }).catch(next);
  }

  var page = +req.query.page || 1;
  if (page < 1) page = 1;
  var itemsPerPage = 10;
  var start = (page - 1) * itemsPerPage + 1;
  var end = page * itemsPerPage;

  Q.all([
    checkIfFormExists(req.query.form),
    Status.findById(req.query.status)
  ]).spread(function (form, status) {
    if (req.query.form && !form) return;
    if (req.query.status && !status) return;

    var condition = {};
    if (form) condition.form = form;
    if (status) condition.status = status.id;
    return condition;
  }).then(function (condition) {
    // return 0 results if no condition
    if (!condition || Object.keys(condition) === 0) {
      res.set('Content-Range', start + '-' + end + '/0');
      return [];
    }

    return Q.all([
      makePromise(Submission.find(condition).sort({ _id: -1 }).
        skip(start - 1).limit(itemsPerPage).populate('form_revision')),
      makePromise(Submission.count(condition))
    ]).spread(function (data, total) {
      var range = start + '-' + end + '/' + total;
      res.set('Content-Range', range);
      return data;
    });
  }).then(function (ret) {
    res.send(ret);
  }).catch(next);
});

function checkIfFormExists (slugOrId) {
  var query;
  if (/^[a-f0-9]{24}$/.test(slugOrId)) {
    query = { _id: slugOrId };
  } else {
    query = { slug: slugOrId };
  }
  return makePromise(Form.find(query).limit(1)).then(function (forms) {
    if (forms.length === 0) return;
    return forms[0]._id;
  });
}

router.put('/:submissionid([a-f0-9]{24})/status/:status([0-9]+)',
function (req, res, next) {
  var id = req.params.submissionid;
  var status = Status.findById(req.params.status);
  if (!status) {
    return next(panic(422, {
      type:    'invalid-status',
      message: tr('Status does not exist.')
    }));
  }
  Q.nbind(Submission.findByIdAndUpdate, Submission)(id,
    { $set: { status: status.id } }).then(function (submission) {
      res.send({status: 'OK'});
    }).catch(next);
});

module.exports = router;
