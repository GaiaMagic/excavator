var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q            = require('q');
var FormRevision = require('./form-revision');
var panic        = require('../lib/panic');
var undecorate   = require('../lib/decorate').undecorate;
var Schemes      = require('./schemes');
var tr           = require('../lib/i18n').tr;

var submissionSchema = new Schema({
  form:                { type: Schema.ObjectId, ref: 'Form' },
  form_index:          { type: Number, default: 0 },
  form_revision:       { type: Schema.ObjectId, ref: 'FormRevision' },
  form_revision_index: { type: Number, default: 0 },
  data:                { type: Object },
  status:              { type: Number, default: 0 },
  created_at:          { type: Date, default: Date.now }
});

submissionSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(panic(422, {
      type:    'submission-not-allowed-to-edit',
      message: tr('Submission should not be edited.')
    }));
  }

  var self = this;
  FormRevision.findById(this.form_revision).populate('parent').
  exec(function (err, formRev) {
    if (err || !formRev) return next(panic(422, {
      type:    'invalid-form',
      message: tr('The form is invalid.')
    }));
    self.form = formRev.parent._id;
    self.form_index = formRev.parent.submissions;
    self.form_revision_index = formRev.submissions;

    // validator
    try {
      var data = self.data;
      if (typeof data === 'string') data = JSON.parse(data);
      var content = JSON.parse(formRev.content);
      var schemes = content.scheme;
      var errorMsgs = [];
      for (var i = 0; i < schemes.length; i++) {
        var scheme = schemes[i];

        var serverScheme = Schemes[scheme.type];
        if (typeof serverScheme !== 'object') {
          errorMsgs.push(tr('Scheme "{{type}}" does not exist.', {
            type: scheme.type
          }));
          continue;
        }
        serverScheme = serverScheme[scheme.version];
        if (typeof serverScheme !== 'object') {
          errorMsgs.push(tr('Scheme "{{type}}" with version "{{version}}" ' +
            'does not exist.', {
              type: scheme.type,
              version: scheme.version
            }));
          continue;
        }

        var validator = serverScheme.validator;
        var validatorMessage = serverScheme.validatorMessage;

        if (typeof scheme.validator === 'string' && scheme.validator) {
          validator = undecorate(scheme.validator);
          if (typeof validator !== 'function') {
            validator = new Function('data', 'return ' + scheme.validator);
          }
        } else if (typeof scheme.validator === 'function') {
          validator = scheme.validator;
        }
        if (typeof validator !== 'function') {
          continue;
        }
        if (scheme.models instanceof Array) {
          var validation = validator.call({ tr: tr }, scheme, data);
          if (validation.result !== true) {
            errorMsgs = errorMsgs.concat(validation.errorMsgs);
          }
        } else {
          var sd = data[scheme.model];
          if (validator(sd) !== true) {
            validatorMessage = validatorMessage || scheme.validatorMessage;
            errorMsgs.push(tr('Item "{{label}}" should {{msg}}.', {
                label: scheme.label,
                msg: validatorMessage
              }));
          }
        }
      }
      if (errorMsgs.length > 0) {
        return next(panic(422, {
          type: 'valdation-failed',
          messages: errorMsgs
        }));
      }
    } catch (e) {
      return next(panic(422, {
        type: 'parse-error',
        message: tr('Unable to process data for now.')
      }));
    }

    next();
  });
});

submissionSchema.pre('remove', function (next) {
  next(panic(422, {
    type:    'submission-not-allowed-to-delete',
    message: tr('Submission should not be deleted.')
  }));
});

submissionSchema.post('save', function (submission) {
  var Submission = this.constructor;
  Submission.populate(submission, [
    { path: 'form' },
    { path: 'form_revision' }
  ], function (err, submission) {
    var op = { $inc: { submissions: 1 }};
    var log = function (err) {
      if (err) console.error(err);
    };
    submission.form.update(op, log);
    submission.form_revision.update(op, log);
  });
});

submissionSchema.method('Save', function () {
  var deferred = Q.defer();
  var self = this;
  self.save(function (err) {
    if (err) {
      if (!err.panic) {
        err = panic(500, {
          type:    'internal-server-error',
          message: tr('Unexpected server error was encountered.')
        });
      }
      return deferred.reject(err);
    }
    deferred.resolve(self);
  });
  return deferred.promise;
});

submissionSchema.static('submit', function (formRevId, data) {
  var self = this;
  var newsubmission = new self({
    form_revision: formRevId,
    data: data
  });
  var deferred = Q.defer();
  newsubmission.save(function (err) {
    if (err) {
      return deferred.reject(err);
    }
    deferred.resolve(newsubmission);
  });
  return deferred.promise;
});

var model;

if (mongoose.models.Submission === undefined) {
  model = mongoose.model('Submission', submissionSchema);
} else {
  model = mongoose.model('Submission');
}

module.exports = model;
