var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var panic    = require('../lib/panic');
var Q        = require('q');
var extend   = require('extend');

var settingSchema = new Schema({
  settings: { type: Object }
});

settingSchema.pre('save', function (next) {
  if (this.isNew) {
    return this.constructor.count({}, function (err, count) {
      if (err) return next(err);
      if (count > 0) {
        return next(panic(409, {
          type:    'settings-should-be-more-than-one',
          message: 'Create more than one settings is not allowed.'
        }));
      }
      return next();
    });
  }
  return next();
});

settingSchema.pre('remove', function (next) {
  next(panic(422, {
    type:    'settings-not-allowed-to-delete',
    message: 'Settings should not be deleted.'
  }));
});

settingSchema.static('get', function () {
  var self = this;
  var deferred = Q.defer();

  self.findOne().exec(function (err, settings) {
    if (err || !settings) {
      var newsettings = new self();
      var def = Q.defer();
      newsettings.save(function (err) {
        if (err) {
          return def.reject(err);
        }
        def.resolve(newsettings);
      });
      return deferred.resolve(def.promise);
    }
    return deferred.resolve(settings);
  });

  return deferred.promise;
});

settingSchema.static('set', function (object) {
  return this.get().then(function (settings) {
    if (typeof object === 'object') {
      settings.settings = settings.settings || {};
      extend(true, settings.settings, object);
      var deferred = Q.defer();
      settings.save(function (err) {
        if (err) return deferred.reject(err);
        return deferred.resolve(settings);
      });
      return deferred.promise;
    }
    return settings;
  });
});

var model;

if (mongoose.models.Setting === undefined) {
  model = mongoose.model('Setting', settingSchema);
} else {
  model = mongoose.model('Setting');
}

module.exports = model;
