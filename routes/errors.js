module.exports = function (err, req, res, next) {
  if (!err) return next();
  if (err.panic) {
    return res.status(err.status).send({
      status: err.status,
      type: err.type,
      message: err.message
    });
  } else {
    console.error(err);
  }
  res.status(500).send({
    status: 500,
    type: 'unknown-error',
    message: 'Unknown server error.'
  });
};
