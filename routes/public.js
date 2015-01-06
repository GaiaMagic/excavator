var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var FormRevision = require('../models/form-revision');
var Submission = require('../models/submission');
var Template = require('../models/template');
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
    return Q.nbind(form.head.populate, form.head)('template', 'files').
    then(function (head) {
      form.head = head;
      return form;
    }).then(function (form) {
      if (revid) {
        var formRev = ret[1];
        if (!formRev) return next('not-found');
        if (typeof form.toObject === 'function') form = form.toObject();
        if (typeof formRev.toObject === 'function') formRev = formRev.toObject();
        form.index = formRev;
      }
      res.send(form);
    });
  }).catch(next);
});

router.get('/templates/:tplid([a-f0-9]{24})', function (req, res, next) {
  var tplid = req.params.tplid;
  Q.nbind(Template.findById, Template)(tplid).then(function (tpl) {
    if (!tpl) return next('not-found');
    res.send(tpl);
  }).catch(next);
});

router.post('/submit', jsonParser({
  limit: '6.8mb'
}), function (req, res, next) {
  var ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  Submission.submit(
    req.body.form,
    req.body.data,
    ipAddr
  ).then(function (submission) {
    res.send(submission);
  }).catch(next);
});

router.all('*', function (req, res, next) {
  next('not-found');
});

module.exports = router;
