var path = require('path');
var express = require('express');
var environment = process.env.NODE_ENV;

var excavator = express();
var root = path.join(__dirname, '..');

var development = require('./development');
var production = require('./production');

if (environment === 'development') {
  development.static(express, excavator, root);
}

if (environment === 'production') {
  production.static(express, excavator, root);
}

excavator.use('/backend', require('./backend'));

excavator.use('/public', require('./public'));

if (environment === 'development') {
  development.angular(express, excavator, root);
}

if (environment === 'production') {
  production.angular(express, excavator, root);
}

excavator.use(require('./errors'));

module.exports = excavator;
