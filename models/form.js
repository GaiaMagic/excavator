var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Q        = require('q');
var panic    = require('../lib/panic');
var Manager  = require('./manager');

var formSchema = new Schema({
  published:  { type: Boolean, default: false },

  // slug is used for better URL, equal to form's _id if slug is empty
  slug:       { type: String, index: { unique: true }, trim: true },

  head:       { type: Schema.ObjectId, ref: 'FormRevision' },
  commits:    [ { type: Schema.ObjectId, ref: 'FormRevision' } ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

formSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = Date.now();
  }
  next();
});

formSchema.method('addManager', function (managerID) {
  var self = this;
  var deferred = Q.defer();
  Manager.findById(managerID, function (err, manager) {
    if (err) return deferred.reject(err);
    if (!manager) return deferred.reject('not-found');
    for (var i = manager.forms.length - 1; i > -1; i--) {
      if (manager.forms[i].equals(self._id)) {
        manager.forms.splice(i, 1);
      }
    }
    manager.forms.unshift(self._id);
    manager.save(function (err) {
      if (err) return deferred.reject(err);
      deferred.resolve(manager);
    });
  });
  return deferred.promise;
});

formSchema.static('addManager', function (formID, managerID) {
  var deferred = Q.defer();
  this.findById(formID, function (err, form) {
    if (err) return deferred.reject(err);
    if (!form) return deferred.reject('not-found');
    deferred.resolve(form.addManager(managerID));
  });
  return deferred.promise;
});

formSchema.static('FindById', function (id) {
  var deferred = Q.defer();
  this.findById(id, function (err, form) {
    if (err) {
      return deferred.reject(err);
    }
    if (!form) {
      return deferred.reject('not-found');
    }
    deferred.resolve(form);
  });
  return deferred.promise;
});

/**
 * add a form revision to existing form
 * @param  {object} revision  the revision object you want to add
 * @param  {object} form      the target form object
 * @param  {bool}   hard      if true, revision object will also be saved,
 *                            you are not supposed to use this in pre-save
 *                            middleware, as this makes an infinite loop
 * @return {promise}          a promise is returned
 */
formSchema.static('link', function (revision, form, hard) {
  var deferred = Q.defer();
  var action;
  var self = this;
  if (form && form._id) {
    form.head = revision._id;
    form.commits.unshift(revision._id);
    form.slug = revision.slug || form._id;
    action = form;
  } else {
    action = new self({
      published: false,
      head: revision._id,
      commits: [ revision._id ]
    });
    action.slug = revision.slug || action._id;
  }

  action.save(function (err) {
    if (err) {
      if (err.code === 11000) {
        err = panic(409, {
          type:    'slug-has-been-taken',
          message: 'Slug has been taken. Use another one.'
        });
      }
      return deferred.reject(err);
    }
    revision.parent = action._id;
    if (hard) {
      revision.save(function (err) {
        if (err) {
          return deferred.reject(err);
        }
        deferred.resolve(action);
      });
    } else {
      deferred.resolve(action);
    }
  });
  return deferred.promise;
});

var model;

if (mongoose.models.Form === undefined) {
  model = mongoose.model('Form', formSchema);
} else {
  model = mongoose.model('Form');
}

module.exports = model;
