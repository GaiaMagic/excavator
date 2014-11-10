var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');
var FormRevision = require('../models/form-revision');
var Submission = require('../models/submission');

var real      = config.fixturesOf('admin', 'form');

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /backend/submissions', function () {
  var realAdmin;
  var realForm;
  var realSubmission;

  before(function (done) {
    if (mongoose.connection.db) {
      return createUser(done);
    }
    mongoose.connect(config.testDBAddress, createUser(done));

    function createUser (done) {
      Admin.remove({}, function () {
        Admin.register(real.username, real.password).then(function (admin) {
          realAdmin = admin;
          return FormRevision.create(real.title, real.content).
            then(function (form) {
              realForm = form;
            });
        }).then(function () {
          return Submission.submit(realForm._id, real.submit).
            then(function (submission) {
              realSubmission = submission;
            }
          );
        }).then(done).catch(done);
      });
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
        expect(res.body).to.be.an('array');
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
        expect(Object.keys(res.body)).to.have.members([
          'status',
          'type',
          'message'
        ]);
        expect(res.body.type).to.equal('not-found');
        done();
      });
    });

    it('should return 404 if submissionid does not exist', function (done) {
      var id = realSubmission._id.toString();
      var last = ((parseInt(id.slice(-1)) || 0) + 1 + '').slice(0, 1);
      request(excavator).
      get('/backend/submissions/' + id.slice(0, -1) + last).
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

    it('should list a submission', function (done) {
      request(excavator).
      get('/backend/submissions/' + realSubmission._id).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body.form).to.be.an('string');
        expect(res.body.form_revision).to.be.an('string');
        done();
      });
    });
  });
});
