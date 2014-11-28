var environment = process.env.NODE_ENV;
if (['development', 'production', 'test'].indexOf(environment) === -1) {
  process.env.NODE_ENV = 'development';
  environment = process.env.NODE_ENV;
}

if (environment === 'development') {
  process.env.USERCONTENT_ROOT_DIR = __dirname;
}

var connect2MongoDB = require('./models');
var excavator = require('./routes');

var address = getFigMongoDBServiceAddress('db') || 'localhost';

connect2MongoDB('mongodb://' + address + '/excavator');

excavator.set('port', 3000);

excavator.listen(excavator.get('port'), function () {
  console.log('Excavator is listening on port ' + excavator.get('port') +
    ' in ' + environment + ' mode.');
  console.log('Administrator interface: http://localhost:' +
    excavator.get('port') + '/login')
});

function getFigMongoDBServiceAddress (service) {
  var prefix = service.toUpperCase() + '_PORT_27017_TCP_';
  var mongoDBAddr = process.env[prefix + 'ADDR'];
  var mongoDBPort = process.env[prefix + 'PORT'];
  if (mongoDBAddr && mongoDBPort) {
    return mongoDBAddr + ':' + mongoDBPort;
  }
}
