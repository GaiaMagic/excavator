var panic = require('../lib/panic');
var DOMAINS = require('../domains');

var User = {
  Admin:   require('../models/admin'),
  Manager: require('../models/manager')
};

function tokenAuth (options) {
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

    promise.then(function (user) {
      req.authorizedUser = {
        id: user._id.toString(),
        username: user.username.toString()
      };
      next();
    }, next);
  };
}

function statusRoute (model) {
  return function (req, res, next) {
    tokenAuth({
      model: model,
      returnPromise: true
    })(req).then(function (user) {
      res.send({
        status: 'OK',
        username: user.username,
        domains: DOMAINS[process.env.NODE_ENV] || {}
      });
    }).catch(function () {
      next(panic(200, {
        type:    'invalid-token',
        message: 'Invalid token.'
      }));
    });
  }
}

module.exports = tokenAuth;
module.exports.statusRoute = statusRoute;
