var path = require('path');
var livereload = require('connect-livereload');
var serveThisFileOnly = require('./serve-only');

module.exports = {};

module.exports.static = function developmentConfigs (express, excavator, root) {
  excavator.use(livereload({ port: 35729 }));
  express.static.mime.define({'text/javascript': ['js']});
  excavator.use(express.static(path.join(root, '.tmp')));
  excavator.use(express.static(path.join(root, 'dist')));
  excavator.use(express.static(path.join(root, 'lib')));
  excavator.use(express.static(path.join(root, 'views')));
  excavator.use(express.static(path.join(root, 'assets')));
  excavator.use(express.static(path.join(root, 'vendors')));
};

module.exports.angular = function serverHTMLFiles (express, excavator, root) {
  var controlIndex = path.join(root, 'views', 'control', 'index.html');
  excavator.use('/control', serveThisFileOnly(controlIndex));

  var managerIndex = path.join(root, 'views', 'manager', 'index.html');
  excavator.use('/manager', serveThisFileOnly(managerIndex));

  var defaultIndex = path.join(root, 'views', 'index.html');
  excavator.use(serveThisFileOnly(defaultIndex));
};
