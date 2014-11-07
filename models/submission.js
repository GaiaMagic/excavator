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
