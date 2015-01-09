var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');
var Form = require('../models/form');
var FormRevision = require('../models/form-revision');
var Submission = require('../models/submission');
var Q         = require('q');

var real      = config.fixturesOf('admin', 'form');

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /backend/submissions', function () {
  var realAdmin;
  var realForm;
  var realSubmission;
  var realSubmission2;

  before(function (done) {
    if (mongoose.connection.db) {
      return createUser(done);
    }
    mongoose.connect(config.testDBAddress, createUser(done));

    function createUser (done) {
      Q.nbind(Admin.remove, Admin)({}).then(function () {
        return Q.nbind(Form.remove, Form)({});
      }).then(function () {
        return Q.nbind(FormRevision.remove, FormRevision)({});
      }).then(function () {
        return Q.nbind(Submission.remove, Submission)({});
      }).then(function () {
        return Admin.register(real.username, real.password);
      }).then(function (admin) {
        realAdmin = admin;
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        realForm = form;
      }).then(function () {
        return Submission.submit(realForm._id, real.submit);
      }).delay(100).then(function (submission) {
        return Q.nbind(Submission.findByIdAndUpdate, Submission)(
          submission._id, { $set: { status: 1 } });
      }).then(function (submission) {
        realSubmission = submission;
        return Submission.submit(realForm._id, real.submit);
      }).then(function (submission) {
        return Q.nbind(Submission.findByIdAndUpdate, Submission)(
          submission._id, { $set: { status: 2 } });
      }).then(function (submission) {
        realSubmission2 = submission;
      }).catch(done).finally(done);
    }
  });

  describe('Sub-route /', function () {
    it('should list submissions', function (done) {
      request(excavator).
      get('/backend/submissions').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('array').and.have.length(2);
        expect(res.body[0].created_at).to.be.above(res.body[1].created_at);
        expect(res.headers['content-range']).to.equal('1-10/2');
        done();
      });
    });

    it('should list submissions of a specific form', function (done) {
      function expectLength (form, length) {
        var deferred = Q.defer();
        request(excavator).
        get('/backend/submissions?form=' + form).
        set('Authorization', 'token ' + realAdmin.token).
        expect(200).
        end(function (err, res) {
          if (err) return deferred.reject(err);
          var body = res.body;
          expect(body).to.be.an('array').and.have.length(length);
          expect(res.headers['content-range']).to.equal('1-10/' + length);
          deferred.resolve();
        });
        return deferred.promise;
      }

      expectLength(mongoose.Types.ObjectId(), 0).then(function () {
        return expectLength(realForm.parent, 2);
      }).then(done).catch(done);
    });

    it('should list submissions of a specific status', function (done) {
      function expectLength (status, length) {
        var deferred = Q.defer();
        request(excavator).
        get('/backend/submissions?status=' + status).
        set('Authorization', 'token ' + realAdmin.token).
        expect(200).
        end(function (err, res) {
          if (err) return deferred.reject(err);
          var body = res.body;
          expect(body).to.be.an('array').and.have.length(length);
          deferred.resolve();
        });
        return deferred.promise;
      }

      expectLength(0, 0).then(function () {
        return expectLength(1, 0); // 1 is not enabled yet, so no results
      }).then(function () {
        return expectLength(2, 1);
      }).then(done).catch(done);
    });
  });

  describe('Sub-route /:submissionid', function () {
    it('should return 404 if submissionid in invalid', function (done) {
      request(excavator).
      get('/backend/submissions/invalidsubmissionid').
      set('Authorization', 'token ' + realAdmin.token).
      expect(404).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys([
          'status',
          'type',
          'message'
        ]);
        expect(res.body.type).to.equal('not-found');
        done();
      });
    });

    it('should return 404 if submissionid does not exist', function (done) {
      request(excavator).
      get('/backend/submissions/' + mongoose.Types.ObjectId()).
      set('Authorization', 'token ' + realAdmin.token).
      expect(404).
      end(function (err, res) {
        if (err) return done(err);
        expect(Object.keys(res.body)).to.have.members([
          'status',
          'type',
          'message'
        ]);
        expect(res.body.type).to.equal('not-found');
        done();
      });
    });

    function check (id, moreExpectations) {
      var deferred = Q.defer();
      request(excavator).
      get('/backend/submissions/' + id).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return deferred.reject(err);
        expect(res.body).to.be.an('object').and.have.keys([
          '__v', '_id',
          'created_at',
          'data',
          'form',
          'form_index',
          'form_revision',
          'form_revision_index',
          'ip_address',
          'user_agent',
          'status',
          'newer',
          'older'
        ]);
        expect(res.body).to.be.an('object');
        expect(res.body.form).to.be.an('object');
        expect(res.body.form_revision).to.be.an('object');
        if (typeof moreExpectations === 'function') moreExpectations(res.body);
        deferred.resolve();
      });
      return deferred.promise;
    }

    it('should list a submission', function (done) {
      check(realSubmission._id, function (body) {
        expect(body.older).to.be.null;
        expect(body.newer).to.be.a('string').and.
          equal(realSubmission2._id.toString());
        expect(body.form_index).to.equal(0);
        expect(body.form_revision_index).to.equal(0);
      }).then(function () {
        return check(realSubmission2._id, function (body) {
          expect(body.older).to.be.a('string').and.
            equal(realSubmission._id.toString());
          expect(body.newer).to.be.null;
          expect(body.form_index).to.equal(1);
          expect(body.form_revision_index).to.equal(1);
        });
      }).then(done).catch(done);
    });

    function expectStatus (status, type) {
      var deferred = Q.defer();
      request(excavator).
      put('/backend/submissions/' + realSubmission._id + '/status/' + status).
      set('Authorization', 'token ' + realAdmin.token).
      expect(type ? 422 : 200).
      end(function (err, res) {
        if (err) return deferred.reject(err);
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
        deferred.resolve();
      });
      return deferred.promise;
    }

    it('should change status', function (done) {
      [
        { s: 0,  t: undefined },
        { s: 1,  t: 'invalid-status' },
        { s: 2,  t: undefined },
        { s: 3,  t: 'invalid-status' },
        { s: 4,  t: undefined },
        { s: 5,  t: undefined },
        { s: 6,  t: 'invalid-status' },
        { s: 7,  t: 'invalid-status' },
      ].reduce(function (prev, curr) {
        return prev.then(function () {
          return expectStatus(curr.s, curr.t);
        });
      }, Q()).then(done).catch(done);
    });
  });
});
