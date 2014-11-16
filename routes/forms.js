var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var FormRevision = require('../models/form-revision');
var Manager = require('../models/manager');
var jsonParser = require('body-parser').json();
var Q = require('q');

router.get('/', function (req, res, next) {
  var manager = req.query.manager;
  var promise;

  if (manager) {
    promise = Manager.findOne({ username: manager }).populate('forms');
    promise = Q.nbind(promise.exec, promise)().then(function (manager) {
      if (!manager) return Q.resolve([]);
      return Q.nbind(Form.populate, Form)(manager.forms, {
        path: 'head',
        select: 'title'
      });
    });
  } else {
    promise = Form.find({}).sort({ _id: -1 }).skip(0).limit(20);
    promise = promise.populate('head', 'title');
    promise = Q.nbind(promise.exec, promise)();
  }
  promise.then(function (forms) {
    res.send(forms);
  }).catch(next)
});

router.post('/:formid/managers', jsonParser, function (req, res, next) {
  Form.updateManagers(
    req.params.formid,
    req.body
  ).then(function (form) {
    res.send(form);
  }).catch(next);
});

router.get('/:formid', function (req, res, next) {
  Form.findById(req.params.formid).populate('head').exec().
  then(function (revision) {
    if (!revision) return next('not-found');
    res.send(revision);
  }, next);
});

router.post('/create', jsonParser, function (req, res, next) {
  FormRevision.create(
    req.body.title,
    req.body.content,
    req.body.parent,
    req.body.slug
  ).then(function (revision) {
    res.send(revision.sanitize());
  }).catch(next);
});

module.exports = router;
