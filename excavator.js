var environment = process.env.NODE_ENV;
if (['development', 'production', 'test'].indexOf(environment) === -1) {
  process.env.NODE_ENV = 'development';
  environment = process.env.NODE_ENV;
}

var mongoose = require('mongoose');
var Admin = require('./models/admin');
var defaultAdmin = 'caiguanhao';
mongoose.connect('mongodb://localhost/excavator', function (err) {
  if (err) {
    console.error('Failed to connect to MongoDB.',
                  'Have you started the service?');
    return;
  }
  console.log('MongoDB is running.');

  Admin.register(defaultAdmin, '123456').then(function () {
    console.log('New admin has been created: ' + defaultAdmin);
  }, function () {
    console.log('Already registered: ' + defaultAdmin);
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
