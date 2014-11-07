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

describe('Route /submissions', function () {
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
          return Submission.submit(realForm._id, {}).
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
      get('/submissions').
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
      get('/submissions/invalidsubmissionid').
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
      get('/submissions/' + id.slice(0, -1) + last).
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
      get('/submissions/' + realSubmission._id).
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

  function expectFailure (token, data, status, type, done) {
    request(excavator).
    post('/submissions/create').
    set('Authorization', token).
    send(data || { form: realForm._id, data: {} }).
    expect(status || 403).
    end(function (err, res) {
      if (err) return done(err);
      expect(Object.keys(res.body)).to.have.members([
        'status',
        'type',
        'message'
      ]);
      expect(res.body.type).to.equal(type || 'invalid-token');
      done();
    });
  }

  function expectTokenFailure (token, done) {
    expectFailure (token, undefined, undefined, undefined, done);
  }

  describe('Sub-route /create', function () {
    function repeat (string, n) {
      return Array(n + 1).join(string);
    }

    it('should return forbidden if token is undefined', function (done) {
      expectTokenFailure(undefined, done);
    });

    it('should return forbidden if there is no token', function (done) {
      expectTokenFailure('token', done);
    });

    it('should return forbidden if the token is not valid', function (done) {
      expectTokenFailure('token ' + real.token, done);
    });

    it('should return invalid-form if no form', function (done) {
      expectFailure('token ' + realAdmin.token, {
        data: {}
      }, 422, 'invalid-form', done);
    });

    it('should return 200 OK if everything is valid', function (done) {
      request(excavator).
      post('/submissions/create').
      set('Authorization', 'token ' + realAdmin.token).
      send({ form: realForm._id, data: {} }).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(Object.keys(res.body)).to.have.members([
          'form',
          'form_revision',
          'created_at',
          '_id',
          '__v'
        ]);
        expect(res.body._id).to.be.a('string');
        expect(res.body.form).to.be.a('string');
        expect(res.body.form_revision).to.be.a('string');
        expect(isNaN(new Date(res.body.created_at))).to.be.false;
        done();
      });
    });
  });
});
