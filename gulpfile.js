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
var credentials = require('./credentials.js');


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

  credentials.ensureCredentials(function(creds) {
    var host = "http://localhost:7000";
    var endpoint = "/admin/api/v2/deploy-gfx";
    request.post({
      url: host + endpoint,
      json: true,
      body: {
        token: creds['gfx-endrun'],
        type: 'graphic',
        slug: config.slug,
        html: fs.readFileSync('dist/graphic.html')
      }
    }, function(error, response, body) {
      if (error) {
        log.error(error);
      }

      if (response.statusCode === 403) {
        log('Your API key is invalid! You can get a new one at https://themarshallproject.org/admin/api_keys\n which you can update here by running:\n\n\tgulp credentials:endrun\n\n');
      }

      if (response && response.statusCode !== 200) {
        log.error(response.statusCode + ': ' + body.error);
        done(body.error);
      }

      log(body)

      done();
    });
  });

}


gulp.task('default', gulp.series(startServer, watch));
gulp.task('deploy:endrun', endrunDeploy);
gulp.task('credentials', credentials.ensureCredentials);
gulp.task('clearcreds', credentials.clearServicePasswords);
gulp.task('credentials:endrun', credentials.resetEndrunKey);

