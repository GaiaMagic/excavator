var Q       = require('q');
var fs      = require('fs');
var path    = require('path');
var mkdirp  = require('mkdirp');
var crypto  = require('crypto');

var quality = 80;

function saveFileAsAdminContent (base64) {
  return saveFile(base64, '/admincontent', undefined);
}

function saveFileAsUserContent (base64) {
  var sizes   = [
    { width: 100, height: 100 },
    { width: undefined, height: 300 }
  ];
  return saveFile(base64, '/usercontent', sizes);
}

function saveFile (base64, dest, sizes) {
  if (typeof base64 !== 'string') return false;
  if (!(sizes instanceof Array)) sizes = [];

  var comma = base64.indexOf(',');
  var prefix = base64.substr(0, comma + 1);
  if (prefix === '') return false;

  var data = new Buffer(base64.substr(comma + 1), 'base64');

  var shasum = crypto.createHash('sha1');
  shasum.update(data);
  var hash = shasum.digest('hex');

  var dir = path.join('uploads', hash[0], hash[1]);

  var root = process.env.USERCONTENT_ROOT_DIR || '';
  var realDir = path.join(root, dest, dir);

  var format = 'jpg';
  if (prefix.indexOf('png') > -1) format = 'png';

  var suffixes = sizes.map(function (size) {
    return '_' + (size.width || 0) + 'x' + (size.height || 0);
  });

  processImage(realDir, hash, format, data, sizes, suffixes);

  return {
    dir: '/' + dir,
    filename: hash,
    format: format,
    suffixes: suffixes
  };
}

function processImage (dir, filename, format, data, sizes, suffixes) {
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

module.exports = {};
module.exports.saveFile = saveFile;
module.exports.saveFileAsAdminContent = saveFileAsAdminContent;
module.exports.saveFileAsUserContent = saveFileAsUserContent;
