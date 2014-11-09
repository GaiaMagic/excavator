var fs = require('fs');

function makeMiddleware (path) {
  return function serveThisFileOnly (req, res, next) {
    try {
      fs.createReadStream(path).pipe(res);
    } catch (e) {
      next();
    }
  }
}

module.exports = makeMiddleware;
