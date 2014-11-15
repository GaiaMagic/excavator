var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');
var Manager   = require('../models/manager');
var Form      = require('../models/form');
var FormRevision = require('../models/form-revision');
var Submission = require('../models/submission');
var Q         = require('q');

var real     = config.fixturesOf('manager', 'form');
var realA    = config.fixtures.admin;

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /backend/managers', function () {
  var realAdmin;
  var realManager;

  before(function (done) {
    if (mongoose.connection.db) {
      return createUser(done);
    }
    mongoose.connect(config.testDBAddress, createUser(done));

    function createUser (done) {
      Q.nbind(Admin.remove, Admin)({}).then(function () {
        return Q.nbind(Manager.remove, Manager)({});
      }).then(function () {
        return Q.nbind(Form.remove, Form)({});
      }).then(function () {
        return Q.nbind(FormRevision.remove, FormRevision)({});
      }).then(function () {
        return Q.nbind(Submission.remove, Submission)({});
      }).then(function () {
        return Admin.register(realA.username, realA.password);
      }).then(function (admin) {
        realAdmin = admin;
      }).then(function () {
        return Manager.register(real.username, real.password);
      }).then(function (manager) {
        realManager = manager;
      }).catch(done).finally(done);
    }
  });

  describe('Sub-route /', function () {
    it('should return a list of managers', function (done) {
      request(excavator).
      get('/backend/managers').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        expect(body).to.be.an('array');
        expect(body[0]).to.have.keys([
          '__v',
          '_id',
          'username',
          'token',
          'forms',
          'updated_at',
          'created_at',
          'banned'
        ]);
        done();
      });
    });

    it('should create a manager', function (done) {
      var promise;
      var username = real.username + 'test';
      promise = Q.nbind(Manager.remove, Manager)({ username: username });
      promise.then(function () {
        promise = request(excavator).
                  post('/backend/managers').
                  set('Authorization', 'token ' + realAdmin.token).
                  expect(422);
        return Q.nbind(promise.end, promise)();
      }).then(function () {
        promise = request(excavator).
                  post('/backend/managers').
                  send({ username: username, password: real.password }).
                  expect(403);
        return Q.nbind(promise.end, promise)();
      }).then(function () {
        var deferred = Q.defer();
        request(excavator).
        post('/backend/managers').
        send({ username: username, password: real.password }).
        set('Authorization', 'token ' + realAdmin.token).
        expect(200).
        end(function (err, res) {
          if (err) return deferred.reject(err);
          deferred.resolve(res);
        });
        return deferred.promise;
      }).then(function (res) {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(['status']);
        expect(res.body.status).to.equal('OK');
      }).then(done).catch(done);
    });
  });

  describe('Sub-route /:managerid', function () {
    var realManager;

    beforeEach(function (done) {
      var username = real.username + 'test';
      Q.nbind(Manager.remove, Manager)({username: username}).then(function () {
        return Manager.register(username, real.password);
      }).then(function (manager) {
        realManager = manager;
        done();
      }).catch(done);
    });

    it('should delete a manager', function (done) {
      request(excavator).
      delete('/backend/managers/' + realManager.id).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(['status']);
        expect(res.body.status).to.equal('OK');
        Manager.findById(realManager.id, function (err, manager) {
          if (err) return done(err);
          expect(manager).to.equal(null);
          done();
        });
      });
    });

    it('should ban a manager', function (done) {
      request(excavator).
      post('/backend/managers/' + realManager.id + '/ban').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(['status']);
        expect(res.body.status).to.equal('OK');
        Manager.findById(realManager.id, function (err, manager) {
          if (err) return done(err);
          expect(manager.banned).to.equal(true);
          done();
        });
      });
    });

    it('should unban a manager', function (done) {
      request(excavator).
      delete('/backend/managers/' + realManager.id + '/ban').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys(['status']);
        expect(res.body.status).to.equal('OK');
        Manager.findById(realManager.id, function (err, manager) {
          if (err) return done(err);
          expect(manager.banned).to.equal(false);
          done();
        });
      });
    });
  });

  describe('Sub-route /submissions', function () {
    function expectLength (length) {
      var deferred = Q.defer();
      request(excavator).
      get('/backend/managers/submissions').
      set('Authorization', 'token ' + realManager.token).
      expect(200).
      end(function (err, res) {
        if (err) return deferred.reject(err);
        var body = res.body;
        expect(body).to.be.an('array').and.have.length(length);
        deferred.resolve();
      });
      return deferred.promise;
    }

    it('should return only manager\'s submissions', function (done) {
      expectLength(0).then(function () {
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        return Submission.submit(form._id, real.submit);
      }).then(function (submission) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(submission.form, op);
      }).then(function () {
        return expectLength(1);
      }).then(function () {
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        return Submission.submit(form._id, real.submit);
      }).then(function (submission) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(submission.form, op);
      }).then(function () {
        return expectLength(2);
      }).then(done).catch(done);
    });
  });

  describe('Sub-route /status', function () {
    function expectFailure (token, done) {
      request(excavator).
      get('/backend/managers/status').
      set('Authorization', token).
      expect(200).
      end(function (err, res) {
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
      get('/backend/managers/status').
      set('Authorization', 'token ' + realManager.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(Object.keys(res.body)).to.have.members([
          'status',
          'username'
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
      post('/backend/managers/login').
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
      return Manager.heal(real.username).then(function () {});
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
        post('/backend/managers/login').
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
