// I gave up creating a new object inherits from Error,
// as it may make tests to fail in mocha when reloading the tests

module.exports = function (status, details) {
  var err = new Error();
  err.panic   = true;
  err.status  = status;
  err.message = details.message;
  err.type    = details.type;
  return err;
};
