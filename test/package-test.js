var chai   = require('chai');
var expect = chai.expect;

describe('package.json and package.backend.json', function () {
  it('should share the same dependencies', function () {
    var package = require('../package.json');
    var backendPackage = require('../package.backend.json');
    expect(package.dependencies).to.be.deep.equal(backendPackage.dependencies);
  });
});
