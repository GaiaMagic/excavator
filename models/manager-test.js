var config   = require('../test/config');

var Q        = require('q');
var mongoose = require('mongoose');
var Form     = require('./form');
var FormRevision = require('./form-revision');
var Manager  = require('./manager');

var real     = config.fixturesOf('form', 'manager');

var chai     = require('chai');
var expect   = chai.expect;

chai.should();

describe('Manager database model', function () {
  before(function (done) {
    if (mongoose.connection.db) {
      return createUser();
    }
    mongoose.connect(config.testDBAddress, createUser);

    function createUser () {
      Manager.remove({}, done);
    }
  });

  it('should re-calc number of managers of the form if manager is removed',
  function (done) {
    var realManager;
    var realForm;
    Manager.register(real.username, real.password).then(function (manager) {
      realManager = manager;
      return FormRevision.create(real.title, real.content);
    }).then(function (form) {
      return form.populateParent();
    }).then(function (form) {
      expect(form).to.be.an('object');
      expect(form.parent.managers).to.equal(0);
      var op = {};
      op[realManager._id] = true;
      return Form.updateManagers(form.parent._id, op);
    }).then(function (form) {
      realForm = form;
      expect(form).to.be.an('object');
      expect(form.managers).to.equal(1);
      return Q.nbind(Manager.findById, Manager)(realManager._id);
    }).then(function (manager) {
      return Q.nbind(manager.remove, manager)();
    }).then(function () {
      // since re-count is a post method, so wait a moment
      // before the form is deleted
      return Q.delay(500);
    }).then(function () {
      return Q.nbind(Form.findById, Form)(realForm._id);
    }).then(function (form) {
      expect(form).to.be.an('object');
      expect(form.managers).to.equal(0);
    }).then(done).catch(done);
  });
});
