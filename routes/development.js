var fs = require('fs');
var path = require('path');
var livereload = require('connect-livereload');

function serveThisFileOnly (path) {
  return function (req, res, next) {
    try {
      fs.createReadStream(path).pipe(res);
    } catch (e) {
      next();
    }
  }
}

module.exports = function developmentConfigs (express, excavator) {
  var root = excavator.get('root');
  var environment = excavator.get('environment');

  var Static = express.static;

  Static.mime.define({'text/javascript': ['js']});

  if (environment === 'development') {
    excavator.use(Static(path.join(root, '.tmp')));
    excavator.use(Static(path.join(root, 'lib')));
    excavator.use(Static(path.join(root, 'assets')));
    excavator.use(Static(path.join(root, 'vendors')));

    var blank = new Buffer(
      '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgU' +
      'GCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAR' +
      'EA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=', 'base64');
    excavator.use(
      '/uploads',
      Static(path.join(root, 'usercontent', 'uploads')),
      function (req, res, next) {
      res.set({'Content-Type': 'image/jpeg', 'Content-Length': blank.length});
      res.end(blank);
    });

    excavator.use(livereload({ port: 35729 }));
  }

  var views = path.join(root, 'views');

  if (environment === 'test') {
    views = path.join(root, 'dist');
  }

  excavator.use(function (req, res, next) {
    switch (req.hostname) {
    case 'control':
    case 'localhost':
      return Static(path.join(views, 'control')).apply(Static, arguments);
    case 'manager':
      return Static(path.join(views, 'manager')).apply(Static, arguments);
    default:
      return Static(path.join(views, 'public')).apply(Static, arguments);
    }
  });

  excavator.use(Static(path.join(views, 'vendors')));

  excavator.use(function (req, res, next) {
    switch (req.hostname) {
    case 'control':
    case 'localhost':
      var controlIndex = path.join(views, 'control', 'index.html');
      return serveThisFileOnly(controlIndex).apply(express, arguments);
    case 'manager':
      var managerIndex = path.join(views, 'manager', 'index.html');
      return serveThisFileOnly(managerIndex).apply(express, arguments);
    default:
      var defaultIndex = path.join(views, 'public', 'index.html');
      return serveThisFileOnly(defaultIndex).apply(express, arguments);
    }
  });
};
