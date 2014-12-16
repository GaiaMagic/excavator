var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var Q        = require('q');
var panic    = require('../lib/panic');
var tr       = require('../lib/i18n').tr;
var TYPES    = require('./tpl-types');

var templateSchema = new Schema({
  name:       { type: String                       },
  form:       { type: Schema.ObjectId, ref: 'Form' },
  files:      { type: Array                        },
  created_at: { type: Date, default: Date.now      },
  updated_at: { type: Date, default: Date.now      }
});

templateSchema.pre('save', function (next) {
  if (typeof this.name !== 'string' || this.name.length === 0) {
    return next(panic(422, {
      type:    'name-is-required',
      message: tr('Name is required.')
    }));
  }

  if (this.name.length > 50) {
    return next(panic(413, {
      type:    'name-is-too-long',
      message: tr('Name is too long. Its length should be less than 50.')
    }));
  }

  if (this.files instanceof Array && this.files.length > 0) {
    var pass = true;
    var allowedKeys = ['type', 'content'];
    var types = TYPES;
    for (var i = 0; i < this.files.length; i++) {
      if (typeof this.files[i] !== 'object') {
        pass = false;
        break;
      }
      var keys = Object.keys(this.files[i]);
      if (keys.length !== 2 ||
          allowedKeys.indexOf(keys[0]) === -1 ||
          allowedKeys.indexOf(keys[1]) === -1) {
        pass = false;
        break;
      }
      if (types.indexOf(this.files[i].type) === -1) {
        pass = false;
        break;
      }
    }
    if (!pass) {
      return next(panic(422, {
        type:    'invalid-files',
        message: tr('At least one file is invalid.')
      }));
    }
  }

  if (!this.isNew) {
    this.updated_at = Date.now();
  }
  next();
});

templateSchema.static('create', function (name, form, files) {
  if (form) {
    if (typeof form !== 'string' || !/^[0-9a-fA-F]{24}$/.test(form)) {
      return Q.reject(panic(422, {
        type:    'form-is-not-valid',
        message: tr('Form ID is invalid.')
      }));
    }
  }

  var self = this;
  var newtpl = new self({
    name: name,
    form: form,
    files: files
  });

  return Q.nbind(newtpl.save, newtpl)().then(function (ret) {
    return ret[0];
  });
});

var model;

if (mongoose.models.Template === undefined) {
  model = mongoose.model('Template', templateSchema);
} else {
  model = mongoose.model('Template');
}

module.exports = model;
