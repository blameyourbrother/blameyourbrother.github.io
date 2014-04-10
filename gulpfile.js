var gulp = require('gulp');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var build = require('./lib/gulp-build');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var hbsHelpers = require('./lib/hbs-helpers');
var partialsConfig = [];
var layouts = {};

vendorFiles = [
  './bower_components/slick-carousel/slick/fonts/*',
  './bower_components/slick-carousel/slick/slick.css',
  './bower_components/slick-carousel/slick/slick.min.js',
  './bower_components/slick-carousel/slick/ajax-loader.gif',
  './bower_components/jquery/dist/jquery.min.js'
];

gulp.task('default', ['clean', 'styles', 'buildPartialsConfig', 'html', 'vendor', 'server'], function () {
  gulp.watch('./src/styles/**/*.styl', ['styles']);
  gulp.watch(['./lib/hbs-helpers.js', './src/partials/*.hbs', '.src/layouts/*.hbs'], ['buildPartialsConfig', 'rehtml']);
  gulp.watch('./src/templates/**/*.hbs', ['rehtml']);
  gulp.watch('./src/data/*.json', ['rehtml']);
});

gulp.task('vendor', function () {
  gulp.src(vendorFiles, {base: 'bower_components'})
    .pipe(gulp.dest('./assets/vendor'))
});

gulp.task('clean', function () {
  gulp.src(['./assets/css', './*.html', './work/*.html', './assets/vendor'], {read: false})
    .pipe(clean());
});

gulp.task('styles', function () {
  gulp.src('./src/styles/main.styl')
    .pipe(plumber())
    .pipe(stylus({
      paths: [path.resolve(__dirname, 'bower_components'), path.resolve(__dirname, 'node_modules')],
      set: ['compress', 'linenos']
    }))
    .pipe(gulp.dest('./assets/css'))
    .pipe(connect.reload());
});

gulp.task('rehtml', ['workHTML', 'otherHTML'], function () {
  gulp.src(['./*.html', './work/*.html'])
    .pipe(connect.reload());
});

gulp.task('html', ['workHTML', 'otherHTML']);

gulp.task('workHTML', function () {
  var data = JSON.parse(fs.readFileSync('./src/data/data.json'));
  var workData = JSON.parse(fs.readFileSync('./src/data/work.json'));
  var options = {
    helpers: hbsHelpers,
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, 'src/layouts/default.hbs'), {encoding: 'utf8'})
  };

  _.each(workData, function (workDatum, index) {
    data.work = workDatum;
    gulp.src('./src/templates/work.hbs')
      .pipe(plumber())
      .pipe(build(data, options))
      .pipe(rename({
        basename: workDatum.slug,
        extname: '.html'
      }))
      .pipe(gulp.dest('./work/'));
  });
});

gulp.task('otherHTML', function () {
  var data = JSON.parse(fs.readFileSync('./src/data/data.json'));
  var workData = JSON.parse(fs.readFileSync('./src/data/work.json'));
  data.work = workData;
  var options = {
    helpers: hbsHelpers,
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, 'src/layouts/default.hbs'), {encoding: 'utf8'})
  };

  gulp.src(['./src/templates/**/*.hbs', '!./src/templates/work.hbs'])
    .pipe(plumber())
    .pipe(build(data, options))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('buildPartialsConfig', function () {
  var partialsList = fs.readdirSync(path.resolve(__dirname, 'src/partials'));
  for (var i = 0, j = partialsList.length; i < j; i++) {
    var filename = partialsList[i];
    partialsConfig.push({
      name: path.basename(filename, '.hbs'),
      tpl: fs.readFileSync(path.join(__dirname, 'src/partials', filename), {encoding: 'utf8'})
    });
  }
});

gulp.task('server', connect.server({
  root: [__dirname],
  port: 1337,
  livereload: true,
  open: {
    file: 'index.html',
    browser: 'Google Chrome'
  }
}));
