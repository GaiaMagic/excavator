var express = require('express');
var router = express.Router();
var Manager = require('../models/manager');
var Submission = require('../models/submission');
var jsonParser = require('body-parser').json();
var panic = require('../lib/panic');
var Q = require('q');
var Status = require('../models/status');
var tr = require('../lib/i18n').tr;

function makePromise (promise) {
  return Q.nbind(promise.exec, promise)();
}

var needsAdminAuth = require('./token-auth')({
  model: 'Admin'
});

router.get('/:manid([a-f0-9]{24})?', needsAdminAuth, function (req, res, next) {
  var promise;
  var manid = req.params.manid;
  if (manid) {
    promise = makePromise(Manager.findById(manid).
      populate([{path: 'forms', select: 'title'}]))
  } else {
    promise = makePromise(Manager.find({}).
      sort({ _id: -1 }).skip(0).limit(20));
  }
  promise.then(function (managers) {
    if (!managers) return next('not-found');
    res.send(managers);
  }).catch(next);
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

router.post('/:id([a-f0-9]{24})/forms', needsAdminAuth, jsonParser,
  function (req, res, next) {
    var forms = req.body;
    function checkForms (forms) {
      if (!(forms instanceof Array)) return false;
      if (forms.length === 0) return false;
      for (var i = 0; i < forms.length; i++) {
        if (typeof forms[i] !== 'string') {
          return false;
        }
        if (!/^[0-9a-f]{24}$/.test(forms[i])) {
          return false;
        }
      }
      return true;
    }
    Q().then(function () {
      if (!checkForms(forms)) {
        return Q.reject(panic(422, {
          type:    'invalid-form-id',
          message: tr('At least one form ID provided is not valid.')
        }));
      }
    }).then(function () {
      return Q.nbind(Manager.findById, Manager)(req.params.id);
    }).then(function (manager) {
      if (!manager) return next('not-found');
      var Form = require('../models/form');
      return Q.all(forms.map(function (form) {
        return makePromise(Form.find({ _id: form }, { _id: 1 }));
      })).then(function (forms) {
        return {
          manager: manager,
          forms: forms
        }
      });
    }).then(function (ret) {
      var manager = ret.manager;
      var forms = ret.forms;
      var newForms = [];
      for (var i = 0; i < forms.length; i++) {
        if (!forms[i][0] || !forms[i][0].id) {
          return Q.reject(panic(404, {
            type:    'form-does-not-exist',
            message: tr('At least one form does not exist.')
          }));
        }
        newForms.push(forms[i][0].id);
      }
      manager.forms = newForms;
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
        ]).spread(function (newer, older) {
          submission = submission.toObject();
          submission.newer = newer[0] ? newer[0]._id : null;
          submission.older = older[0] ? older[0]._id : null;
          return submission;
        });
      });
    }

    var page = +req.query.page || 1;
    if (page < 1) page = 1;
    var itemsPerPage = 10;
    var start = (page - 1) * itemsPerPage + 1;
    var end = page * itemsPerPage;

    var form = req.query.form;
    var inTheseForms;
    if (form) {
      if (manager.forms.indexOf(form) > -1) {
        inTheseForms = form;
      } else {
        res.set('Content-Range', start + '-' + end + '/0');
        return [];
      }
    } else {
      inTheseForms = { $in: manager.forms };
    }
    var find = { form: inTheseForms };
    var status = Status.findById(req.query.status);
    if (status) {
      find.status = status.id;
    } else if (req.query.status) {
      res.set('Content-Range', start + '-' + end + '/0');
      return [];
    }

    return Q.all([
      makePromise(Submission.find(find).sort({ _id: -1 }).
        skip(start - 1).limit(itemsPerPage).populate('form_revision')),
      makePromise(Submission.count(find))
    ]).spread(function (data, total) {
      var range = start + '-' + end + '/' + total;
      res.set('Content-Range', range);
      return data;
    });
  }).then(function (submissions) {
    if (!submissions) return next('not-found');
    res.send(submissions);
  }).catch(next);
});

router.put('/submissions/:submissionid([a-f0-9]{24})/status/:status([0-9]+)',
needsManagerAuth, function (req, res, next) {
  Q.nbind(Manager.findById, Manager)(req.authorizedUser.id).
  then(function (manager) {
    var id = req.params.submissionid;
    var status = Status.findById(req.params.status);
    if (!status) {
      return Q.reject(panic(422, {
        type:    'invalid-status',
        message: tr('Status does not exist.')
      }));
    }
    return Q.nbind(Submission.findOneAndUpdate, Submission)({
      _id: id, form: { $in: manager.forms }
    }, { $set: { status: status.id } });
  }).then(function (submission) {
    res.send({status: 'OK'});
  }).catch(next);
});

router.post('/passwd', needsManagerAuth, jsonParser, function (req, res, next) {
  if (req.body.password && req.body.newpassword &&
      req.body.password === req.body.newpassword) {
    return next(panic(422, {
      type:    'password-unchanged',
      message: tr('New password should be different than the old one.')
    }));
  }
  Manager.authenticate(
    req.authorizedUser.username,
    req.body.password
  ).then(function (user) {
    user.password = req.body.newpassword;
    return Q.nbind(user.save, user)().then(function () {
      return user;
    });
  }).then(function (user) {
    res.send({
      token: user.token
    });
  }).catch(next);
});

// need no auth:

router.get('/status', require('./token-auth').statusRoute('Manager'));

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
        message: tr('Either username or password is wrong.')
      });
    }
    next(err);
  });
});

module.exports = router;
