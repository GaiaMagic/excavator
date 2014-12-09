var os = require('os');

function getLastPart(ipaddr) {
  return +ipaddr.split('.').slice(-1).join('');
}

function getAddresses () {
  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(getLastPart(address.address));
      }
    }
  }
  return addresses;
}

module.exports = function (req, res, next) {
  res.send({
    addresses: getAddresses()
  });
};
