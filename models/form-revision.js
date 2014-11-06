var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var Q          = require('q');
var formSchema = require('./form');
var panic      = require('../lib/panic');

var formRevisionSchema = new Schema({
  parent:     { type: Schema.ObjectId, ref: 'Form' },
  title:      { type: String, trim: true },
  content:    { type: String },
  created_at: { type: Date, default: Date.now }
});

// don't want to use the validate methods,
// as it is hard to handle the error messages

// middleware:

formRevisionSchema.pre('save', function (next) {
  if (typeof this.title !== 'string' || this.title.length === 0) {
    return next(panic(422, {
      type:    'title-is-required',
      message: 'Title is required.'
    }));
  }

  if (this.title.length > 100) {
    return next(panic(413, {
      type:    'title-is-too-long',
      message: 'Title is too long. Its length should be less than 100.'
    }));
  }

  if (typeof this.content !== 'string' || this.content.length === 0) {
    return next(panic(422, {
      type:    'content-is-required',
      message: 'Content is required.'
    }));
  }

  if (this.content.length > 10 * 1024) {
    return next(panic(413, {
      type:    'content-is-too-large',
      message: 'Content is too large. Its length should be less than 10K.'
    }));
  }

  if (!this.isNew) {
    return next(panic(422, {
      type:    'revision-not-allowed-to-edit',
      message: 'Revision should not be edited.'
    }));
  }

  if (this.isModified('content')) {
    try {
      var parsed = JSON.parse(this.content);
      if (typeof parsed !== 'object') {
        throw 'parsed JSON is not an object';
      }
      this.content = JSON.stringify(parsed);
    } catch (e) {
      return next(panic(422, {
        type:    'content-is-not-valid-json',
        message: 'Content should be a valid JSON string.'
      }));
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
  next(panic(422, {
    type:    'revision-not-allowed-to-delete',
    message: 'Revision should not be deleted.'
  }));
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

formRevisionSchema.method('sanitize', function () {
  return {
    parent:     this.parent,
    title:      this.title,
    content:    this.content,
    created_at: this.created_at
  };
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
