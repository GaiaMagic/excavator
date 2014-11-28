var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

var quality = 80;
var sizes = [
  { width: 100, height: 100 },
  // { width: 500, height: undefined },
  { width: undefined, height: 300 }
];
var suffixes = sizes.map(function (size) {
  return '_' + (size.width || 0) + 'x' + (size.height || 0);
});

function saveFile (base64) {
  if (typeof base64 !== 'string') return false;

  var comma = base64.indexOf(',');
  var prefix = base64.substr(0, comma + 1);
  if (prefix === '') return false;

  var data = new Buffer(base64.substr(comma + 1), 'base64');

  var shasum = crypto.createHash('sha1');
  shasum.update(data);
  var hash = shasum.digest('hex');

  var dir = path.join('uploads', hash[0], hash[1]);

  var root = process.env.USERCONTENT_ROOT_DIR || '';
  var realDir = path.join(root, '/usercontent', dir);

  var format = 'jpg';
  if (prefix.indexOf('png') > -1) format = 'png';

  processImage(realDir, hash, format, data);

  return {
    dir: '/' + dir,
    filename: hash,
    format: format,
    suffixes: suffixes
  };
}

function processImage (dir, filename, format, data) {
  return Q.nfcall(mkdirp, dir, undefined).then(function () {
    var orig = path.join(dir, filename + '.' + format);
    return Q.nfcall(fs.writeFile, orig, data, undefined);
  }).then(function () {
    var sharp = require('sharp');
    return Q.all(sizes.map(function (size, index) {
      var resized = path.join(dir, filename + suffixes[index] + '.' + format);
      return sharp(data).
             resize(size.width, size.height).
             quality(quality).
             toFile(resized);
    }));
  }).catch(function (e) {
    console.error(e);
    return e;
  });
}

module.exports = saveFile;
