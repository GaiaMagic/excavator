var path = require('path');
var livereload = require('connect-livereload');

module.exports = function developmentConfigs (express, excavator, root) {
  excavator.use(livereload({ port: 35729 }));
  express.static.mime.define({'text/javascript': ['js']});
  excavator.use(express.static(path.join(root, 'dist')));
  excavator.use(express.static(path.join(root, 'lib')));
  excavator.use(express.static(path.join(root, 'views')));
  excavator.use(express.static(path.join(root, 'assets')));
  excavator.use(express.static(path.join(root, 'vendors')));
};
