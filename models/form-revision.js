var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var Q          = require('q');
var formSchema = require('./form');

var formRevisionSchema = new Schema({
  parent:     { type: Schema.ObjectId, ref: 'Form' },
  title:      { type: String, required: true, trim: true },
  content:    { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// validations:

formRevisionSchema.path('title').validate(function(value) {
  return value.length <= 100;
}, 'title-is-too-long');

formRevisionSchema.path('content').validate(function(value) {
  return value.length <= 1024 * 10;
}, 'content-is-too-large');

// middleware:

formRevisionSchema.pre('save', function (next) {
  if (!this.isNew) {
    var err = new Error('revision should not be edited');
    err.reason = 'revision-not-allowed-to-edit';
    return next(err);
  }
  if (this.isModified('content')) {
    try {
      var parsed = JSON.parse(this.content);
      if (typeof parsed !== 'object') {
        throw 'parsed JSON is not an object';
      }
    } catch (e) {
      var err = new Error('content should be a JSON string');
      err.reason = 'content-is-not-valid-json';
      return next(err);
    }
  }
  var self = this;
  formSchema.FindById(this.parent).then(function (form) {
    // if the parent is there, add this revision to it
    // the third arg explicitly set to false to prevent infinite loop
    return formSchema.link(self, form, false);
  }, function () {
    // if the parent does not exist, create one
    // the third arg explicitly set to false to prevent infinite loop
    return formSchema.link(self, undefined, false);
  }).then(function (form) {
    next();
  }).catch(function (err) {
    next(err);
  });
});

formRevisionSchema.pre('remove', function (next) {
  var err = new Error('revision should not be deleted');
  err.reason = 'revision-not-allowed-to-delete';
  next(err);
});

// document methods:

formRevisionSchema.method('populateParent', function () {
  var deferred = Q.defer();
  this.populate('parent', function (err, form) {
    if (err) {
      return deferred.reject(err);
    }
    deferred.resolve(form);
  });
  return deferred.promise;
});

// static methods:

/**
 * create a form revision
 * @param  {string} title   the title of the form
 * @param  {string} content the JSON string content of the form
 * @param  {string} parent  the form id, create new if it does not exist,
 *                          for more info, you can see the 'save' middleware
 * @return {promise}        a promise is returned
 */
formRevisionSchema.static('create', function (title, content, parent) {
  var self = this;
  var newrevision = new self({
    parent: parent,
    title: title,
    content: content
  });

  var deferred = Q.defer();
  newrevision.save(function (err) {
    if (err) {
      if (err.name === 'ValidationError') {
        var errors = err.errors;
        var first = errors[Object.keys(errors)[0]];
        if (first.type === 'user defined') {
          err.reason = first.message;
        } else {
          err.reason = first.path + '-is-' + first.type;
        }
      }
      return deferred.reject(err);
    }
    deferred.resolve(newrevision);
  });
  return deferred.promise;
});

var model;

if (mongoose.models.FormRevision === undefined) {
  model = mongoose.model('FormRevision', formRevisionSchema);
} else {
  model = mongoose.model('FormRevision');
}

module.exports = model;
