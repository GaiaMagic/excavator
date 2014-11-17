var request = require('supertest');
var excavator = require('./');

var chaijs = require('chai');
var expect = chaijs.expect;

describe('Route /backend/misc', function () {
  it('should return 404 Not Found for /backend/misc', function (done) {
    request(excavator).get('/backend/misc').expect(404).end(done);
  });

  it('should return a list of statuses', function (done) {
    request(excavator).
    get('/backend/misc/statuses').
    expect(200).
    end(function (err, res) {
      if (err) return done(err);
      var body = res.body;
      expect(body).to.be.an('array').and.have.length(4);
      done();
    });
  });
});
