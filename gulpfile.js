var gulp        = require('gulp');
var runSequence = require('run-sequence');
var $           = require('gulp-load-plugins')();

var info = {
  git: {
    headCommit:    process.env.GIT_HEAD_COMMIT,
    headDate:      process.env.GIT_HEAD_DATE,
    headAuthor:    process.env.GIT_HEAD_AUTHOR,
    headFileCount: process.env.GIT_HEAD_FILE_COUNT
  }
};

var now = new Date();
var pad0 = function (n) { return n < 10 ? '0' + n : n; };
var VER = [
  now.getFullYear(),
  pad0(now.getMonth() + 1),
  pad0(now.getDate()),
  pad0(now.getHours()),
  pad0(now.getMinutes()),
  pad0(now.getSeconds())
].join('_');
var dist = 'dist/' + VER;
var MAX_REVS = 10; // maximum entries in /dist

if (!process.env.GIT_HEAD_COMMIT) {
  var exec = require('child_process').exec;
  var Q = require('q');
  Q.all([
    Q.nfcall(exec, 'git rev-parse HEAD'),
    Q.nfcall(exec, 'git --no-pager show --format="%ad" --quiet HEAD'),
    Q.nfcall(exec, 'git --no-pager show --format="%ae" --quiet HEAD'),
    Q.nfcall(exec, 'git ls-files | wc -l')
  ]).then(function (ret) {
    info.git.headCommit    = ret[0][0].trim();
    info.git.headDate      = ret[1][0].trim();
    info.git.headAuthor    = ret[2][0].trim();
    info.git.headFileCount = ret[3][0].trim();
  });
}

gulp.task('clean', function (cb) {
  require('del')(['.tmp'], cb);
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
  browserify('assets/js/scheme/scheme.js',      '.tmp/js/scheme');
  browserify('assets/js/misc/misc.js',          '.tmp/js/misc');
  browserify('assets/js/func/scheme.js',        '.tmp/js/func');
  browserify('assets/js/i18n/dictionary.js',    '.tmp/js/i18n');
  browserify('assets/js/manager/dictionary.js', '.tmp/js/manager');
  browserify('assets/js/public/dictionary.js',  '.tmp/js/public');
});

function dump (src, dest) {
  return gulp.src(src).
    pipe($.justReplace(/^\s+/mg, '')).
    pipe($.angularTemplatecache('templates.js', {
      root: '/',
      module: 'excavator'
    })).
    pipe(gulp.dest(dest));
}

gulp.task('dump:public', function () {
  var src = [
    'views/public/*.html',
    '!views/public/index.html',
    'views/vendors/*.html'
  ];
  return dump(src, '.tmp/public');
});

gulp.task('dump:manager', function () {
  var src = [
    'views/manager/**/*.html',
    '!views/manager/index.html',
    'views/vendors/pager.html'
  ];
  return dump(src, '.tmp/manager');
});

gulp.task('dump:control', function () {
  var src = [
    'views/control/**/*.html',
    '!views/control/index.html',
    'views/vendors/*.html'
  ];
  return dump(src, '.tmp/control');
});

gulp.task('copy:json', function () {
  gulp.src('lib/**/*.json').pipe(gulp.dest(dist + '/public'));
  gulp.src('lib/**/*.json').pipe(gulp.dest(dist + '/manager'));
  gulp.src('lib/**/*.json').pipe(gulp.dest(dist + '/control'));
});

gulp.task('copy:fonts', function () {
  gulp.src('vendors/css/*.woff').pipe(gulp.dest(dist + '/public'));
  gulp.src('vendors/css/*.woff').pipe(gulp.dest(dist + '/manager'));
  gulp.src('vendors/css/*.woff').pipe(gulp.dest(dist + '/control'));
});

gulp.task('copy:lazyloads', function () {
  gulp.src([
    'vendors/js/qrcode.min.js',
    'vendors/js/jquery-2.1.3.min.js',
    'vendors/js/dropdowns-enhancement.min.js'
  ]).pipe(gulp.dest(dist + '/public/js'));
});

function compile (src, dest) {
  var assets = $.useref.assets();
  var jsFilter = $.filter(['*.js', '!0.*.js']);
  var start = +new Date;

  var domain;
  if (dest.indexOf('public') > -1) {
    domain = require('./domains')[process.env.NODE_ENV];
  }
  var cdn = $.cdnizer({
    files: [ '**/*.css', '**/*.js' ],
    defaultCDNBase: domain ? (domain.cdn || '') : ''
  });

  return gulp.src(src).
    pipe($.preprocess({context: {build: true}})).
    pipe(assets).
    pipe(jsFilter).
    pipe($.browserify({
      basedir: '.'
    })).
    pipe($.uglify()).
    pipe(jsFilter.restore()).
    pipe($.rev()).
    pipe(assets.restore()).
    pipe($.useref()).
    pipe($.revReplace()).
    pipe(cdn).
    pipe($.justReplace([
      {
        search:      /%HEAD_COMMIT%/g,
        replacement: info.git.headCommit
      }, {
        search:      /%HEAD_AUTHOR%/g,
        replacement: info.git.headAuthor
      }, {
        search:      /%HEAD_DATE%/g,
        replacement: info.git.headDate
      }, {
        search:      /%HEAD_FILE_COUNT%/g,
        replacement: info.git.headFileCount
      }, {
        search:      /%DATE%/g,
        replacement: new Date
      }, {
        search:      /%TIME_USED%/g,
        replacement: function () {
          return (+new Date - start) / 1000 + ' s';
        }
      }
    ])).
    pipe(gulp.dest(dest));
}

