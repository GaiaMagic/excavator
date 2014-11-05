var mongoose = require('mongoose');
var Admin = require('./models/admin');
var defaultAdmin = 'caiguanhao';
mongoose.connect('mongodb://localhost/excavator', function () {
  console.log('mongoose is running');

  Admin.register(defaultAdmin, '123456').then(function () {
    console.log('created new admin: ' + defaultAdmin);
  }, function () {
    console.log('already registered: ' + defaultAdmin);
  });
});

var excavator = require('./routes');

excavator.set('port', 3000);

excavator.listen(excavator.get('port'), function () {
  console.log('excavator is listening on port ' + excavator.get('port'));
});
