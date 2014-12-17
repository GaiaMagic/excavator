var mongoose = require('mongoose');
var Template = require('./template');
var config   = require('../test/config');
var real     = config.fixtures.template;
var chai     = require('chai');
var expect   = chai.expect;

describe('Template database model', function () {
  before(function (done) {
    if (mongoose.connection.db) {
      return done();
    }
    mongoose.connect(config.testDBAddress, done);
  });

  describe('on creation', function () {
    function expectFailure (name, form, files, type, done) {
      var promise = Template.create(name, form, files).then(function (tpl) {
        expect(tpl).to.be.undefined;
      }, function (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.panic).to.be.true;
        expect(err.type).to.equal(type);
      });

      if (done) promise = promise.then(done).catch(done);

      return promise;
    }

    it('should fail if name is undefined', function (done) {
      expectFailure(undefined, undefined, real.files, 'name-is-required', done);
    });

    it('should fail if name is empty', function (done) {
      expectFailure('', undefined, real.files, 'name-is-required', done);
    });

    it('should fail if name is too long', function (done) {
      var longname = Array(50).join(real.name);
      expectFailure(longname, undefined, real.files, 'name-is-too-long', done);
    });

    it('should fail if form is not valid', function (done) {
      expectFailure(real.name, {}, real.files, 'form-is-not-valid', done);
    });

    it('should fail if files are not valid', function (done) {
      expectFailure(real.name, undefined, [{}], 'invalid-files').
      then(function () {
        return expectFailure(real.name, undefined, '', 'invalid-files');
      }).then(function () {
        return expectFailure(real.name, undefined,
          [{ type: 'text/css' }], 'invalid-files');
      }).then(function () {
        return expectFailure(real.name, undefined, [{ type: 'text/css',
          content: 'body {}', test: true }], 'invalid-files');
      }).then(function () {
        return expectFailure(real.name, undefined, [{ type: 'false',
          content: 'body {}' }], 'invalid-files');
      }).then(done).catch(done);
    });

    it('should create a template', function (done) {
      Template.create(real.name, undefined, real.files).then(function (tpl) {
        expect(tpl).to.be.an('object');
        expect(tpl.name).to.equal(real.name);
        expect(tpl.form).to.be.undefined;
        expect(tpl.created_at).to.be.a('date');
        expect(tpl.updated_at).to.be.a('date');
        expect(tpl.files).to.be.an('array').and.have.length(real.files.length);
      }).then(done).catch(done);
    });
  });
});
