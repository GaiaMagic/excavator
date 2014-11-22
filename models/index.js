var mongoose = require('mongoose');

function connect (address) {
  mongoose.connect(address, function (err) {
    if (err) {
      console.error('Failed to connect to MongoDB (' + address + ').',
                    'Have you started the service?');
      return;
    }
    console.log('MongoDB is running: ' + address);

    var Admin = require('./admin');
    var defaultAdmin = 'caiguanhao';
    Admin.register(defaultAdmin, '123456').then(function () {
      console.log('New admin has been created: ' + defaultAdmin);
    }, function () {
      console.log('Admin already registered: ' + defaultAdmin);
    });

    var Manager = require('./manager');
    var defaultManager = 'newyork';
    Manager.register(defaultManager, '123456').then(function () {
      console.log('New manager has been created: ' + defaultManager);
    }, function () {
      console.log('Manager already registered: ' + defaultManager);
    });
  });
};

module.exports = connect;
