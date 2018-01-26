var gulp = require('gulp');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var firstOpenPort = require('first-open-port');
var opn = require('opn');
var log = require('fancy-log');
var notify = require('gulp-notify');
var request = require('request');
var hash = require('gulp-hash-filename');
var manifest = require('gulp-asset-manifest');
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');
var del = require('del');
var fs = require('fs');

var server = require('./server.js');
var config = require('./config.json');
var credentials = require('./credentials.js');
var github = require('./github.js');
var setup = require('./setup.js');

var serverPort, lrPort;

function startServer() {
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


function openBrowser(done) {
  opn('http://localhost:' + serverPort);
  done();
}


function styles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function productionStyles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(hash())
    .pipe(manifest({ bundleName: 'css' }))
    .pipe(gulp.dest('dist'));
}


function html() {
  return gulp.src('src/graphic.html')
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function productionHtml() {
  var manifest = JSON.parse(fs.readFileSync('asset_manifest.json'));
  // TODO scripts for heads should always be inlined, likely also for posts?
  var stylesheets = manifest.css.map(function(filename) {
    var url = config.cdn + '/' + config.slug + '/' + filename;
    return '<link rel="stylesheet" href="' + url + '">';
  }).join('\n');
  // TODO check to see if this script has contents, or should be inlined
  var scripts = manifest.js.map(function(filename) {
    var url = config.cdn + '/' + config.slug + '/' + filename;
    return '<script src="' + url + '" type="text/javascript"></script>';
  }).join('');
  return gulp.src('src/graphic.html')
    .pipe(insert.prepend(stylesheets + '\n\n'))
    .pipe(insert.append('\n' + scripts + '\n\n'))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function scripts() {
  return gulp.src('src/graphic.js')
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function productionScripts() {
  return gulp.src('src/graphic.js')
    .pipe(hash())
    .pipe(uglify())
    .pipe(manifest({ bundleName: 'js' }))
    .pipe(gulp.dest('dist'));
}


function assets() {
  return gulp.src('src/assets/**', { base: 'src' })
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


const compileAll = gulp.parallel(html, styles, scripts, assets);


function watch() {
  gulp.watch(['src/*.scss'], styles);
  gulp.watch(['src/*.js'], scripts);
  gulp.watch(['src/assets/**'], assets);
  return gulp.watch(['src/graphic.html'], html);
}


function clean() {
  return del(['asset_manifest.json', 'dist/**']);
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
        type: config.type,
        slug: config.slug,
        html: fs.readFileSync('dist/graphic.html').toString()
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

function S3Deploy(done) {
  credentials.ensureCredentials(function(creds) {
    var s3 = require('gulp-s3-upload')({
      accessKeyId: creds['gfx-aws-access'],
      secretAccessKey: creds['gfx-aws-secret']
    });
    gulp.src('dist/**', { base: 'dist' })
      .pipe(s3({
        bucket: config.bucket,
        ACL: 'public-read',
        keyTransform: function(filename) {
          var key = config.slug + '/' + filename;
          console.log(config.cdn + '/' + key);
          return key;
        }
      })).on('end', done);
  });
}


// Public interface
gulp.task('setup', setup);
gulp.task('default', gulp.series(clean, startServer, compileAll, openBrowser, watch));
gulp.task('deploy', gulp.series(
  github.ensureRepoClean,
  clean,
  productionStyles,
  productionScripts,
  assets,
  productionHtml,
  S3Deploy,
  endrunDeploy));

// Asset tasks
gulp.task('sass:production', productionStyles);
gulp.task('scripts:production', productionScripts);
gulp.task('html:production', productionHtml);
gulp.task('clean', clean);

// Deployment
gulp.task('deploy:endrun', endrunDeploy);
gulp.task('deploy:s3', S3Deploy);

// Credential management
gulp.task('credentials', credentials.ensureCredentialsTask);
gulp.task('clearcreds', credentials.clearServicePasswords);
gulp.task('credentials:endrun', credentials.resetEndrunKey);
gulp.task('credentials:aws', credentials.resetAWSKeys);

