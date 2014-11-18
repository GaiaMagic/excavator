var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('clean', function (cb) {
  require('del')(['dist'], cb);
});

gulp.task('less', function () {
  return gulp.src('assets/css/*.less')
    .pipe($.less())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function () {
  gulp.
    src('assets/js/scheme/scheme.js').
    pipe($.browserify()).
    pipe(gulp.dest('dist/js/scheme'));

  gulp.
    src('assets/js/misc/misc.js').
    pipe($.browserify()).
    pipe(gulp.dest('dist/js/misc'));

  gulp.
    src('assets/js/func/scheme.js').
    pipe($.browserify()).
    pipe(gulp.dest('dist/js/func'));
});

gulp.task('watch', ['less', 'scripts'], function () {
  var gutil = require('gulp/node_modules/gulp-util');
  var errLogger = function () {
    gutil.log(gutil.colors.red.apply(undefined, arguments));
  };
  var excavator = $.express2('excavator.js', gutil.log, errLogger);
  excavator.env = process.env.NODE_ENV;
  excavator.run();

  gulp.watch([
    'excavator.js',
    'models/**/*.js',
    'routes/**/*.js'
  ]).on('change', function (file) {
    gulp.start('scripts');
    excavator.run();
    setTimeout(function () {
      excavator.notify(file);
    }, 1000);
  });

  gulp.watch([
    'assets/**/*.js'
  ]).on('change', function (file) {
    gulp.start('scripts');
    excavator.notify(file);
  });

  gulp.watch([
    'assets/**/*.less'
  ]).on('change', function (file) {
    gulp.start('less');
    excavator.notify(file);
  });

  gulp.watch([
    'vendors/**/*.js',
    'views/**/*.html'
  ]).on('change', function (file) {
    excavator.notify(file);
  });
});
