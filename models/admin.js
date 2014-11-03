var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt   = require('bcrypt');
var Q        = require('q');

var MAX_ATTEMPTS = 5;
var LOCK_TIME = 2 * 60 * 60 * 1000;

var adminSchema = new Schema({
  username:       { type: String, required: true, unique: true, lowercase: 1 },
  password:       { type: String, required: true, select: false },
  token:          { type: String, unique: true },
  banned:         { type: Boolean, default: false },
  login_attempts: { type: Number, default: 0, select: false },
  lock_until:     { type: Number, select: false },
  created_at:     { type: Date, default: Date.now },
  updated_at:     { type: Date, default: Date.now }
});

// extra virtual keys:

adminSchema.virtual('locked').get(function () {
  return !!(this.lock_until && this.lock_until > Date.now());
});

// validations:

adminSchema.path('username').validate(function (value) {
  return /^[a-z0-9_\-]{3,20}$/.test(value);
}, 'A username should include lowercase letters, numbers, underscore or ' +
'hyphen, and its length must NOT be less than 3 or greater than 20.');

adminSchema.path('password').validate(function (value) {
  if (this.isModified('password')) {
    return value.length >= 6 && value.length <= 50;
  } else {
    return true;
  }
}, 'The length of a password must NOT be less than 6 or greater than 50.');

// middleware:

adminSchema.pre('save', function (next) {
  if (!this.isNew && this.isModified('username')) {
    var err = new Error('username is not allowed to change');
    err.name = 'UsernameUnchangeable';
    return next(err);
  }
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
  }
  next();
});

// methods:

adminSchema.method('comparePassword', function (passwordToCompare) {
  if (!this.password) {
    return false;
  }
  return this.constructor.comparePassword(passwordToCompare, this.password);
});

adminSchema.method('generateNewToken', function () {
  this.token = this.constructor.generateNewToken();
});

adminSchema.static('comparePassword', function (plaintext, hashed) {
  return bcrypt.compareSync(plaintext, hashed);
});

adminSchema.static('generateNewToken', function () {
  return require('crypto').randomBytes(32).toString('hex');
});

var errorCode2Reason = {
  11000: 'username-has-been-taken',
  'ValidationError': 'validation-failed',
  'UsernameUnchangeable': 'username-not-allowed-to-change'
};

adminSchema.method('Save', function () {
  var deferred = Q.defer();
  var self = this;
  self.save(function (err) {
    if (err) {
      var reason = errorCode2Reason[err.code || err.name] || err.name;
      return deferred.reject({
        reason: reason || 'unknown-error'
      });
    }
    deferred.resolve(self);
  });
  return deferred.promise;
});

adminSchema.static('register', function (username, password) {
  var self = this;
  var newuser = new self({
    username: username,
    password: password,
    token: self.generateNewToken()
  });
  return newuser.Save();
});

adminSchema.static('authenticate', function (username, password) {
  var deferred = Q.defer();
  var self = this;
  var query = { username: username };
  var selects = '+password +login_attempts +lock_until';
  var error = function (reason) {
    var err = new Error(reason);
    err.reason = reason;
    deferred.reject(err);
  };
  var findOneCallback = function (err, user) {
    if (err || !user) {
      return error('invalid-username');
    }

    if (user.locked) {
      return error('user-exceeds-max-login-attempts');
    }

    if (!user.comparePassword(password)) {
      var updateQuery;
      if (user.lock_until && user.lock_until < Date.now()) {
        updateQuery = {
          $set: { login_attempts: 1 },
          $unset: { lock_until: 1 }
        };
      } else {
        updateQuery = { $inc: { login_attempts: 1 } };
        if (user.login_attempts + 1 >= MAX_ATTEMPTS && !user.locked) {
          updateQuery.$set = {
            lock_until: Date.now() + LOCK_TIME,
            token: self.generateNewToken()
          };
        }
      }
      return user.update(updateQuery, function (err) {
        if (err) {
          return error('internal-server-error');
        }
        error('invalid-password');
      });
    }

    if (user.banned) {
      return error('user-is-banned');
    }

    user.lock_until = undefined;
    user.login_attempts = 0;
    user.generateNewToken();
    user.save(function (err, user) {
      if (err) {
        return error('internal-server-error');
      }

      deferred.resolve({
        user: user
      });
    });
  };

  self.findOne(query, selects, findOneCallback);

  return deferred.promise;
});

var model;

if (mongoose.models.Admin === undefined) {
  model = mongoose.model('Admin', adminSchema);
} else {
  model = mongoose.model('Admin');
}

module.exports = model;
