var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Q        = require('q');
var panic    = require('../lib/panic');
var Manager  = require('./manager');
var tr       = require('../lib/i18n').tr;

var formSchema = new Schema({
  published:   { type: Boolean, default: false },

  // slug is used for better URL, equal to form's _id if slug is empty
  slug:        { type: String, index: { unique: true }, trim: true },
  title:       { type: String, trim: true },

  // cached calculated value
  managers:    { type: Number, default: 0 },
  submissions: { type: Number, default: 0 },

  head:        { type: Schema.ObjectId, ref: 'FormRevision' },
  commits:     [ { type: Schema.ObjectId, ref: 'FormRevision' } ],
  created_at:  { type: Date, default: Date.now },
  updated_at:  { type: Date, default: Date.now }
});

formSchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = Date.now();
  }
  next();
});

/**
 * update managers' forms field
 * @param  {object}  operation  an object whose keys are managers' IDs, if the
 *                              value to the key is true, the form ID will be
 *                              added to the top of the manager's forms array;
 *                              if false, the form ID will be removed from the
 *                              array.
 * @return {promise}            a promise will be returned, if at least one
 *                              manager does not exist, it rejects immediately
 */
formSchema.method('updateManagers', function (operation) {
  var self = this;
  function valid (operation) {
    if (typeof operation !== 'object' || operation instanceof Array) {
      return false;
    }
    if (Object.keys(operation).length === 0) {
      return false;
    }
    return true;
  }
  if (!valid(operation)) {
    return Q.reject(panic(422, {
      type:    'invalid-operation',
      message: tr('Invalid operation.')
    }));
  }
  var keys = Object.keys(operation);
  var managerIDs = keys.map(function (managerID) {
    return Q.nbind(Manager.findById, Manager)(managerID);
  });
  return Q.allSettled(managerIDs).then(function (managers) {
    managers = managers.filter(function (manager) {
      return manager.state === 'fulfilled' && manager.value;
    }).map(function (manager) {
      return manager.value;
    });
    if (managers.length !== keys.length) {
      throw panic(422, {
        type:    'invalid-manager',
        message: tr('At least one manager does not exist.')
      });
    }
    return Q.all(managers.map(function (manager) {
      if (operation[manager._id] && manager.forms.indexOf(self._id) > -1) {
        return Q.resolve();
      }
      for (var j = manager.forms.length - 1; j > -1; j--) {
        if (manager.forms[j].equals(self._id)) {
          manager.forms.splice(j, 1);
        }
      }
      if (operation[manager._id]) {
        manager.forms.unshift(self._id);
      }
      return Q.nbind(manager.save, manager)();
    }));
  }).then(function () {
    return self.countManagers(true);
  }).then(function () {
    return self;
  });
});

formSchema.method('countManagers', function (save) {
  var self = this;
  var promise = Q.nbind(Manager.count, Manager)({ forms: this._id }).
  then(function (count) {
    self.managers = count;
  }).catch(function () {
    self.managers = 0;
  });
  return promise.then(function () {
    if (save) {
      return Q.nbind(self.save, self)();
    }
    return self;
  });
});

formSchema.method('applyTemplate', function (template) {
  var self = this;
  return Q.nbind(this.populate, this)('head').then(function (form) {
    var FormRevision = require('./form-revision');
    return FormRevision.create(
      form.head.title,
      form.head.content,
      form.head.parent,
      form.head.slug,
      template
    );
  });
});

formSchema.static('updateManagers', function (formID, managerIDs) {
  var deferred = Q.defer();
  this.findById(formID, function (err, form) {
    if (err) return deferred.reject(err);
    if (!form) return deferred.reject('not-found');
    deferred.resolve(form.updateManagers(managerIDs));
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
    form.title = revision.title;
    action = form;
  } else {
    action = new self({
      published: false,
      head: revision._id,
      commits: [ revision._id ]
    });
    action.slug = revision.slug || action._id;
    action.title = revision.title;
  }

  action.save(function (err) {
    if (err) {
      if (err.code === 11000) {
        err = panic(409, {
          type:    'slug-has-been-taken',
          message: tr('Slug has been taken. Use another one.')
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
