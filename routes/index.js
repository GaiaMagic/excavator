var fs = require('fs');
var path = require('path');
var express = require('express');
var livereload = require('connect-livereload');

var excavator = express();
var root = path.join(__dirname, '..');

excavator.use(livereload({ port: 35729 }));
express.static.mime.define({'text/javascript': ['js']});
excavator.use(express.static(path.join(root, 'dist')));
excavator.use(express.static(path.join(root, 'views')));
excavator.use(express.static(path.join(root, 'assets')));
excavator.use(express.static(path.join(root, 'vendors')));

var needsTokenAuth = require('./token-auth');

excavator.use('/admins', require('./admins'));
excavator.use('/forms', needsTokenAuth, require('./forms'));

excavator.use(function (req, res, next) {
  try {
    fs.createReadStream(path.join(root, 'views', 'index.html')).pipe(res);
  } catch (e) {
    next();
  }
});

excavator.use(require('./errors'));

module.exports = excavator;
