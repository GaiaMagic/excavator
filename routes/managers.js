var express = require('express');
var router = express.Router();
var Manager = require('../models/manager');
var Submission = require('../models/submission');
var jsonParser = require('body-parser').json();
var panic = require('../lib/panic');
var Q = require('q');

var needsAdminAuth = require('./token-auth')({
  model: 'Admin'
});

router.get('/', needsAdminAuth, function (req, res, next) {
  Manager.find({}).sort('-created_at').skip(0).limit(20).exec().
  then(function (managers) {
    res.send(managers);
  }, next);
});

router.post('/', needsAdminAuth, jsonParser, function (req, res, next) {
  Manager.register(req.body.username, req.body.password).then(function (user) {
    res.send({status: 'OK'});
  }).catch(next);
});

router.delete('/:id([a-f0-9]{24})', needsAdminAuth, function (req, res, next) {
  Q.nbind(Manager.findById, Manager)(req.params.id).then(function (manager) {
    if (!manager) return next('not-found');
    return Q.nbind(manager.remove, manager)();
  }).then(function () {
    res.send({status: 'OK'});
  }).catch(next);
});

router.route('/:id([a-f0-9]{24})/ban').
  all(needsAdminAuth).
  delete(function (req, res, next) {
    Q.nbind(Manager.findById, Manager)(req.params.id).then(function (manager) {
      if (!manager) return next('not-found');
      manager.banned = false;
      return Q.nbind(manager.save, manager)();
    }).then(function () {
      res.send({status: 'OK'});
    }).catch(next);
  }).
  post(function (req, res, next) {
    Q.nbind(Manager.findById, Manager)(req.params.id).then(function (manager) {
      if (!manager) return next('not-found');
      manager.banned = true;
      return Q.nbind(manager.save, manager)();
    }).then(function () {
      res.send({status: 'OK'});
    }).catch(next);
  });

var needsManagerAuth = require('./token-auth')({
  model: 'Manager'
});

router.get('/submissions/:submissionid([a-f0-9]{24})?', needsManagerAuth,
function (req, res, next) {
  function makePromise (promise) {
    return Q.nbind(promise.exec, promise)();
  }

  Q.nbind(Manager.findById, Manager)(req.authorizedUser.id).
  then(function (manager) {
    var subid = req.params.submissionid;
    if (subid) {
      return makePromise(Submission.findOne({
        _id:  subid,
        form: { $in: manager.forms }
      }).populate('form form_revision')).then(function (submission) {
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
      return makePromise(Submission.find({
        form: { $in: manager.forms }
      }).sort({ _id: -1 }));
    }
  }).then(function (submissions) {
    if (!submissions) return next('not-found');
    res.send(submissions);
  }).catch(next);
});

// need no auth:

router.get('/status', function (req, res, next) {
  require('./token-auth')({
    model: 'Manager',
    returnPromise: true
  })(req).then(function (user) {
    res.send({status: 'OK', username: user.username});
  }).catch(function () {
    next(panic(200, {
      type:    'invalid-token',
      message: 'Invalid token.'
    }));
  });
});

router.post('/login', jsonParser, function (req, res, next) {
  Manager.authenticate(
    req.body.username,
    req.body.password
  ).then(function (user) {
    res.send({
      token: user.token
    });
  }).catch(function (err) {
    if (err.type === 'invalid-username' || err.type === 'invalid-password') {
      err = panic(403, {
        type:    'invalid-username-or-password',
        message: 'Either username or password is wrong.'
      });
    }
    next(err);
  });
});

module.exports = router;
