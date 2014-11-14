var request   = require('supertest');
var excavator = require('./');

describe('Route /backend', function () {
  describe('For non-existing routes', function () {
    it('should return 404 Not Found for /backend', function (done) {
      request(excavator).get('/backend').expect(404).end(done);
    });

    it('should return 404 Not Found for /backend/list', function (done) {
      request(excavator).get('/backend/list').expect(404).end(done);
    });
  });
});
