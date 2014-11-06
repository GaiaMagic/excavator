var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');
var FormRevision = require('../models/form-revision');

var real      = config.fixturesOf('admin', 'form');

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /forms', function () {
  var realAdmin;
  var realForm;

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
        }).then(done).catch(done);
      });
    }
  });

  describe('Sub-route /', function () {
    it('should list forms', function (done) {
      request(excavator).
      get('/forms').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
    });
  });

  describe('Sub-route /:formid', function () {
    it('should return 404 if formid in invalid', function (done) {
      request(excavator).
      get('/forms/invalidformid').
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

    it('should return 404 if formid does not exist', function (done) {
      var id = realForm.parent.toString();
      var last = parseInt(id.slice(-1)) || 0;
      request(excavator).
      get('/forms/' + id.slice(0, -1) + (last + 1)).
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

    it('should list a form', function (done) {
      request(excavator).
      get('/forms/' + realForm.parent).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body.head).to.be.an('object');
        expect(res.body.head._id).to.equal(realForm._id.toString());
        expect(res.body.head.title).to.equal(real.title);
        expect(res.body.head.content).to.equal(real.content);
        expect(res.body.commits).to.be.an('array');
        expect(res.body.commits).to.have.members([
          realForm._id.toString()
        ]);
        done();
      });
    });
  });

  function expectFailure (token, data, status, type, done) {
    request(excavator).
    post('/forms/create').
    set('Authorization', token).
    send(data || { title: real.title, content: real.content }).
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

    it('should return title-is-required if no title', function (done) {
      expectFailure('token ' + realAdmin.token, {
        content: real.content
      }, 422, 'title-is-required', done);
    });

    it('should return content-is-required if no content', function (done) {
      expectFailure('token ' + realAdmin.token, {
        title: real.title
      }, 422, 'content-is-required', done);
    });

    it('should return title-is-too-long if title was too long',
    function (done) {
      expectFailure('token ' + realAdmin.token, {
        title: repeat(real.title, 10),
        content: real.content
      }, 413, 'title-is-too-long', done);
    });

    it('should return content-is-too-large if title was too long',
    function (done) {
      var object = { test: repeat(real.title, 500) };
      var largecontent = JSON.stringify(object);
      expectFailure('token ' + realAdmin.token, {
        title: real.title,
        content: largecontent
      }, 413, 'content-is-too-large', done);
    });

    it('should return 200 OK if everything is valid', function (done) {
      request(excavator).
      post('/forms/create').
      set('Authorization', 'token ' + realAdmin.token).
      send({ title: real.title, content: real.content }).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(Object.keys(res.body)).to.have.members([
          'parent',
          'title',
          'content',
          'created_at'
        ]);
        expect(res.body.parent).to.be.a('string');
        expect(res.body.title).to.equal(real.title);
        expect(res.body.content).to.equal(real.content);
        expect(isNaN(new Date(res.body.created_at))).to.be.false;
        done();
      });
    });
  });
});
