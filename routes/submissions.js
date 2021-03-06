var express = require('express');
var router = express.Router();
var Form = require('../models/form');
var Submission = require('../models/submission');
var Q = require('q');
var panic = require('../lib/panic');
var Status = require('../models/status');
var tr = require('../lib/i18n').tr;
var extend = require('extend');
var jsonParser = require('body-parser').json();

function QQ (promise) {
  return Q.nbind(promise.exec, promise)();
}

router.get('/:submissionid([a-f0-9]{24})?', function (req, res, next) {
  var subid = req.params.submissionid;

  if (subid) {
    return QQ(Submission.findById(subid).
    populate('form form_revision')).then(function (submission) {
      if (!submission) return;
      var condition = makeFilter(req, submission.form_revision.content);
      condition.form = submission.form._id;
      var newer = extend(true, {_id: { $gt: subid }}, condition);
      var older = extend(true, {_id: { $lt: subid }}, condition);
      return Q.all([
        QQ(Submission.find(newer).sort({ _id: 1 }).limit(1).select('_id')),
        QQ(Submission.find(older).sort({ _id: -1 }).limit(1).select('_id'))
      ]).spread(function (newer, older) {
        submission = submission.toObject();
        submission.newer = newer[0] ? newer[0]._id : null;
        submission.older = older[0] ? older[0]._id : null;
        return submission;
      });
    }).then(function (submission) {
      if (!submission) return next('not-found');
      res.send(submission);
    }).catch(next);
  }

  var page = +req.query.page || 1;
  if (page < 1) page = 1;
  var itemsPerPage = 10;
  var start = (page - 1) * itemsPerPage + 1;
  var end = page * itemsPerPage;

  Q.all([
    findForm(req.query.form),
    Status.findById(req.query.status)
  ]).spread(function (form, status) {
    if (req.query.form && !form) return;
    if (req.query.status && !status) return;

    var condition = form && form.head ? makeFilter(req, form.head.content) : {};
    if (form) condition.form = form._id;
    if (status) condition.status = status.id;
    return condition;
  }).then(function (condition) {
    // return 0 results if no condition
    if (!condition || Object.keys(condition) === 0) {
      res.set('Content-Range', start + '-' + end + '/0');
      return [];
    }

    return Q.all([
      QQ(Submission.find(condition).sort({ _id: -1 }).
        skip(start - 1).limit(itemsPerPage).populate('form_revision')),
      QQ(Submission.count(condition))
    ]).spread(function (data, total) {
      var range = start + '-' + end + '/' + total;
      res.set('Content-Range', range);
      return data;
    });
  }).then(function (ret) {
    res.send(ret);
  }).catch(next);
});

function makeFilter (req, formContent) {
  var condition = {};

  var k = req.query.k;
  var o = req.query.o;
  var v = req.query.v;
  if (k && o && v) {
    k = k.split(',');
    o = o.split(',');
    v = v.split(',');

    if (
      !k.every(function (i) { return /^[0-9]+$/.test(i); }) ||
      !o.every(function (i) { return /^[0-9]+$/.test(i); }) ||
      !v.every(function (i) { return /^[0-9]+$/.test(i); })
    ) {
      return condition;
    }

    try {
      var schemes = JSON.parse(formContent).scheme;
      for (var i = 0; i < k.length; i++) {
        var scheme = schemes[+k[i]];
        var val = {};
        switch (+o[i]) {
        case 1:
          val['$ne'] = scheme.enum[+v[i]];
          break;
        default:
          val['$eq'] = scheme.enum[+v[i]];
        }
        condition['data.' + scheme.model] = val;
      }
    } catch (e) {
      return condition;
    }
  }

  return condition;
}

function findForm (slugOrId) {
  var query;
  if (/^[a-f0-9]{24}$/.test(slugOrId)) {
    query = { _id: slugOrId };
  } else {
    query = { slug: slugOrId };
  }
  return QQ(Form.find(query).limit(1).populate('head')).
    then(function (forms) {
    if (forms.length === 0) return;
    return forms[0];
  });
}

router.put('/:submissionid([a-f0-9]{24})/status/:status([0-9]+)',
function (req, res, next) {
  var id = req.params.submissionid;
  var status = Status.findById(req.params.status);
  if (!status) {
    return next(panic(422, {
      type:    'invalid-status',
      message: tr('Status does not exist.')
    }));
  }
  Q.nbind(Submission.findByIdAndUpdate, Submission)(id,
    { $set: { status: status.id } }).then(function (submission) {
      res.send({status: 'OK'});
    }).catch(next);
});

router.post('/ip', jsonParser, function (req, res, next) {
  var subs = req.body.submissions;
  if (!(subs instanceof Array)) {
    return next(panic(422, {
      type:    'invalid-submissions',
      message: tr('Submissions should be an array.')
    }));
  }
  subs = subs.filter(function (sub) {
    return /^[a-f0-9]{24}$/.test(sub);
  });
  if (subs.length === 0) {
    return res.send({});
  }
  QQ(Submission.find({ _id: { $in: subs }})).
  then(function (subs) {
    return Q.allSettled(subs.map(function (sub) {
      return sub.getIPInfo().timeout(2000);
    })).then(function (bundle) {
      var ret = {};
      bundle.forEach(function (b) {
        if (b.state === 'fulfilled') {
          extend(ret, JSON.parse(JSON.stringify(b.value)));
        }
      });
      res.send(ret);
    });
  }).catch(next);
});

module.exports = router;
