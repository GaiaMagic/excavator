var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');

var real      = config.fixturesOf('admin', 'form');

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /forms', function () {
  var realAdmin;

  before(function (done) {
    if (mongoose.connection.db) {
      return createUser(done);
    }
    mongoose.connect(config.testDBAddress, createUser(done));

    function createUser (done) {
      Admin.remove({}, function () {
        Admin.register(real.username, real.password).then(function (admin) {
          realAdmin = admin;
          done();
        }).catch(done);
      });
    }
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
      expectTokenFailure('token 313d4c51226c3ce901111e5dbfd82f64500' +
        '3435fb7856e0e18f29b84f437f1a1', done);
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
