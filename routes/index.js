var path = require('path');
var express = require('express');
var environment = process.env.NODE_ENV;

var excavator = express();
var root = path.join(__dirname, '..');

excavator.use('/backend', require('./backend'));
excavator.use('/public', require('./public'));


var development = require('./development');
var testProduction = require('./test-production');

if (environment === 'development') {
  development(express, excavator, root);
}

if (environment === 'test') {
  testProduction(express, excavator, root);
}

excavator.use(require('./errors'));

module.exports = excavator;
