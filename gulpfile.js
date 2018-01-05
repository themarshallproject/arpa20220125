var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var livereload = require('gulp-livereload');
var firstOpenPort = require('first-open-port');

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
  });
});


gulp.task('watch', function() {
  gulp.watch(['src/*.scss'], gulp.series('scss:dev'));
  gulp.watch(['src/*.js'], gulp.series('js:dev'));
  gulp.watch(['src/graphic.html'], gulp.series('html:dev'));
});


gulp.task('scss:dev', function() {
  return sass('src/graphic.scss')
    .on('error', sass.logError)
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


gulp.task('default', gulp.series( 'server','watch'));

