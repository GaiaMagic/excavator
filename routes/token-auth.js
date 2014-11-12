var User = {
  Admin:   require('../models/admin'),
  Manager: require('../models/manager')
};

module.exports = function makeMiddleware (options) {
  options = options || {};

  return function authorizeMiddleware (req, res, next) {
    var auth = req.headers.authorization;
    var token;

    if (typeof auth === 'string' && auth.slice(0, 6) === 'token ') {
      token = auth.slice(6);
    }

    var promise = (User[options.model] || User.Admin).authorize(token);

    if (options.returnPromise) {
      return promise;
    }

    promise.then(function (admin) {
      req.authorizedUser = {
        id: admin._id.toString(),
        username: admin.username.toString()
      };
      next();
    }, next);
  };
};
