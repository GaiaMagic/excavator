var config   = require('../test/config');

var Q        = require('q');
var mongoose = require('mongoose');

var Setting  = require('./setting');

var chai     = require('chai');
var expect   = chai.expect;

chai.should();

describe('Setting database model', function () {
  before(function (done) {
    if (mongoose.connection.db) {
      return done();
    }
    mongoose.connect(config.testDBAddress, done);
  });

  beforeEach(function (done) {
    Setting.remove({}, done);
  });

  it('should not allow user to add more than one settings', function (done) {
    Setting.get().then(function (settings) {
      var deferred = Q.defer();
      var newsetting = new Setting();
      newsetting.save(function (err) {
        if (err) return deferred.reject(err);
        deferred.resolve(newsetting);
      });
      return deferred.promise;
    }).then(function (settings) {
      expect(settings).to.be.undefined;
    }, function (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.panic).to.be.true;
      expect(err.type).to.equal('settings-should-be-more-than-one');
    }).then(done).catch(done);
  });

  it('should not allow user to delete settings', function (done) {
    Setting.get().then(function (settings) {
      var deferred = Q.defer();
      settings.remove(function (err) {
        if (err) return deferred.reject(err);
        deferred.resolve();
      });
      return deferred.promise;
    }).then(function (settings) {
      expect(settings).to.be.undefined;
    }, function (err) {
      expect(err).to.be.an.instanceof(Error);
      expect(err.panic).to.be.true;
      expect(err.type).to.equal('settings-not-allowed-to-delete');
    }).then(done).catch(done);
  });

  it('should return a new setting if there is none', function (done) {
    Setting.get().then(function (settings) {
      expect(settings).to.be.an('object');
      expect(settings.toObject()).to.have.keys(['__v', '_id']);
      return Setting.get();
    }).then(function (settings) {
      expect(settings).to.be.an('object');
      expect(settings.toObject()).to.have.keys(['__v', '_id']);
    }).then(done).catch(done);
  });

  it('should save settings', function (done) {
    Setting.set({ test: { hello: 'world!' } }).then(function (settings) {
      expect(settings).to.be.an('object');
      expect(settings.toObject()).to.have.keys(['__v', '_id', 'settings']);
      expect(settings.settings).to.have.keys(['test']);
      expect(settings.settings.test).to.have.keys(['hello']);
      expect(settings.settings.test.hello).to.equal('world!');
    }).then(done).catch(done);
  });

  it('should merge object properties', function (done) {
    Setting.set({ test: { hello: 'world!' } }).then(function (settings) {
      return Setting.set({ test: { HELLO: 'WORLD!' } });
    }).then(function (settings) {
      expect(settings).to.be.an('object');
      expect(settings.toObject()).to.have.keys(['__v', '_id', 'settings']);
      expect(settings.settings).to.have.keys(['test']);
      expect(settings.settings.test).to.have.keys(['hello', 'HELLO']);
      expect(settings.settings.test.hello).to.equal('world!');
      expect(settings.settings.test.HELLO).to.equal('WORLD!');
    }).then(done).catch(done);
  });
});
