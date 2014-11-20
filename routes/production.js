var path = require('path');
var serveThisFileOnly = require('./serve-only');

module.exports = {};

module.exports.static = function productionConfigs (express, excavator, root) {
  express.static.mime.define({'text/javascript': ['js']});
  var dist = path.join(root, 'dist');
  excavator.use(function (req, res, next) {
    switch (req.hostname) {
    case 'control':
      express.static(path.join(dist, 'control')).apply(express.static, arguments);
      break;
    case 'manager':
      express.static(path.join(dist, 'manager')).apply(express.static, arguments);
      break;
    default:
      express.static(path.join(dist, 'public')).apply(express.static, arguments);
    }
  });
};

module.exports.angular = function serverHTMLFiles (express, excavator, root) {
  excavator.use(function (req, res, next) {
    switch (req.hostname) {
    case 'control':
      var controlIndex = path.join(root, 'dist', 'control', 'index.html');
      serveThisFileOnly(controlIndex).apply(express, arguments);
      break;
    case 'manager':
      var managerIndex = path.join(root, 'dist', 'manager', 'index.html');
      serveThisFileOnly(managerIndex).apply(express, arguments);
      break;
    default:
      var defaultIndex = path.join(root, 'dist', 'public', 'index.html');
      serveThisFileOnly(defaultIndex).apply(express, arguments);
    }
  });
};
