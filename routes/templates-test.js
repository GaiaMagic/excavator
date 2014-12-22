var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Template  = require('../models/template');
var Admin     = require('../models/admin');
var Q         = require('q');
var expect    = require('chai').expect;

var real      = config.fixturesOf('admin', 'template');
var realAdmin;
var realTemplate;

describe('Route /backend/templates', function () {
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
      }).then(function () {
        return Q.nbind(Template.remove, Template)({});
      }).then(function () {
        return Template.create(real.name, real.form, real.files);
      }).then(function (tpl) {
        realTemplate = tpl;
      }).catch(done).finally(done);
    }
  });

  describe('Sub route /', function () {
    it('should return a list of templates', function (done) {
      request(excavator).
      get('/backend/templates').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        expect(body).to.be.an('array').and.have.length(1);
        expect(body[0]).to.have.keys([
          '__v',
          '_id',
          'created_at',
          'updated_at',
          // 'files', // do not include files (cause it's large in size)
          'form',
          'name'
        ]);
        done();
      });
    });

    it('should return details of a template', function (done) {
      request(excavator).
      get('/backend/templates/' + realTemplate._id).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        expect(body).to.have.keys([
          '__v',
          '_id',
          'created_at',
          'updated_at',
          'files',
          'form',
          'name'
        ]);
        expect(body.name).to.equal(real.name);
        expect(body.files).to.deep.have.members(real.files);
        done();
      });
    });

    it('should create a template', function (done) {
      request(excavator).
      post('/backend/templates').
      send({ name: real.name, form: real.form, files: real.files }).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        expect(body).to.have.keys([
          '__v',
          '_id',
          'created_at',
          'updated_at',
          'files',
          'form',
          'name'
        ]);
        expect(body.name).to.equal(real.name);
        expect(body.files).to.deep.have.members(real.files);
        done();
      });
    });

    it('should update a template', function (done) {
      var name = real.name.toUpperCase();
      request(excavator).
      put('/backend/templates/' + realTemplate._id).
      send({ name: name, form: real.form, files: [] }).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        var body = res.body;
        expect(body).to.have.keys([
          '__v',
          '_id',
          'created_at',
          'updated_at',
          'files',
          'form',
          'name'
        ]);
        expect(body.name).to.equal(name);
        expect(body.files).to.be.an('array').and.have.length(0);
        done();
      });
    });
  });
});
