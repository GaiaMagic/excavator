// I gave up creating a new object inherits from Error,
// as it may make tests to fail in mocha when reloading the tests

module.exports = function (status, details) {
  var err = new Error();
  var message  = details.message;
  if (!message && details.messages instanceof Array &&
    details.messages.length > 0) {
    message    = details.messages[0];
  }
  err.panic    = true;
  err.status   = status;
  err.message  = message;
  err.messages = details.messages;
  err.type     = details.type;
  return err;
};
