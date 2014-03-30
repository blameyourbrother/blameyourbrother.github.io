var gulp = require('gulp');
var clean = require('gulp-clean');
var handlebars = require('handlebars');
var compileHandlebars = require('gulp-compile-handlebars');
var stylus = require('gulp-stylus');
var plumber = require('gulp-plumber');
var path = require('path');

gulp.task('default', ['clean', 'styles'], function () {
  gulp.watch('./src/styles/**/*.styl', ['styles']);
});

gulp.task('clean', function () {
  gulp.src('./assets/css', {read: false})
    .pipe(clean());
});

gulp.task('styles', function () {
  gulp.src('./src/styles/main.styl')
    .pipe(plumber())
    .pipe(stylus({
      paths: [path.resolve(__dirname, 'bower_components'), path.resolve(__dirname, 'node_modules')],
      set: ['compress', 'linenos']
    }))
    .pipe(gulp.dest('./assets/css'));
});
