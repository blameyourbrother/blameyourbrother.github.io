var gulp = require('gulp');
var clean = require('gulp-clean');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var build = require('./lib/gulp-build');
var plumber = require('gulp-plumber');
var connect = require('gulp-connect');
var path = require('path');
var fs = require('fs');
var hbsHelpers = require('./lib/hbs-helpers');
var partialsConfig = [];
var layouts = {};

gulp.task('default', ['clean', 'styles', 'buildPartialsConfig', 'html', 'server'], function () {
  gulp.watch('./src/styles/**/*.styl', ['styles']);
  gulp.watch(['./lib/hbs-helpers.js', './src/partials/*.hbs', '.src/layouts/*.hbs'], ['buildPartialsConfig', 'html']);
  gulp.watch('./src/templates/**/*.hbs', ['html']);
  gulp.watch('./src/data/data.json', ['html']);
});

gulp.task('clean', function () {
  gulp.src('./assets/css', {read: false})
    .pipe(clean());
  gulp.src(['./**/*.html', '!/assets/**/*.html', '!/src/**/*.html', '!/bower_components/**/*.html', '!/node_modules/**/*.html'])
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

gulp.task('html', function () {
  var data = JSON.parse(fs.readFileSync('./src/data/data.json'));
  var options = {
    partials: partialsConfig,
    layout: fs.readFileSync(path.join(__dirname, 'src/layouts/default.hbs'), {encoding: 'utf8'})
  };

  gulp.src('./src/templates/**/*.hbs')
    .pipe(plumber())
    .pipe(build(data, options))
    .pipe(rename({
      extname: '.html'
    }))
    .pipe(gulp.dest('./'))
    .pipe(connect.reload());
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
