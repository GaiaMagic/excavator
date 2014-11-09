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

excavator.use('/backend', require('./backend'));

var serveThisFileOnly = require('./serve-only');

var controlIndex = path.join(root, 'views', 'control', 'index.html');
excavator.use('/control', serveThisFileOnly(controlIndex));

var defaultIndex = path.join(root, 'views', 'index.html');
excavator.use(serveThisFileOnly(defaultIndex));

excavator.use(require('./errors'));

module.exports = excavator;
