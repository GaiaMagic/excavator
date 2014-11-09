var config       = require('../test/config');

var Q            = require('q');
var mongoose     = require('mongoose');
var FormRevision = require('./form-revision');
var Submission   = require('./submission');
var panic        = require('../lib/panic');

var real         =  config.fixtures.form;

var chai         = require('chai');
var expect       = chai.expect;

chai.should();

describe('Submission database model', function () {
  before(function (done) {
    if (mongoose.connection.db) {
      return done();
    }
    mongoose.connect(config.testDBAddress, done);
  });

  function expectFailure (promise, type, done) {
    return promise.then(function (submission) {
      expect(submission).to.be.undefined;
    }, function (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.panic).to.be.true;
      expect(err.type).to.equal(type);
    }).then(done).catch(done);
  }

  describe('on creation', function () {
    var realForm;

    before(function (done) {
      FormRevision.create(real.title, real.content).then(function (revision) {
        realForm = revision;
      }).then(done).catch(done);
    });

    it('should fail to create if no form is provided', function (done) {
      expectFailure(Submission.submit(undefined, {}), 'invalid-form', done);
    });

    it('should fail to create if form does not exist', function (done) {
      expectFailure(Submission.submit('545c3b200b7bf0070eff9271', {}),
        'invalid-form', done);
    });

    it('should have form id automatically once created', function (done) {
      Submission.submit(realForm._id, {}).then(function (submission) {
        expect(submission).to.be.an('object');
        expect(submission.form).to.be.an('object');
        expect(submission.form_revision).to.be.an('object');
      }).then(done).catch(done);
    });

    it('should not allow user to edit submissions', function (done) {
      var promise = Submission.submit(realForm._id, {}).
        then(function (submission) {
          return Submission.findById(submission).exec();
        }).then(function (submission) {
          return submission.Save();
        });
      expectFailure(promise, 'submission-not-allowed-to-edit', done);
    });

    it('should not allow user to delete submissions', function (done) {
      var promise = Submission.submit(realForm._id, {}).
        then(function (submission) {
          return Submission.findById(submission).exec();
        }).then(function (submission) {
          var deferred = Q.defer();
          submission.remove(function (err) {
            if (err) return deferred.reject(err);
            deferred.resolve();
          });
          return deferred.promise;
        });
      expectFailure(promise, 'submission-not-allowed-to-delete', done);
    });

    it('should only store acceptable data');
  });
});