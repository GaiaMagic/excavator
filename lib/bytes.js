// improved version of https://github.com/visionmedia/bytes.js

module.exports = function(size) {
  if (typeof size === 'number') return convert(size);

  var parts = size.match(/^([0-9.]+)\s*([KkMmGgTt])[Bb]?$/);
  if (!parts) return parseFloat(size);

  var n = parseFloat(parts[1]);
  var type = parts[2].toUpperCase();

  var map = {
    K: 1 << 10,
    M: 1 << 20,
    G: 1 << 30,
    T: ((1 << 30) * 1024)
  };

  return map[type] * n;
};

function convert (b) {
  var TB = ((1 << 30) * 1024);
  var GB = 1 << 30;
  var MB = 1 << 20;
  var KB = 1 << 10;
  var abs = Math.abs(b);
  if (abs >= TB) return (Math.round(b / TB * 100) / 100) + 'TB';
  if (abs >= GB) return (Math.round(b / GB * 100) / 100) + 'GB';
  if (abs >= MB) return (Math.round(b / MB * 100) / 100) + 'MB';
  if (abs >= KB) return (Math.round(b / KB * 100) / 100) + 'KB';
  return b + 'B';
}
