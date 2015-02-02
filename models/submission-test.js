var config       = require('../test/config');

var Q            = require('q');
var mongoose     = require('mongoose');
var Form         = require('./form');
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
      }).then(function () {
        return Form.publish(realForm.parent).then(function () {});
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
      Submission.submit(realForm._id, real.submit).delay(100).
      then(function (submission) {
        return Q.nbind(submission.populate, submission)('form form_revision');
      }).then(function (submission) {
        expect(submission).to.be.an('object');
        expect(submission.form).to.be.an('object');
        expect(submission.form.submissions).to.equal(1);
        expect(submission.form_revision).to.be.an('object');
        expect(submission.form_revision.submissions).to.equal(1);
        expect(submission.form_index).to.equal(0);
        expect(submission.form_revision_index).to.equal(0);
      }).then(function () {
        return Submission.submit(realForm._id, real.submit);
      }).delay(100).then(function (submission) {
        return Q.nbind(submission.populate, submission)('form form_revision');
      }).then(function (submission) {
        expect(submission.form.submissions).to.equal(2);
        expect(submission.form_revision.submissions).to.equal(2);
        expect(submission.form_index).to.equal(1);
        expect(submission.form_revision_index).to.equal(1);
        return FormRevision.create(real.title, real.content, submission.form);
      }).then(function (form) {
        return Submission.submit(form._id, real.submit);
      }).delay(100).then(function (submission) {
        return Q.nbind(submission.populate, submission)('form form_revision');
      }).then(function (submission) {
        expect(submission.form.submissions).to.equal(3);
        expect(submission.form_revision.submissions).to.equal(1);
        expect(submission.form_index).to.equal(2);
        expect(submission.form_revision_index).to.equal(0);
      }).then(done).catch(done);
    });

    it('should not allow user to edit submissions', function (done) {
      var promise = Submission.submit(realForm._id, real.submit).
        then(function (submission) {
          return Submission.findById(submission).exec();
        }).then(function (submission) {
          return submission.Save();
        });
      expectFailure(promise, 'submission-not-allowed-to-edit', done);
    });

    it('should not allow user to delete submissions', function (done) {
      var promise = Submission.submit(realForm._id, real.submit).
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

    it('should store an empty ip address if ip address is not valid',
    function (done) {
      Submission.submit(realForm._id, real.submit, {
        ipAddress: '333.123.12.33'
      }).
      then(function (submission) {
        expect(submission.ip_address).to.equal('');
      }).then(done).catch(done);
    });

    it('should store ip address if ip address is valid IPv4 address',
    function (done) {
      Submission.submit(realForm._id, real.submit, {
        ipAddress: '127.0.0.1'
      }).
      then(function (submission) {
        expect(submission.ip_address).to.equal('127.0.0.1');
      }).then(done).catch(done);
    });

    it('should store ip address if ip address is valid IPv6 address',
    function (done) {
      Submission.submit(realForm._id, real.submit, {
        ipAddress: 'fe80::200:5aee:feaa:20a2'
      }).
      then(function (submission) {
        expect(submission.ip_address).to.equal('fe80::200:5aee:feaa:20a2');
      }).then(done).catch(done);
    });

    it('should store user-agent',
    function (done) {
      var userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) ' +
        'AppleWebKit/537.36 (KHTML, like Gecko) ' +
        'Chrome/39.0.2171.95 Safari/537.36';
      Submission.submit(realForm._id, real.submit, {
        userAgent: userAgent
      }).
      then(function (submission) {
        expect(submission.user_agent).to.equal(userAgent);
      }).then(done).catch(done);
    });

    it('should only store acceptable data', function (done) {
      expectFailure(Submission.submit(realForm._id, {
        fullname: '@!#'
      }), 'validation-failed', done);
    });
  });
});
