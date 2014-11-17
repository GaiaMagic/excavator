var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var FormRevision = require('../models/form-revision');

var real      = config.fixturesOf('form');

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /public', function () {
  var realForm;

  before(function (done) {
    if (mongoose.connection.db) {
      return createForm(done);
    }
    mongoose.connect(config.testDBAddress, createForm(done));

    function createForm (done) {
      FormRevision.create(real.title, real.content).then(function (form) {
        realForm = form;
      }).then(done).catch(done);
    }
  });

  describe('Sub-route /forms/:formid', function () {
    it('should return 404 if formid in invalid', function (done) {
      request(excavator).
      get('/public/forms/invalidformid').
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
      get('/public/forms/' + id.slice(0, -1) + (last + 1)).
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
      get('/public/forms/' + realForm.parent).
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

    it('should list a form revision for /public/forms/xx/xx', function (done) {
      request(excavator).
      get('/public/forms/' + realForm.parent + '/' + realForm._id).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        ['head', 'index'].forEach(function (head) {
          expect(res.body[head]).to.be.an('object');
          expect(res.body[head]._id).to.equal(realForm._id.toString());
          expect(res.body[head].title).to.equal(real.title);
          expect(res.body[head].content).to.equal(real.content);
        });
        expect(res.body.commits).to.be.an('array');
        expect(res.body.commits).to.have.members([
          realForm._id.toString()
        ]);
        done();
      });
    });
  });

  function expectFailure (data, status, type, done) {
    request(excavator).
    post('/public/submit').
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

  describe('Sub-route /submit', function () {
    it('should return invalid-form if no form', function (done) {
      expectFailure({
        data: {}
      }, 422, 'invalid-form', done);
    });

    it('should return 200 OK if everything is valid', function (done) {
      request(excavator).
      post('/public/submit').
      send({ form: realForm._id, data: real.submit }).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.have.keys([
          'data',
          'form',
          'form_index',
          'form_revision',
          'form_revision_index',
          'status',
          'created_at',
          '_id',
          '__v'
        ]);
        expect(res.body._id).to.be.a('string');
        expect(res.body.form).to.be.a('string');
        expect(res.body.form_index).to.equal(0);
        expect(res.body.form_revision).to.be.a('string');
        expect(res.body.form_revision_index).to.equal(0);;
        expect(isNaN(new Date(res.body.created_at))).to.be.false;
        done();
      });
    });
  });

  describe('Other routes', function () {
    it('should return 404 Not Found for /public', function (done) {
      request(excavator).get('/public').expect(404).end(done);
    });

    it('should return 404 Not Found for /public/list', function (done) {
      request(excavator).get('/public/list').expect(404).end(done);
    });
  });
});
