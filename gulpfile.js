var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var firstOpenPort = require('first-open-port');
var opn = require('opn');
var notify = require('gulp-notify');

var server = require('./server.js');


gulp.task('server', function() {
  var serverPort, lrPort;
  return firstOpenPort(3000).then(function(port) {
    serverPort = port;
    return firstOpenPort(35729);
  }).then(function(port) {
    lrPort = port;
  }).then(function() {
    var app = server({ port: serverPort, lrPort: lrPort });
    livereload.listen({ port: lrPort });
  }).then(function() {
    opn('http://localhost:' + serverPort);
  });
});


gulp.task('scss:dev', function() {
  return gulp.src('src/graphic.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});


gulp.task('html:dev', function() {
  return gulp.src('src/graphic.html')
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});


gulp.task('js:dev', function() {
  return gulp.src('src/graphic.js')
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});


gulp.task('watch', gulp.parallel('html:dev', 'scss:dev', 'js:dev'), function() {
  gulp.watch(['src/*.scss'], gulp.series('scss:dev'));
  gulp.watch(['src/*.js'], gulp.series('js:dev'));
  return gulp.watch(['src/graphic.html'], gulp.series('html:dev'));
});



gulp.task('default', gulp.series('server', 'watch'));

