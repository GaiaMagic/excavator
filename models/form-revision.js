var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var Q          = require('q');
var formSchema = require('./form');
var panic      = require('../lib/panic');
var tr         = require('../lib/i18n').tr;

var formRevisionSchema = new Schema({
  parent:      { type: Schema.ObjectId, ref: 'Form' },
  slug:        { type: String, trim: true },
  title:       { type: String, trim: true },

  // content should be a JSON string rather than an Object,
  // as the content may have variable data types which may
  // cause security troubles
  content:     { type: String },

  // cached calculated value
  submissions: { type: Number, default: 0 },

  created_at:  { type: Date, default: Date.now }
});

// basically we don't want these slugs to conflict with routes
var RESERVED_SLUGS = [
  'public',
  'control',
  'backend'
];

// don't want to use the validate methods,
// as it is hard to handle the error messages

// middleware:

formRevisionSchema.pre('save', function (next) {
  if (typeof this.slug === 'string' && this.slug.length === 0) {
    this.slug = undefined;
  }

  if (typeof this.slug !== 'undefined') {
    if (typeof this.slug !== 'string' || this.slug.length > 100) {
      return next(panic(422, {
        type:    'invalid-slug',
        message: tr('Slug should be a string with less than 100 characters.')
      }));
    }

    var slug = this.slug.trim();

    if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
      return next(panic(422, {
        type:    'malformed-slug',
        message: tr('Slug should contain letters, numbers or hyphen (dash).')
      }));
    }

    if (RESERVED_SLUGS.indexOf(slug) > -1) {
      return next(panic(409, {
        type:    'reserved-slug',
        message: tr('This slug is reserved for internal use only.')
      }));
    }
  }

  if (typeof this.title !== 'string' || this.title.length === 0) {
    return next(panic(422, {
      type:    'title-is-required',
      message: tr('Title is required.')
    }));
  }

  if (this.title.length > 100) {
    return next(panic(413, {
      type:    'title-is-too-long',
      message: tr('Title is too long. Its length should be less than 100.')
    }));
  }

  if (typeof this.content !== 'string' || this.content.length === 0) {
    return next(panic(422, {
      type:    'content-is-required',
      message: tr('Content is required.')
    }));
  }

  if (this.content.length > 10 * 1024) {
    return next(panic(413, {
      type:    'content-is-too-large',
      message: tr('Content is too large. Its length should be less than 10K.')
    }));
  }

  if (!this.isNew) {
    return next(panic(422, {
      type:    'revision-not-allowed-to-edit',
      message: tr('Revision should not be edited.')
    }));
  }

  if (this.isModified('content')) {
    try {
      var parsed = JSON.parse(this.content);
      if (typeof parsed !== 'object') {
        throw 'parsed JSON is not an object';
      }
      var keys = Object.keys(parsed);
      if (keys.length !== 1 || keys.toString() !== 'scheme') {
        return next(panic(422, {
          type:    'content-is-not-valid-json-only-scheme-allowed',
          message: tr('Content should be a valid JSON string ' +
            '(only scheme is allowed).')
        }));
      }
      this.content = JSON.stringify(parsed);
    } catch (e) {
      return next(panic(422, {
        type:    'content-is-not-valid-json',
        message: tr('Content should be a valid JSON string.')
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
    message: tr('Revision should not be deleted.')
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
 * @param  {string} slug    the page URI slug
 * @return {promise}        a promise is returned
 */
formRevisionSchema.static('create', function (title, content, parent, slug) {
  var self = this;
  var newrevision = new self({
    parent: parent,
    title: title,
    content: content,
    slug: slug
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
