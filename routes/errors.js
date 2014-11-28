var i18n = require('../lib/i18n');
var tr = i18n.tr;
var panic = require('../lib/panic');

module.exports = function (err, req, res, next) {
  if (!err) return next();

  var langcode = req.headers.lang;

  if ((err.name === 'CastError' && err.type === 'ObjectId') ||
    err === 'not-found') {
    err = panic(404, {
      type: 'not-found',
      message: tr('The resource you requested does not exist.')
    });
  }
  if (err.type === 'entity.too.large') {
    err = panic(413, {
      type: 'not-found',
      message: tr('The file you have uploaded is too large. Please resize it.')
    });
  }
  if (err.panic) {
    var errObj = {
      status: err.status,
      type: err.type,
      message: err.message
    };
    if (err.messages instanceof Array && err.messages.length > 0) {
      errObj.messages = err.messages.map(function (msg) {
        return i18n.translate(msg, langcode);
      });
      if (!err.message) {
        errObj.message = err.messages[0];
      }
    }
    errObj.message = i18n.translate(errObj.message, langcode);
    return res.status(err.status).send(errObj);
  } else {
    console.error(err);
  }
  res.status(500).send({
    status: 500,
    type: 'unknown-error',
    message: i18n.translate(tr('Unknown server error.'), langcode)
  });
};
