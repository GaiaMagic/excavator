var environment = process.env.NODE_ENV;
if (['development', 'production', 'test'].indexOf(environment) === -1) {
  process.env.NODE_ENV = 'development';
  environment = process.env.NODE_ENV;
}

if (environment === 'development') {
  process.env.USERCONTENT_ROOT_DIR = __dirname;
}

// this connects to mongodb
require('./models').connect();

var excavator = require('./routes');
excavator.set('port', 3000);
excavator.set('address', '0.0.0.0');
if (environment === 'development') {
  excavator.set('address', 'localhost');
}
excavator.listen(excavator.get('port'), excavator.get('address'), function () {
  console.log('Excavator is listening on port ' + excavator.get('port') +
    ' in ' + environment + ' mode.');
  console.log('Administrator interface: http://' + excavator.get('address') +
    ':' + excavator.get('port') + '/login')
});
