var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var bcrypt   = require('bcrypt');
var Q        = require('q');
var panic    = require('../lib/panic');

var MAX_ATTEMPTS = 5;
var LOCK_TIME = 2 * 60 * 60 * 1000;

var adminSchema = new Schema({
  username:       { type: String, unique: true, lowercase: 1 },
  password:       { type: String, select: false },
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

// don't want to use the validate methods,
// as it is hard to handle the error messages

// middleware:

adminSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    if (!this.isNew) {
      return next(panic(422, {
        type:    'username-is-unchangeable',
        message: 'Username is not allowed to change.'
      }));
    }

    if (typeof this.username !== 'string' || this.username.length === 0) {
      return next(panic(422, {
        type:    'username-is-required',
        message: 'Username is required.'
      }));
    }

    if (this.username.length < 3) {
      return next(panic(422, {
        type:    'username-is-too-short',
        message: 'Username is too short. It needs at least 3 characters.'
      }));
    }

    if (this.username.length > 20) {
      return next(panic(422, {
        type:    'username-is-too-long',
        message: 'Username is too long. Its length should not be over 20.'
      }));
    }

    if (!/^[a-z0-9_\-]{3,20}$/.test(this.username)) {
      return next(panic(422, {
        type:    'malformed-username',
        message: 'A username should include lowercase letters, numbers, ' +
                 'underscore or hyphen (dash).'
      }));
    }
  }

  if (this.isModified('password')) {
    if (typeof this.password !== 'string' || this.password.length === 0) {
      return next(panic(422, {
        type:    'password-is-required',
        message: 'Password is required.'
      }));
    }

    if (this.password.length < 6) {
      return next(panic(422, {
        type:    'password-is-too-short',
        message: 'Password is too short. It needs at least 6 characters.'
      }));
    }

    if (this.password.length > 50) {
      return next(panic(422, {
        type:    'password-is-too-long',
        message: 'Password is too long. Its length should not be over 50.'
      }));
    }

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

adminSchema.method('Save', function () {
  var deferred = Q.defer();
  var self = this;
  self.save(function (err) {
    if (err) {
      if (err.code === 11000) {
        err = panic(409, {
          type:    'username-has-been-taken',
          message: 'Username has been taken. Use another one.'
        });
      }
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
  var findOneCallback = function (err, user) {
    if (err || !user) {
      return deferred.reject(panic(422, {
        type:    'invalid-username',
        message: 'User does not exist.'
      }));
    }

    if (user.locked) {
      return deferred.reject(panic(429, {
        type:    'user-exceeds-max-login-attempts',
        message: 'User has been locked due to too many failed logins.'
      }));
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
          return deferred.reject(panic(500, {
            type:    'internal-server-error',
            message: 'Unexpected server error was encountered.'
          }));
        }
        deferred.reject(panic(403, {
          type:    'invalid-password',
          message: 'Password is wrong.'
        }));
      });
    }

    if (user.banned) {
      return deferred.reject(panic(403, {
        type:    'user-is-banned',
        message: 'User has been blocked by administrators.'
      }));
    }

    user.lock_until = undefined;
    user.login_attempts = 0;
    user.generateNewToken();
    user.save(function (err, user) {
      if (err) {
        return deferred.reject(panic(500, {
          type:    'internal-server-error',
          message: 'Unexpected server error was encountered.'
        }));
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
