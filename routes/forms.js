var express = require('express');
var router = express.Router();
var FormRevision = require('../models/form-revision');
var jsonParser = require('body-parser').json();

router.post('/create', jsonParser, function (req, res, next) {
  FormRevision.create(
    req.body.title,
    req.body.content
  ).then(function (revision) {
    res.send(revision.sanitize());
  }).catch(next);
});

module.exports = router;
