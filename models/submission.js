var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Q            = require('q');
var FormRevision = require('./form-revision');
var panic        = require('../lib/panic');

var submissionSchema = new Schema({
  form:          { type: Schema.ObjectId, ref: 'Form' },
  form_revision: { type: Schema.ObjectId, ref: 'FormRevision' },
  data:          { type: Object },
  created_at:    { type: Date, default: Date.now }
});

submissionSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(panic(422, {
      type:    'submission-not-allowed-to-edit',
      message: 'Submission should not be edited.'
    }));
  }

  var self = this;
  FormRevision.findById(this.form_revision, function (err, formRev) {
    if (err || !formRev) return next(panic(422, {
      type:    'invalid-form',
      message: 'The form is invalid.'
    }));
    self.form = formRev.parent;

    // validator
    try {
      var data = self.data;
      if (typeof data === 'string') data = JSON.parse(data);
      var content = JSON.parse(formRev.content);
      var schemes = content.scheme;
      var errorMsgs = [];
      for (var i = 0; i < schemes.length; i++) {
        var scheme = schemes[i];
        if (!scheme.validator) continue;
        var validator = new Function('data', 'return ' + scheme.validator);
        var sd = data[scheme.model];
        if (validator(sd) !== true) {
          errorMsgs.push('Item "' + scheme.label + '" should ' +
            scheme.validatorMessage + '.');
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
        message: 'Unable to process data for now.'
      }));
    }

    next();
  });
});

submissionSchema.pre('remove', function (next) {
  next(panic(422, {
    type:    'submission-not-allowed-to-delete',
    message: 'Submission should not be deleted.'
  }));
});

submissionSchema.method('Save', function () {
  var deferred = Q.defer();
  var self = this;
  self.save(function (err) {
    if (err) {
      if (!err.panic) {
        err = panic(500, {
          type:    'internal-server-error',
          message: 'Unexpected server error was encountered.'
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
