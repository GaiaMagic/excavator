var environment = process.env.NODE_ENV;
if (['development', 'production', 'test'].indexOf(environment) === -1) {
  process.env.NODE_ENV = 'development';
  environment = process.env.NODE_ENV;
}

var mongoDB = 'localhost';
var mongoDBAddr = process.env.DB_PORT_27017_TCP_ADDR;
var mongoDBPort = process.env.DB_PORT_27017_TCP_PORT;
if (mongoDBAddr && mongoDBPort) {
  mongoDB = mongoDBAddr + ':' + mongoDBPort;
}
mongoDB = 'mongodb://' + mongoDB + '/excavator'

var mongoose = require('mongoose');
mongoose.connect(mongoDB, function (err) {
  if (err) {
    console.error('Failed to connect to MongoDB.',
                  'Have you started the service?');
    return;
  }
  console.log('MongoDB is running: ' + mongoDB);

  var Admin = require('./models/admin');
  var defaultAdmin = 'caiguanhao';
  Admin.register(defaultAdmin, '123456').then(function () {
    console.log('New admin has been created: ' + defaultAdmin);
  }, function () {
    console.log('Admin already registered: ' + defaultAdmin);
  });

  var Manager = require('./models/manager');
  var defaultManager = 'newyork';
  Manager.register(defaultManager, '123456').then(function () {
    console.log('New manager has been created: ' + defaultManager);
  }, function () {
    console.log('Manager already registered: ' + defaultManager);
  });
});

var excavator = require('./routes');

excavator.set('port', 3000);

excavator.listen(excavator.get('port'), function () {
  console.log('Excavator is listening on port ' + excavator.get('port') +
    ' in ' + environment + ' mode.');
  console.log('Administrator interface: http://localhost:' +
    excavator.get('port') + '/control/login')
});
