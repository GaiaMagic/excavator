var express = require('express');
var router = express.Router();
var formRevision = require('../models/form-revision');
var jsonParser = require('body-parser').json();

router.post('/create', jsonParser, function (req, res, next) {
  formRevision.create(
    req.body.title,
    req.body.content
  ).then(res.send).catch(next);
});

module.exports = router;
