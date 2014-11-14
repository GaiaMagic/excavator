var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var FormRevision = require('../models/form-revision');
var jsonParser = require('body-parser').json();

router.get('/', function (req, res, next) {
  Form.find({}).sort('-updated_at').skip(0).limit(20).
  populate('head', 'title').exec().
  then(function (revisions) {
    res.send(revisions);
  }, next);
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
