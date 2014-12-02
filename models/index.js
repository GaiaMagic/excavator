var Q = require('q');
var mongoose = require('mongoose');

var DOCKER_FIG_SERVICE_NAME = 'db';

module.exports = {};
module.exports.connect = connect;
module.exports.connectPromise = connectPromise;
module.exports.disconnect = disconnect;

function getMongoDBServiceAddress (service) {
  var prefix = service.toUpperCase() + '_PORT_27017_TCP_';
  var mongoDBAddr = process.env[prefix + 'ADDR'];
  var mongoDBPort = process.env[prefix + 'PORT'];
  if (mongoDBAddr && mongoDBPort) {
    return mongoDBAddr + ':' + mongoDBPort;
  }
}

function connectPromise (address) {
  var deferred = Q.defer();
  if (!address) {
    address = getMongoDBServiceAddress(DOCKER_FIG_SERVICE_NAME) || 'localhost';
    address = 'mongodb://' + address + '/excavator';
  }
  mongoose.connect(address, function (err) {
    if (err) {
      err.address = address;
      return deferred.reject(err);
    }
    deferred.resolve(address);
  });
  return deferred.promise;
}

function connect (address, options) {
  options = options || {};
  connectPromise(address).then(function () {
    console.log('MongoDB is running: ' + address);
  }, function (err) {
    console.error('Failed to connect to MongoDB (' + err.address + ').',
                  'Have you started the service?');
  }).then(function () {
    if (options.noAutoCreateUsers !== true) {
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
    }
  });
}

function disconnect () {
  mongoose.disconnect();
}
