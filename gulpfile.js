var gulp = require('gulp');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')();

gulp.task('clean', function (cb) {
  require('del')(['dist/*', '.tmp'], cb);
});

gulp.task('less', function () {
  return gulp.src('assets/css/*.less')
    .pipe($.less())
    .pipe(gulp.dest('.tmp/css'));
});

gulp.task('compile:less', function () {
  return gulp.src('assets/css/*.less').
    pipe($.less({ cleancss: true })).
    pipe(gulp.dest('.tmp/css'));
});

function browserify (src, dest) {
  return gulp.src(src).pipe($.browserify({
    basedir: '.'
  })).pipe(gulp.dest(dest));
}

gulp.task('browserify', function () {
  browserify('assets/js/scheme/scheme.js', '.tmp/js/scheme');
  browserify('assets/js/misc/misc.js', '.tmp/js/misc');
  browserify('assets/js/func/scheme.js', '.tmp/js/func');
});

function dump (src, dest, root) {
  return gulp.src(src).
    pipe($.replace(/^\s+/mg, '')).
    pipe($.angularTemplatecache('templates.js', {
      root: root,
      module: 'excavator'
    })).
    pipe(gulp.dest(dest));
}

gulp.task('dump:public', function () {
  return dump('views/public/*.html', '.tmp/public', '/public/');
});

gulp.task('dump:manager', function () {
  var src = ['views/manager/**/*.html', '!views/manager/index.html'];
  return dump(src, '.tmp/manager', '/manager/');
});

gulp.task('dump:control', function () {
  var src = ['views/control/**/*.html', '!views/control/index.html'];
  return dump(src, '.tmp/control', '/control/');
});

gulp.task('copy:json', function () {
  gulp.src('lib/**/*.json').pipe(gulp.dest('dist/public'));
  gulp.src('lib/**/*.json').pipe(gulp.dest('dist/manager'));
  gulp.src('lib/**/*.json').pipe(gulp.dest('dist/control'));
});

gulp.task('copy:fonts', function () {
  gulp.src('vendors/css/*.woff').pipe(gulp.dest('dist/public'));
  gulp.src('vendors/css/*.woff').pipe(gulp.dest('dist/manager'));
  gulp.src('vendors/css/*.woff').pipe(gulp.dest('dist/control'));
});

function compile (src, dest) {
  var assets = $.useref.assets();
  var jsFilter = $.filter(['*.js', '!0.*.js']);
  return gulp.src(src).
    pipe($.preprocess({context: {build: true}})).
    pipe(assets).
    pipe(jsFilter).
    pipe($.browserify({
      basedir: '.'
    })).
    pipe($.uglify()).
    pipe(jsFilter.restore()).
    pipe(assets.restore()).
    pipe($.useref()).
    pipe(gulp.dest(dest));
}

gulp.task('compile:public', function () {
  return compile('views/index.html', 'dist/public');
});

gulp.task('compile:manager', function () {
  return compile('views/manager/index.html', 'dist/manager');
});

gulp.task('compile:control', function () {
  return compile('views/control/index.html', 'dist/control');
});

gulp.task('build', function (done) {
  runSequence(
    [ 'clean' ],
    [ 'dump:public',    'dump:manager',    'dump:control',
      'copy:json',      'copy:fonts',      'compile:less'    ],
    [ 'compile:public', 'compile:manager', 'compile:control' ],
    done
  );
});

gulp.task('prod', function () {
  var gutil = require('gulp/node_modules/gulp-util');
  var errLogger = function () {
    gutil.log(gutil.colors.red.apply(undefined, arguments));
  };
  var excavator = $.express2('excavator.js', gutil.log, errLogger);
  excavator.env = 'production';
  excavator.run();
});

gulp.task('watch', function () {
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
    gulp.start('browserify');
    excavator.run();
    setTimeout(function () {
      excavator.notify(file);
    }, 1000);
  });

  gulp.watch([
    'assets/**/*.js'
  ]).on('change', function (file) {
    gulp.start('browserify');
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

gulp.task('default', function (done) {
  runSequence(
    [ 'clean' ],
    [ 'less', 'browserify' ],
    [ 'watch' ],
    done
  );
});
