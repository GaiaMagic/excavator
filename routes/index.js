var path = require('path');
var express = require('express');
var environment = process.env.NODE_ENV;

var excavator = express();
var root = path.join(__dirname, '..');

if (environment === 'development') {
  require('./development')(express, excavator, root);
}

excavator.use('/backend', require('./backend'));

excavator.use('/public', require('./public'));

var serveThisFileOnly = require('./serve-only');

var controlIndex = path.join(root, 'views', 'control', 'index.html');
excavator.use('/control', serveThisFileOnly(controlIndex));

var defaultIndex = path.join(root, 'views', 'index.html');
excavator.use(serveThisFileOnly(defaultIndex));

excavator.use(require('./errors'));

module.exports = excavator;
