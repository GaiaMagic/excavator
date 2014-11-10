var panic = require('../lib/panic');

module.exports = function (err, req, res, next) {
  if (!err) return next();
  if ((err.name === 'CastError' && err.type === 'ObjectId') ||
    err === 'not-found') {
    err = panic(404, {
      type: 'not-found',
      message: 'The resource you requested does not exist.'
    });
  }
  if (err.panic) {
    var errObj = {
      status: err.status,
      type: err.type,
      message: err.message
    };
    if (err.messages instanceof Array && err.messages.length > 0) {
      errObj.messages = err.messages;
      if (!err.message) {
        errObj.message = err.messages[0];
      }
    }
    return res.status(err.status).send(errObj);
  } else {
    console.error(err);
  }
  res.status(500).send({
    status: 500,
    type: 'unknown-error',
    message: 'Unknown server error.'
  });
};
