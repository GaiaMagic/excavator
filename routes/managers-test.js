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
  var realForm;
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
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        realForm = form;
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(form.parent, op);
      }).then(function (form) {
        return;
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

    it('should return details of a manager', function (done) {
      request(excavator).
      get('/backend/managers/' + realManager._id).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        expect(body).to.be.a('object');
        expect(body).to.have.keys([
          '__v',
          '_id',
          'username',
          'token',
          'forms',
          'updated_at',
          'created_at',
          'banned'
        ]);
        expect(body.forms).to.be.an('array');
        expect(body.forms[0]).to.have.keys([
          '_id',
          'title'
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

    describe('when updating forms', function () {
      function expectFailure (data, status, type, done) {
        request(excavator).
        post('/backend/managers/' + realManager.id + '/forms').
        set('Authorization', 'token ' + realAdmin.token).
        send(data).
        expect(status).
        end(function (err, res) {
          if (err) return done(err);
          if (type) {
            expect(res.body).to.have.keys([
              'status',
              'type',
              'message'
            ]);
            expect(res.body.type).to.equal(type);
          } else {
            expect(res.body).to.have.keys([
              'status'
            ]);
            expect(res.body.status).to.equal('OK');
          }
          done();
        });
      }

      it('should fail if form is invalid', function (done) {
        expectFailure([], 422, 'invalid-form-id', function () {
          expectFailure(undefined, 422, 'invalid-form-id', function () {
            expectFailure(['test'], 422, 'invalid-form-id', done);
          });
        });
      });

      it('should fail if form does not exist', function (done) {
        expectFailure([mongoose.Types.ObjectId()], 404,
          'form-does-not-exist', done);
      });

      it('should success if form is valid and existing', function (done) {
        expectFailure([realForm.parent], 200, undefined, done);
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
        if (length > 1) {
          expect(body[0].created_at).to.be.above(body[1].created_at);
        }
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
      }).delay(200).then(function (form) {
        return Submission.submit(form._id, real.submit);
      }).then(function (submission) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(submission.form, op);
      }).then(function () {
        return expectLength(2);
      }).then(done).catch(done);
    });

    it('should return manager submissions of a specific form', function (done) {
      function expectLength (form, length) {
        var deferred = Q.defer();
        request(excavator).
        get('/backend/managers/submissions?form=' + form).
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

      FormRevision.create(real.title, real.content).then(function (form) {
        return Submission.submit(form._id, real.submit);
      }).then(function (submission) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(submission.form, op);
      }).then(function (form) {
        return expectLength(form._id, 1);
      }).then(function (form) {
        return expectLength(mongoose.Types.ObjectId(), 0);
      }).then(done).catch(done);
    });

    it('should return manager submissions of a specific status',
    function (done) {
      function expectLength (status, length) {
        var deferred = Q.defer();
        request(excavator).
        get('/backend/managers/submissions?status=' + status).
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

      Q.nbind(Submission.remove, Submission)({}).then(function () {
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        return Submission.submit(form._id, real.submit);
      }).then(function (submission) {
        return Q.nbind(Submission.findByIdAndUpdate, Submission)(
          submission._id, { $set: { status: 2 } });
      }).then(function (submission) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(submission.form, op);
      }).then(function (form) {
        return expectLength(0, 0);
      }).then(function (form) {
        return expectLength(2, 1);
      }).then(done).catch(done);
    });

    function expectExistence (subid, status, reason, moreExpectations) {
      var deferred = Q.defer();
      request(excavator).
      get('/backend/managers/submissions/' + subid).
      set('Authorization', 'token ' + realManager.token).
      expect(status || 200).
      end(function (err, res) {
        if (err) return deferred.reject(err);
        var body = res.body;
        if (reason) {
          expect(body).to.be.an('object').and.have.keys([
            'status',
            'type',
            'message'
          ]);
          expect(body.type).to.equal(reason);
        } else {
          expect(body).to.be.an('object').and.have.keys([
            '__v', '_id',
            'created_at',
            'data',
            'form',
            'form_index',
            'form_revision',
            'form_revision_index',
            'status',
            'newer',
            'older'
          ]);
          if (typeof moreExpectations === 'function') moreExpectations(body);
        }
        deferred.resolve();
      });
      return deferred.promise;
    }

    it('should return only details of manager\'s submission', function (done) {
      var realForm;
      var realSub = [];
      Q.nbind(Submission.remove, Submission)({}).then(function () {
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(form.parent, op);
      }).then(function (form) {
        return Submission.submit(form.head, real.submit);
      }).then(function (submission) {
        realSub.push(submission._id.toString());
        function moreExpectations (body) {
          expect(body.older).to.be.null;
          expect(body.newer).to.be.null;
          expect(body.form_index).to.equal(0);
          expect(body.form_revision_index).to.equal(0);
        }
        return expectExistence(realSub[0], 200, undefined, moreExpectations);
      }).then(function () {
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        realForm = form;
        return Submission.submit(form._id, real.submit);
      }).then(function (submission) {
        realSub.push(submission._id.toString());
        return expectExistence(submission._id, 404, 'not-found');
      }).then(function (form) {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(realForm.parent, op);
      }).then(function () {
        return Submission.submit(realForm._id, real.submit);
      }).then(function (submission) {
        realSub.push(submission._id.toString());
      }).then(function () {
        // because newer and older is relative the same form,
        // and realSub[0] is in a different form, so older and
        // newer is still be null
        function moreExpectations (body) {
          expect(body.older).to.be.null;
          expect(body.newer).to.be.null;
          expect(body.form_index).to.equal(0);
          expect(body.form_revision_index).to.equal(0);
        }
        return expectExistence(realSub[0], 200, undefined, moreExpectations);
      }).then(function () {
        function moreExpectations (body) {
          expect(body.older).to.be.null;
          expect(body.newer).to.be.a('string').and.equal(realSub[2]);
          expect(body.form_index).to.equal(0);
          expect(body.form_revision_index).to.equal(0);
        }
        return expectExistence(realSub[1], 200, undefined, moreExpectations);
      }).then(function () {
        function moreExpectations (body) {
          expect(body.older).to.be.a('string').and.equal(realSub[1]);
          expect(body.newer).to.be.null;
          expect(body.form_index).to.equal(1);
          expect(body.form_revision_index).to.equal(1);
        }
        return expectExistence(realSub[2], 200, undefined, moreExpectations);
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
