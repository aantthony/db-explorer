'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var stylus     = require('gulp-stylus');
var source     = require('vinyl-source-stream');
var browserify = require('browserify');

var src = './client';   // Input files
var dist = './dist'; // Output files

var paths = {
  html    : src +'/index.html',
  scripts : src + '/scripts/index.js',
  styles  : src + '/styles/*.stylus',
  images  : src + '/images/**/*',
  other   : src + '/other/**/*'
};

gulp.task('html', function() {
  gulp.src(paths.html)
  .pipe(gulp.dest(dist));
});

gulp.task('images', function() {
  gulp.src(paths.images)
  .pipe(gulp.dest(dist + '/images'));
});

gulp.task('scripts', function() {
  browserify('./' + paths.scripts).bundle()
  .pipe(source('index.js'))
  .pipe(gulp.dest(dist + '/scripts'));
});

gulp.task('styles', function(){
  return gulp.src(paths.styles)
  .pipe(stylus())
  .pipe(gulp.dest(dist + '/styles/'));
});

gulp.task('lib.styles', function(){
  return gulp.src('./node_modules/contextmenu/contextmenu.css')
  .pipe(gulp.dest(dist + '/styles/'));
});

gulp.task('watch', function () {
  gulp.watch(paths.other, ['other']);
  gulp.watch(paths.html, ['html']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(src + '/scripts/**/*.js', ['scripts']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.styles, ['styles']);
});

gulp.task('server', function () {
  var connect = require('connect');
  var http = require('http');

  var app = connect()
  .use(require('serve-static')(__dirname + '/dist'));

  var port = 12346;
  http.createServer(app).listen(port, function () {
    gutil.log('Development web server started on port', gutil.colors.cyan(port));
  });
});

gulp.task('build', ['scripts', 'images', 'styles', 'lib.styles', 'html'], function () {});
gulp.task('default', ['build', 'server', 'watch'], function() {});