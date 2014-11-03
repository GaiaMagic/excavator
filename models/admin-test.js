var config   = require('../test/config');

var Q        = require('q');
var mongoose = require('mongoose');
var Admin    = require('./admin');

var real     = config.fixtures.admin;

var chai     = require('chai');
var expect   = chai.expect;

chai.should();

describe('Admin database model', function () {

  describe('On user registration', function () {
    before(function (done) {
      mongoose.connect(config.testDBAddress, function () {
        Admin.remove({}, done);
      });
    });

    function expectFailure (promise, done) {
      return promise.then(function (admin) {
        expect(admin).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.Object;
        expect(err.reason).to.equal('validation-failed');
      }).then(done).catch(done);
    }

    function repeat (string, n) {
      return Array(n + 1).join(string);
    }

    it('should fail to register with too short username', function (done) {
      expectFailure(Admin.register('sh', real.password), done);
    });

    it('should fail to register with too long username', function (done) {
      var longname = repeat(real.username, 10);
      expectFailure(Admin.register(longname, real.password), done);
    });

    it('should fail to register with too short password', function (done) {
      expectFailure(Admin.register(real.username, '123'), done);
    });

    it('should fail to register with too long password', function (done) {
      var longpass = repeat(real.password, 10);
      expectFailure(Admin.register(real.username, longpass), done);
    });

    it('should create a new valid admin user', function (done) {
      var newAdmin = Admin.register(real.username, real.password);
      newAdmin.then.should.be.a.Function;
      newAdmin.catch.should.be.a.Function;
      newAdmin.finally.should.be.a.Function;
      newAdmin.then(function (admin) {
        expect(admin).to.be.an.Object;
        expect(Object.keys(admin.schema.paths)).to.have.members([
          'username',
          'password',
          'token',
          'banned',
          'login_attempts',
          'lock_until',
          'created_at',
          'updated_at',
          '_id', '__v']);
        admin.created_at.should.be.a.Date;
        admin.updated_at.should.be.a.Date;
        expect(admin.token).to.be.a('string').and.have.length(64);
        expect(admin.login_attempts).to.equal(0);
        expect(admin.lock_until).to.be.undefined;
        expect(admin.banned).to.be.false;
        expect(admin.username).to.equal(real.username);
        expect(Admin.comparePassword(real.password, admin.password)).to.be.true;
      }).then(done).catch(done);
    });

    it('should fail if the username (w/ different case) has been registered',
    function (done) {
      var newAdmin = Admin.register(real.username.toLowerCase(), real.password);
      newAdmin.then(function (admin) {
        expect(admin).to.be.an.Object;
        newAdmin = Admin.register(real.username.toLowerCase(), real.password);
        return newAdmin;
      }).then(function (admin) {
        expect(admin).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.Object;
        expect(err.reason).to.equal('username-has-been-taken');
      }).then(function () {
        newAdmin = Admin.register(real.username.toUpperCase(), real.password);
        return newAdmin;
      }).then(function (admin) {
        expect(admin).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.Object;
        expect(err.reason).to.equal('username-has-been-taken');
      }).then(done).catch(done);
    });
  });


  describe('On user object properties', function () {
    before(function (done) {
      mongoose.connect(config.testDBAddress, function () {
        Admin.remove({}, done);
      });
    });

    afterEach(function (done) {
      Admin.remove({}, done);
    });

    it('should return a valid locked property', function (done) {
      Admin.register(real.username, real.password).then(function (admin) {
        expect(admin.locked).to.be.false;
        admin.lock_until = Date.now() + 60 * 1000;
        expect(admin.locked).to.be.true;
        admin.lock_until = Date.now() - 1000;
        expect(admin.locked).to.be.false;
      }).then(done).catch(done);
    });

    it('should return a 64-character-long token', function () {
      expect(Admin.generateNewToken()).to.be.a('string').and.have.length(64);
    });

    function expectFailure (promise, reason, done) {
      promise = promise.then(function (admin) {
        expect(admin).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.Object;
        expect(Object.keys(err)).to.have.members(['reason']);
        expect(err.reason).to.equal(reason);
      });
      if (done) promise = promise.then(done).catch(done);
      return promise;
    }

    it('should disallow changes on username', function (done) {
      Admin.register(real.username, real.password).then(function (admin) {
        return Admin.findById(admin._id).exec();
      }).then(function (admin) {
        admin.username = real.username + '-alias';
        return admin.Save();
      }).then(function (admin) {
        expect(admin).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.Object;
        expect(err.reason).to.equal('username-not-allowed-to-change');
      }).then(done).catch(done);
    });

    it('should have a different hash if user has changed password',
    function (done) {
      var oldhash;
      var newhash;
      var newpassword;
      Admin.register(real.username, real.password).then(function (admin) {
        oldhash = admin.password
        newpassword = real.password.toUpperCase();
        admin.password = newpassword;
        return admin.Save();
      }).then(function (admin) {
        newhash = admin.password;
        expect(newhash).to.not.equal(oldhash);
        expect(Admin.comparePassword(real.password, oldhash)).to.be.true;
        expect(Admin.comparePassword(newpassword, newhash)).to.be.true;
      }).then(done).catch(done);
    });
  });


  describe('On user login', function () {
    var newAdmin;

    before(function (done) {
      mongoose.connect(config.testDBAddress, function () {
        Admin.remove({}, done);
      });
    });

    beforeEach(function (done) {
      Admin.register(real.username, real.password).then(function (admin) {
        newAdmin = admin;
        done();
      }).catch(done);
    });

    afterEach(function (done) {
      Admin.remove({}, done);
    });

    function expectFailure (promise, reason, done) {
      promise = promise.then(function (admin) {
        expect(admin).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.Object;
        expect(Object.keys(err)).to.have.members(['reason']);
        expect(err.reason).to.equal(reason);
      });
      if (done) promise = promise.then(done).catch(done);
      return promise;
    }

    function expectFailureAndReturnLastestAdminInfo (promise, reason) {
      return expectFailure(promise, reason).then(function () {
        return returnLastestAdminInfo();
      });
    }

    function returnLastestAdminInfo () {
      var keys = '+login_attempts +lock_until';
      return Admin.findById(newAdmin._id, keys).exec();
    }

    it('should reject if user does not exist', function (done) {
      expectFailure(Admin.authenticate(real.username + '-real', real.password),
        'invalid-username', done);
    });

    it('should reject if password is wrong', function (done) {
      expectFailure(Admin.authenticate(real.username,
        real.password.toUpperCase()), 'invalid-password', done);
    });

    it('should reject if user is alreay locked', function (done) {
      newAdmin.lock_until = Date.now() + 60 * 1000;
      expect(newAdmin.locked).to.be.true;
      newAdmin.Save().then(function () {
        return expectFailure(Admin.authenticate(real.username,
          real.password), 'user-exceeds-max-login-attempts', done);
      });
    });

    it('should lock user if user have failed more than 5 times',
    function (done) {
      var promise = Q();
      for (var i = 1; i <= 6; i++) {
        promise = promise.then((function (index) {
          return function () {
            var password;
            var reason;
            if (index > 5) {
              // so it is STILL locked even if we use real password
              password = real.password;
              reason = 'user-exceeds-max-login-attempts';
            } else {
              // use wrong password so that it fails every time
              password = real.password.toUpperCase();
              reason = 'invalid-password';
            }
            return expectFailureAndReturnLastestAdminInfo(
                Admin.authenticate(
                  real.username,
                  password
                ),
                reason
              ).then(function (admin) {
              if (index >= 5) {
                expect(admin.login_attempts).to.equal(5);
                expect(admin.lock_until).to.be.a.Date;
                var timediff = (admin.lock_until - Date.now()) / 1000 / 3600;
                expect(Math.round(timediff)).to.equal(2);
              } else {
                expect(admin.login_attempts).to.equal(index);
                expect(admin.lock_until).to.be.undefined;
              }
            })
          }
        })(i));
      }
      promise.then(done).catch(done);;
    });

    it('should reject if the user is banned', function (done) {
      newAdmin.banned = true;
      newAdmin.Save().then(function () {
        return expectFailure(Admin.authenticate(real.username,
          real.password), 'user-is-banned', done);
      });
    });

    describe('should reset login attempts', function () {

      it('if user fails to login but the last-time failure was long time ago',
      function (done) {
        newAdmin.login_attempts = 8;
        newAdmin.lock_until = Date.now() - 60 * 1000;
        expect(newAdmin.locked).to.be.false;
        newAdmin.Save().then(function () {
          return expectFailureAndReturnLastestAdminInfo(
            Admin.authenticate(real.username, real.password.toUpperCase()),
            'invalid-password').then(function (admin) {
              expect(admin.login_attempts).to.equal(1);
              expect(admin.lock_until).to.be.undefined;
            });
        }).then(done).catch(done);
      });

      it('if user has logged in', function (done) {
        newAdmin.login_attempts = 8;
        newAdmin.lock_until = Date.now() - 60 * 1000;
        expect(newAdmin.locked).to.be.false;
        newAdmin.Save().then(function () {
          return Admin.authenticate(real.username, real.password);
        }).then(function () {
          return returnLastestAdminInfo();
        }).then(function (admin) {
          expect(admin.login_attempts).to.equal(0);
          expect(admin.lock_until).to.be.undefined;
        }).then(done).catch(done);
      });

    });

  });

});
