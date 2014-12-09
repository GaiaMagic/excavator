var path = require('path');
var express = require('express');
var environment = process.env.NODE_ENV;

var excavator = express();
excavator.set('root', path.join(__dirname, '..'));
excavator.set('environment', environment);
excavator.use('/backend', require('./backend'));
excavator.use('/public', require('./public'));
excavator.use('/health-check', require('./health-check'));

if (environment === 'development' || environment === 'test') {
  var development = require('./development');
  development(express, excavator);
}

excavator.use(require('./errors'));

module.exports = excavator;
