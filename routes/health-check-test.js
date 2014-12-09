var request   = require('supertest');
var excavator = require('./');

var chai      = require('chai');
var expect    = chai.expect;

describe('Route /health-check', function () {
  it('should return an object containing last parts of local addresses',
  function (done) {
    request(excavator).
    get('/health-check').
    expect(200).
    end(function (err, res) {
      if (err) return done(err);
      expect(res.body).to.be.an('object');
      expect(res.body.addresses).to.be.an('array');
      done();
    });
  });
});
