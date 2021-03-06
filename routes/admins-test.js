var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');
var Q         = require('q');

var real     = config.fixtures.admin;

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /backend/admins', function () {
  var realAdmin;

  before(function (done) {
    if (mongoose.connection.db) {
      return createUser(done);
    }
    mongoose.connect(config.testDBAddress, createUser(done));

    function createUser (done) {
      Q.nbind(Admin.remove, Admin)({}).then(function () {
        return Admin.register(real.username, real.password);
      }).then(function (admin) {
        realAdmin = admin;
      }).catch(done).finally(done);
    }
  });

  describe('Sub-route /passwd', function () {
    it('should fail if old and new passwords are the same', function (done) {
      request(excavator).
      post('/backend/admins/passwd').
      set('Authorization', 'token ' + realAdmin.token).
      send({ password: real.password, newpassword: real.password }).
      expect(422).
      end(function (err, res) {
        if (err) return done(err);
        expect(Object.keys(res.body)).to.have.members([
          'status',
          'type',
          'message'
        ]);
        expect(res.body.type).to.equal('password-unchanged');
        done();
      });
    });

    it('should allow admin to change the password', function (done) {
      request(excavator).
      post('/backend/admins/passwd').
      send({ password: real.password, newpassword: 'newpassword' }).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys([
          'token'
        ]);
        realAdmin.token = res.body.token;

        request(excavator).
        post('/backend/admins/login').
        send({ username: real.username, password: real.password }).
        expect(403).end(function (err, res) {
          if (err) return done(err);

          request(excavator).
          post('/backend/admins/login').
          send({ username: real.username, password: 'newpassword' }).
          expect(200).end(function (err, res) {
            if (err) return done(err);
            realAdmin.token = res.body.token;

            request(excavator).
            post('/backend/admins/passwd').
            send({ password: 'newpassword', newpassword: real.password }).
            set('Authorization', 'token ' + realAdmin.token).
            expect(200).
            end(function (err, res) {
              if (err) return done(err);
              expect(res.body).to.have.keys([
                'token'
              ]);
              realAdmin.token = res.body.token;
              done();
            });
          });
        });
      });
    });
  });

  describe('Sub-route /status', function () {
    function expectFailure (token, done) {
      var req = request(excavator).get('/backend/admins/status');
      if (typeof token !== 'undefined') {
        req = req.set('Authorization', token);
      }
      req.expect(200).end(function (err, res) {
        if (err) return done(err);
        expect(Object.keys(res.body)).to.have.members([
          'status',
          'type',
          'message'
        ]);
        expect(res.body.type).to.equal('invalid-token');
        done();
      });
    }

    it('should return forbidden if token is undefined', function (done) {
      expectFailure(undefined, done);
    });

    it('should return forbidden if there is no token', function (done) {
      expectFailure('token', done);
    });

    it('should return forbidden if the token is not valid', function (done) {
      expectFailure('token ' + real.token, done);
    });

    it('should return OK if the token is valid', function (done) {
      request(excavator).
      get('/backend/admins/status').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys([
          'status',
          'username',
          'domains'
        ]);
        expect(res.body.status).to.equal('OK');
        expect(res.body.username).to.equal(real.username);
        done();
      });
    });
  });

  describe('Sub-route /login', function () {
    function expectFailure (data, status, type) {
      var deferred = Q.defer();
      request(excavator).
      post('/backend/admins/login').
      send(data).
      expect(status || 403).
      end(function (err, res) {
        if (err) return deferred.reject(err);
        try {
          expect(Object.keys(res.body)).to.have.members([
            'status',
            'type',
            'message'
          ]);
          expect(res.body.type).to.
            equal(type || 'invalid-username-or-password');
        } catch (err) {
          deferred.reject(err);
        }
        deferred.resolve();
      });
      return deferred.promise;
    }

    function heal () {
      // heal the user so this test won't affect others
      return Admin.heal(real.username).then(function () {});
    }

    describe('should return invalid-username-or-password', function () {
      it('if username is not provided', function (done) {
        expectFailure({ password: real.password }).
          then(heal).then(done).catch(done);
      });

      it('if password is not provided', function (done) {
        expectFailure({ username: real.username }).
          then(heal).then(done).catch(done);
      });

      it('if username does not exist', function (done) {
        expectFailure({
          username: real.username + '-fake',
          password: real.password
        }).then(heal).then(done).catch(done);
      });

      it('if password is wrong', function (done) {
        expectFailure({
          username: real.username,
          password: real.password + '-wrong'
        }).then(heal).then(done).catch(done);
      });
    });

    describe('should return user-exceeds-max-login-attempts', function () {
      it('if user has entered wrong passwords for 5 times', function (done) {
        var promise = Q();
        var data = {
          username: real.username,
          password: real.password + '-wrong'
        };
        for (var i = 0; i < 6; i++) {
          promise = promise.then((function (i) {
            return function () {
              if (i === 5) {
                return expectFailure(data, 429,
                  'user-exceeds-max-login-attempts');
              }
              return expectFailure(data);
            };
          })(i));
        }
        promise.then(heal).then(done).catch(done);
      });
    });

    describe('should only return a token', function () {
      it('if user succcessfully logged in', function (done) {
        request(excavator).
        post('/backend/admins/login').
        send({ username: real.username, password: real.password }).
        expect(200).
        end(function (err, res) {
          if (err) return done(err);
          expect(Object.keys(res.body)).to.have.members([
            'token'
          ]);
          expect(res.body.token).to.be.a('string').and.have.length(64);
          done();
        });
      })
    });
  });
});
