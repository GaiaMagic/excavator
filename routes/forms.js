var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var FormRevision = require('../models/form-revision');
var jsonParser = require('body-parser').json();

router.get('/', function (req, res, next) {
  Form.find({}).sort('-updated_at').skip(0).limit(5).populate('head').exec().
  then(function (revisions) {
    res.send(revisions);
  }, next);
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
    req.body.content
  ).then(function (revision) {
    res.send(revision.sanitize());
  }).catch(next);
});

module.exports = router;
