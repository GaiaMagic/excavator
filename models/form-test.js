var config       = require('../test/config');

var Q            = require('q');
var mongoose     = require('mongoose');
var Form         = require('./form');
var FormRevision = require('./form-revision');
var Manager      = require('./manager');
var panic        = require('../lib/panic');

var real     =  config.fixturesOf('form', 'manager');

var chai     = require('chai');
var expect   = chai.expect;

chai.should();

describe('Form (w/ revision) database model', function () {
  function expectFailure (promise, type, done) {
    promise = promise.then(function (revision) {
      expect(revision).to.be.undefined;
    }, function (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.panic).to.be.true;
      expect(err.type).to.equal(type);
    });

    if (done) promise = promise.then(done).catch(done);

    return promise;
  }

  before(function (done) {
    if (mongoose.connection.db) {
      return done();
    }
    mongoose.connect(config.testDBAddress, done);
  });

  describe('on creation', function () {
    before(function (done) {
      FormRevision.remove({}, done);
    });

    it('should create a form automatically if no parent id is specified',
    function (done) {
      FormRevision.create(real.title, real.content).then(function (revision) {
        expect(revision).to.be.an('object');
        expect(Object.keys(revision.schema.paths)).to.have.members([
          'parent',
          'slug',
          'title',
          'content',
          'created_at',
          '_id', '__v']);
        expect(isNaN(new Date(revision.created_at))).to.be.false;
        expect(revision.parent.toString()).to.be.a('string');
        revision.title.should.equal(real.title);
        revision.content.should.equal(real.content);
      }).then(done).catch(done);
    });

    /**
     * some expectations to verify the form model in form revision model
     * @param  {object} revision  the revision object to be verified
     * @param  {int}    len       expect how many commits are there in the form
     * @return {undefined}        this function returns nothing
     */
    function expectRevision (revision, len) {
      expect(revision).to.be.an('object');
      expect(revision._id.toString()).to.be.a('string');
      expect(revision.parent).to.be.an('object');
      expect(Object.keys(revision.parent.schema.paths)).to.have.members([
        'published',
        'slug',
        'head',
        'commits',
        'created_at',
        'updated_at',
        '_id', '__v']);
      expect(revision.parent.created_at).to.not.be.undefined;
      expect(revision.parent.updated_at).to.not.be.undefined;
      if (len === 1) {
        // when created, created_at equals to updated_at
        expect(+new Date(revision.parent.created_at)).to.
          equal(+new Date(revision.parent.updated_at));
      } else {
        // however, updated_at will be updated when changed
        expect(+new Date(revision.parent.created_at)).to.not.
          equal(+new Date(revision.parent.updated_at));
      }
      expect(revision.parent.commits).to.be.an('array').and.have.length(len);
      expect(revision.parent.head.toString()).to.
        equal(revision._id.toString());
    }

    it('should add itself to the parent form if parent id is specified',
    function (done) {
      FormRevision.create(real.title, real.content).then(function (revision) {
        return revision.populateParent();
      }).then(function (revision) {
        expectRevision(revision, 1);
        return FormRevision.create(real.title, real.content, revision.parent);
      }).then(function (revision) {
        return revision.populateParent();
      }).then(function (revision) {
        expectRevision(revision, 2);
      }).then(done).catch(done);
    });

    function repeat (string, n) {
      return Array(n + 1).join(string);
    }

    it('should fail if no title is provided', function (done) {
      expectFailure(FormRevision.create('', real.content),
        'title-is-required', done);
    });

    it('should fail if the title is too long', function (done) {
      var longtitle = repeat(real.title, 10);
      expectFailure(FormRevision.create(longtitle, real.content),
        'title-is-too-long', done);
    });

    it('should fail if no content is provided', function (done) {
      expectFailure(FormRevision.create(real.title, ''),
        'content-is-required', done);
    });

    it('should fail if the content is too large', function (done) {
      var object = { test: repeat(real.title, 500) };
      var largecontent = JSON.stringify(object);
      expectFailure(FormRevision.create(real.title, largecontent),
        'content-is-too-large', done);
    });

    it('should fail if the content is not a JSON string', function (done) {
      var invalidcontent = '{test:false}';
      expectFailure(FormRevision.create(real.title, invalidcontent),
        'content-is-not-valid-json', done);
    });

    it('should fail if slug is invalid', function (done) {
      expectFailure(FormRevision.create(real.title, real.content,
        undefined, repeat(real.slug, 10)), 'invalid-slug', done);
    });

    it('should fail if slug is malformed', function (done) {
      expectFailure(FormRevision.create(real.title, real.content,
        undefined, '@#$%^'), 'malformed-slug', done);
    });

    it('should fail if slug is reserved', function (done) {
      expectFailure(FormRevision.create(real.title, real.content,
        undefined, 'backend'), 'reserved-slug', done);
    });

    it('should fail if slug has been taken already', function (done) {
      Form.remove({ slug: real.slug }).exec().then(function () {
        FormRevision.create(real.title, real.content,
          undefined, real.slug).then(function () {}, done).then(function (){
          expectFailure(FormRevision.create(real.title, real.content,
            undefined, real.slug), 'slug-has-been-taken', done);
        });
      }, done);
    });

    it('should use _id of the form as slug if slug is not specified',
      function (done) {
      Form.remove({ slug: real.slug }).exec().then(function () {
        FormRevision.create(real.title, real.content).then(function (revision) {
          expect(revision.slug).to.be.undefined;
          return revision.populateParent();
        }).then(function (revision) {
          expect(revision.parent.slug).to.equal(revision.parent._id.toString());
          return revision;
        }).then(function (revision) {
          return FormRevision.create(real.title, real.content,
            revision.parent._id.toString(), real.slug);
        }).then(function (revision) {
          return revision.populateParent();
        }).then(function (revision) {
          expect(revision.parent.slug).to.equal(real.slug);
          return revision;
        }).then(function (revision) {
          return FormRevision.create(real.title, real.content,
            revision.parent._id.toString(), undefined);
        }).then(function (revision) {
          return revision.populateParent();
        }).then(function (revision) {
          expect(revision.parent.slug).to.equal(revision.parent._id.toString());
        }).then(done).catch(done);
      }, done);
    });
  });

  describe('on editing', function () {
    it('should not allow user to edit revisions', function (done) {
      var promise = FormRevision.create(real.title, real.content);

      promise = promise.then(function (revision) {
        return FormRevision.findById(revision._id).exec();
      }).then(function (revision) {
        var deferred = Q.defer();
        revision.title += '-edited';
        revision.save(function (err) {
          if (err) return deferred.reject(err);
          deferred.resolve(revision);
        });
        return deferred.promise;
      });

      expectFailure(promise, 'revision-not-allowed-to-edit', done);
    });

    it('should not allow user to delete revisions', function (done) {
      var promise = FormRevision.create(real.title, real.content);

      promise = promise.then(function (revision) {
        return FormRevision.findById(revision._id).exec();
      }).then(function (revision) {
        var deferred = Q.defer();
        revision.remove(function (err) {
          if (err) return deferred.reject(err);
          deferred.resolve();
        });
        return deferred.promise;
      });

      expectFailure(promise, 'revision-not-allowed-to-delete', done);
    });

    it('should allow manager to access the form', function (done) {
      var realManager;
      var realManager2;
      var form;
      var form2;
      Q.nbind(Manager.remove, Manager)({}).then(function () {
        return Manager.register(real.username, real.password);
      }).then(function (manager) {
        realManager = manager;
        return Manager.register(real.username + '2', real.password);
      }).then(function (manager) {
        realManager2 = manager;
        return FormRevision.create(real.title, real.content);
      }).then(function (revision) {
        form = revision.parent;
      }).then(function () {
        return FormRevision.create(real.title, real.content);
      }).then(function (revision) {
        form2 = revision.parent;
      }).then(function () {
        return expectFailure(Form.updateManagers(form), 'invalid-operation');
      }).then(function () {
        return expectFailure(Form.updateManagers(form, {
          '54659fbd73baf47213aaedbc': true
        }), 'invalid-manager');
      }).then(function () {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(form, op);
      }).then(function () {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(form2, op);
      }).then(function () {
        var op = {};
        op[realManager._id] = true;
        return Form.updateManagers(form, op);
      }).then(function () {
        var op = {};
        op[realManager._id] = true;
        op[realManager2._id] = true;
        return Form.updateManagers(form2, op);
      }).then(function (form) {
        expect(form).to.be.an('object');
        expect(form.toObject()).to.have.keys([
          'commits',
          'head',
          'published',
          'updated_at',
          'created_at',
          'slug',
          '_id', '__v'
        ]);
        return Q.nbind(Manager.findById, Manager)(realManager._id);
      }).then(function (manager) {
        expect(manager.forms).to.be.an('array').and.have.length(2);
        expect(manager.forms[0].toString()).to.equal(form2.toString());
        expect(manager.forms[1].toString()).to.equal(form.toString());
        return Q.nbind(Manager.findById, Manager)(realManager2._id);
      }).then(function (manager) {
        expect(manager.forms).to.be.an('array').and.have.length(1);
        expect(manager.forms[0].toString()).to.equal(form2.toString());
      }).then(function () {
        var op = {};
        op[realManager._id] = false;
        op[realManager2._id] = false;
        return Form.updateManagers(form2, op);
      }).then(function (form) {
        return Q.nbind(Manager.findById, Manager)(realManager._id);
      }).then(function (manager) {
        expect(manager.forms).to.be.an('array').and.have.length(1);
        expect(manager.forms[0].toString()).to.equal(form.toString());
        return Q.nbind(Manager.findById, Manager)(realManager2._id);
      }).then(function (manager) {
        expect(manager.forms).to.be.an('array').and.have.length(0);
      }).then(done).catch(done);
    });
  });
});
