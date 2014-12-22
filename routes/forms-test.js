var config    = require('../test/config');
var mongoose  = require('mongoose');
var request   = require('supertest');
var excavator = require('./');
var Admin     = require('../models/admin');
var Form      = require('../models/form');
var FormRevision = require('../models/form-revision');
var Manager   = require('../models/manager');
var Template  = require('../models/template');
var Q         = require('q');

var real      = config.fixturesOf('admin', 'form', 'template');

var chai      = require('chai');
var expect    = chai.expect;

chai.should();

describe('Route /backend/forms', function () {
  var realAdmin;
  var realManager;
  var realForm;
  var realTemplate;

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
        return Q.nbind(Template.remove, Template)({});
      }).then(function () {
        return Admin.register(real.username, real.password);
      }).then(function (admin) {
        realAdmin = admin;
        return FormRevision.create(real.title, real.content);
      }).then(function (form) {
        realForm = form;
      }).then(function () {
        return Template.create(real.name, String(realForm._id), real.files);
      }).then(function (tpl) {
        realTemplate = tpl;
        return Manager.register(real.username, real.password);
      }).then(function (manager) {
        realManager = manager;
      }).catch(done).finally(done);
    }
  });

  describe('Sub-route /', function () {
    it('should list forms', function (done) {
      request(excavator).
      get('/backend/forms').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
    });

    it('should list forms of a specific manager', function (done) {
      function expectLength (length) {
        var deferred = Q.defer();
        request(excavator).
        get('/backend/forms?manager=' + realManager.username).
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

      expectLength(0).then(function () {
        var op = {}
        op[realManager._id] = true;
        return Form.updateManagers(realForm.parent, op);
      }).then(function (form) {
        return expectLength(1);
      }).then(done).catch(done);
    });
  });

  describe('Sub-route /:formid', function () {
    it('should return 404 if formid in invalid', function (done) {
      request(excavator).
      get('/backend/forms/invalidformid').
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
      get('/backend/forms/' + id.slice(0, -1) + (last + 1)).
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
      get('/backend/forms/' + realForm.parent).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys([
          'commits',
          'head',
          'published',
          'updated_at',
          'created_at',
          'slug',
          'title',
          'managers',
          'submissions',
          '_id', '__v'
        ]);
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

    describe('Sub-route /managers', function () {
      it('should return invalid-operation if no operation provided',
      function (done) {
        request(excavator).
        post('/backend/forms/' + realForm.parent + '/managers').
        set('Authorization', 'token ' + realAdmin.token).
        expect(422).
        end(function (err, res) {
          if (err) return done(err);
          expect(Object.keys(res.body)).to.have.members([
            'status',
            'type',
            'message'
          ]);
          expect(res.body.type).to.equal('invalid-operation');
          done();
        });
      });

      it('should return invalid-operation if manager does not found',
      function (done) {
        request(excavator).
        post('/backend/forms/' + realForm.parent + '/managers').
        send({
          '54659fbd73baf47213aaedbc': true
        }).
        set('Authorization', 'token ' + realAdmin.token).
        expect(422).
        end(function (err, res) {
          if (err) return done(err);
          expect(Object.keys(res.body)).to.have.members([
            'status',
            'type',
            'message'
          ]);
          expect(res.body.type).to.equal('invalid-manager');
          done();
        });
      });

      it('should return a form with 200 OK if manager exists',
      function (done) {
        var op = {};
        op[realManager._id] = true;
        request(excavator).
        post('/backend/forms/' + realForm.parent + '/managers').
        send(op).
        set('Authorization', 'token ' + realAdmin.token).
        expect(200).
        end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          done();
        });
      });
    });

    describe('Sub-route /templates', function () {
      it('should set template if template is valid', function (done) {
        request(excavator).
        post('/backend/forms/' + realForm.parent + '/templates').
        send({template: realTemplate._id}).
        set('Authorization', 'token ' + realAdmin.token).
        expect(200).
        end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.template).to.equal(realTemplate._id.toString());
          done();
        });
      });

      it('should clear template if template is undefined', function (done) {
        request(excavator).
        post('/backend/forms/' + realForm.parent + '/templates').
        send({template: undefined}).
        set('Authorization', 'token ' + realAdmin.token).
        expect(200).
        end(function (err, res) {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          expect(res.body.template).to.be.undefined();
          done();
        });
      });
    });
  });

  function expectFailure (token, data, status, type, done) {
    request(excavator).
    post('/backend/forms/create').
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

    it('should return content-is-not-valid-json if content is not a valid JSON',
    function (done) {
      expectFailure('token ' + realAdmin.token, {
        title: real.title,
        content: '{test:false}'
      }, 422, 'content-is-not-valid-json', done);
    });

    it('should return invalid-slug if slug is invalid', function (done) {
      expectFailure('token ' + realAdmin.token, {
        title: real.title,
        content: real.content,
        slug: repeat(real.slug, 10)
      }, 422, 'invalid-slug', done);
    });

    it('should return malformed-slug if slug is malformed', function (done) {
      expectFailure('token ' + realAdmin.token, {
        title: real.title,
        content: real.content,
        slug: '@#$%'
      }, 422, 'malformed-slug', done);
    });

    it('should return reserved-slug if slug is reserved', function (done) {
      expectFailure('token ' + realAdmin.token, {
        title: real.title,
        content: real.content,
        slug: 'backend'
      }, 409, 'reserved-slug', done);
    });

    it('should return slug-has-been-taken if slug has been taken already',
    function (done) {
      Form.remove({ slug: real.slug }).exec().then(function () {
        FormRevision.create(real.title, real.content,
          undefined, real.slug).then(function () {}, done).then(function (){
          expectFailure('token ' + realAdmin.token, {
            title: real.title,
            content: real.content,
            slug: real.slug
          }, 409, 'slug-has-been-taken', done);
        });
      }, done);
    });

    it('should return 200 OK if everything is valid', function (done) {
      request(excavator).
      post('/backend/forms/create').
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

  describe('Sub-route /search', function () {
    it('should return recent forms if no query', function (done) {
      request(excavator).
      get('/backend/forms/search').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        var promise = Form.find({}).sort({ _id: -1 });
        Q.nbind(promise.exec, promise)().then(function (forms) {
          for (var i = 0; i < res.body.length; i++) {
            expect(res.body[i]._id).to.equal(forms[i]._id.toString());
          }
        }).then(done).catch(done);
      });
    });

    it('should return related search results', function (done) {
      request(excavator).
      get('/backend/forms/search?query=' + real.title.toUpperCase()).
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.at.least(1);
        done();
      });
    });

    it('should return no search results', function (done) {
      request(excavator).
      get('/backend/forms/search?query=' + real.title + 'fake').
      set('Authorization', 'token ' + realAdmin.token).
      expect(200).
      end(function (err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.equal(0);
        done();
      });
    });
  });
});