gulp.task('compile:public', function () {
  return compile('views/public/index.html', dist + '/public');
});

gulp.task('compile:manager', function () {
  return compile('views/manager/index.html', dist + '/manager');
});

gulp.task('compile:control', function () {
  return compile('views/control/index.html', dist + '/control');
});

gulp.task('compress', function () {
  return gulp.src(dist + '/**').pipe($.gzip()).pipe(gulp.dest(dist));
});

gulp.task('link', function (done) {
  require('child_process').exec('ln -nfs ' + VER + ' dist/pending', done);
});

gulp.task('release', function (done) {
  require('child_process').exec('ln -nfs $(readlink dist/pending) dist/latest', done);
});

gulp.task('clean-dist', function (done) {
  var fs = require('fs');
  var dirsToDel = [];
  var dirs = fs.readdirSync('dist').filter(function (file) {
    return fs.lstatSync('dist/' + file).isDirectory();
  });
  dirs.sort();
  if (dirs.length > MAX_REVS) {
    dirsToDel = dirs.slice(0, dirs.length - MAX_REVS).map(function (dir) {
      return 'dist/' + dir;
    });
  }
  require('del')(dirsToDel, done);
});

gulp.task('build', function (done) {
  runSequence(
    [ 'clean'                                                ],
    [ 'dump:public',    'dump:manager',    'dump:control',
      'copy:json',      'copy:fonts',      'compile:less',
      'copy:lazyloads'                                       ],
    [ 'compile:public', 'compile:manager', 'compile:control' ],
    [ 'compress',       'link'                               ],
    [ 'clean-dist'                                           ],
    done
  );
});

gulp.task('production-test', ['build'], function () {
  var gutil = require('gulp/node_modules/gulp-util');
  var errLogger = function () {
    gutil.log(gutil.colors.red.apply(undefined, arguments));
  };
  var excavator = $.express2('excavator.js', gutil.log, errLogger);
  excavator.env = 'test';
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
    'lib/**/*.js',
    'lib/i18n/backend.*.json',
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
    'assets/**/*.js',
    'lib/i18n/*.json'
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

gulp.task('gettext', function () {
  var gettext = require('a5r-i18n-gettext');

  gulp.src([
    'views/control/**/*.html',
    'views/vendors/**/*.html',
    'assets/js/admin/*.js',
    'assets/js/form/*.js',
    'assets/js/scheme/bulk.js',
    'assets/js/scheme/file.js',
    'assets/js/func/panic.js',
    'assets/js/shared/*.js',
    'assets/js/tpl/*.js',
    'lib/timeago.js',
    'lib/hierarchies/hierarchies.js',
    'models/schemes/*.js',
    'models/general-validators.js',
    'models/status.js'
  ]).pipe(gettext({
    file: 'lib/i18n/dictionary.%code%.json',
    langs: ['zh']
  })).pipe(gulp.dest('.'));

  gulp.src([
    'views/manager/**/*.html',
    'views/vendors/**/*.html',
    'assets/js/func/panic.js',
    'assets/js/manager/nav.js',
    'assets/js/shared/*.js',
    'lib/timeago.js',
    'models/status.js'
  ]).pipe(gettext({
    file: 'lib/i18n/dictionary.manager.%code%.json',
    langs: ['zh']
  })).pipe(gulp.dest('.'));

  gulp.src([
    'models/schemes/*.js',
    'views/vendors/**/*.html',
    'assets/js/public/form.js',
    'assets/js/scheme/bulk.js',
    'assets/js/scheme/file.js',
    'assets/js/func/panic.js'
  ]).pipe(gettext({
    file: 'lib/i18n/dictionary.public.%code%.json',
    langs: ['zh'],
    excludeRootKeys: ['schemes', 'hierarchy', 'validator']
  })).pipe(gulp.dest('.'));

  gulp.src([
    'models/*.js',
    'models/schemes/file.js',
    'models/schemes/hierarchy.js',
    '!models/general-validators.js',
    '!models/status.js',
    'routes/**/*.js'
  ]).pipe(gettext({
    file: 'lib/i18n/backend.%code%.json',
    langs: ['zh'],
    excludeRootKeys: ['schemes', 'template', 'forms']
  })).pipe(gulp.dest('.'));
});
