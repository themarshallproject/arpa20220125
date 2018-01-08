var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var firstOpenPort = require('first-open-port');
var opn = require('opn');
var log = require('fancy-log');
var notify = require('gulp-notify');
var request = require('request');
var fs = require('fs');

var server = require('./server.js');
var config = require('./config.json');


function startServer() {
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
}


function openBrowser() {
  opn('http://localhost:' + serverPort);
}


function styles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function copyHtml() {
  return gulp.src('src/graphic.html')
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function scripts() {
  return gulp.src('src/graphic.js')
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function watch() {
  gulp.parallel(copyHtml, styles, scripts)();
  gulp.watch(['src/*.scss'], styles);
  gulp.watch(['src/*.js'], scripts);
  return gulp.watch(['src/graphic.html'], copyHtml);
}


function endrunDeploy(done) {
  var host = "https://www.themarshallproject.org";
  var endpoint = "/admin/api/v1/update-" + config.destination
  request.post({
    url: host + endpoint,
    json: true,
    body: {
      token: 'TODO',
      html: fs.readFileSync('dist/graphic.html')
    }
  }, function(error, response, body) {
    if (error) {
      log.error(error);
    }

    if (response && response.statusCode !== 200) {
      log.error(response.statusCode + ': ' + body.error);
      done(body.error);
    }

    done();
  });
}


gulp.task('default', gulp.series(startServer, watch));
gulp.task('deploy:endrun', endrunDeploy);

