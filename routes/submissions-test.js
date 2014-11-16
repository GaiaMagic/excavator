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
        realSubmission = submission;
        return Submission.submit(realForm._id, real.submit);
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
        done();
      });
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
  });
});
