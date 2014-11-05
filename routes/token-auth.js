var Admin = require('../models/admin');

module.exports = function (req, res, next) {
  var auth = req.headers.authorization;
  var token;

  if (typeof auth === 'string' && auth.slice(0, 6) === 'token ') {
    token = auth.slice(6);
  }

  Admin.authorize(token).then(function (admin) {
    req.authorizedUser = {
      id: admin._id.toString(),
      username: admin.username.toString()
    };
    next();
  }, next);
};
