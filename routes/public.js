var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var FormRevision = require('../models/form-revision');
var Submission = require('../models/submission');
var jsonParser = require('body-parser').json;
var Q = require('q');

router.get('/forms/:slug/:revid([a-f0-9]{24})?', function (req, res, next) {
  var revid = req.params.revid;
  var promise = Form.findOne({ slug: req.params.slug }).populate('head');
  var promises = [ Q.nbind(promise.exec, promise)() ];
  if (revid) {
    promises.push(Q.nbind(FormRevision.findById, FormRevision)(revid));
  }
  Q.all(promises).then(function (ret) {
    var form = ret[0];
    if (!form) return next('not-found');
    if (revid) {
      var formRev = ret[1];
      if (!formRev) return next('not-found');
      if (typeof form.toObject === 'function') form = form.toObject();
      if (typeof formRev.toObject === 'function') formRev = formRev.toObject();
      form.index = formRev;
    }
    res.send(form);
  }).catch(next);
});

router.post('/submit', jsonParser({
  limit: '1.5mb'
}), function (req, res, next) {
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
