module.exports = function (status, details) {
  var err = new Error();
  err.panic   = true;
  err.status  = status;
  err.message = details.message;
  err.type    = details.type;
  return err;
};
