var express    = require('express');
var router     = express.Router();
var Q          = require('q');
var Template   = require('../models/template');
var jsonParser = require('body-parser').json();
var textParser = require('body-parser').text;

function makePromise (promise) {
  return Q.nbind(promise.exec, promise)();
}

router.get('/:tplid([a-f0-9]{24})?', function (req, res, next) {
  var promise;
  var tplid = req.params.tplid;
  if (tplid) {
    promise = makePromise(Template.findById(tplid));
  } else {
    promise = makePromise(Template.find({}).select('-files').
      sort({ _id: -1}).skip(0).limit(30));
  }
  promise.then(function (templates) {
    if (!templates) return next('not-found');
    res.send(templates);
  }).catch(next);
});

router.post('/', jsonParser, function (req, res, next) {
  Template.create(req.body.name, req.body.form, req.body.files).
  then(function (tpl) {
    res.send(tpl);
  }).catch(next);
});

router.put('/:tplid([a-f0-9]{24})', jsonParser, function (req, res, next) {
  var tplid = req.params.tplid;
  Q.nbind(Template.findById, Template)(tplid).then(function (tpl) {
    tpl.name = req.body.name;
    tpl.files = req.body.files;
    tpl.form = req.body.form;
    return Q.nbind(tpl.save, tpl)().then(function () {
      return tpl;
    });
  }).then(function (tpl) {
    res.send(tpl);
  }).catch(next);
});

router.post('/upload', textParser({
  limit: '8mb'
}), function (req, res, next) {
  var saveImage = require('../lib/image').saveFileAsAdminContent;
  res.send(saveImage(req.body));
});

module.exports = router;
