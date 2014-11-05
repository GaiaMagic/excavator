var fs = require('fs');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var livereload = require('connect-livereload');

mongoose.connect('mongodb://localhost/excavator', function () {
  console.log('mongoose is running');
});

var excavator = express();

excavator.set('port', 3000);
excavator.use(livereload({ port: 35729 }));
express.static.mime.define({'text/javascript': ['js']});
excavator.use(express.static(path.join(__dirname, 'dist')));
excavator.use(express.static(path.join(__dirname, 'views')));
excavator.use(express.static(path.join(__dirname, 'assets')));
excavator.use(express.static(path.join(__dirname, 'vendors')));

excavator.use('/forms', require('./routes/forms'));

excavator.use(function (req, res, next) {
  try {
    fs.createReadStream(path.join(__dirname, 'views', 'index.html')).pipe(res);
  } catch (e) {
    next();
  }
});

excavator.use(require('./routes/errors'));

excavator.listen(excavator.get('port'), function () {
  console.log('excavator is listening on port ' + excavator.get('port'));
});
