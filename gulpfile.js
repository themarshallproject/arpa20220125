var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var firstOpenPort = require('first-open-port');
var opn = require('opn');
var log = require('fancy-log');
var notify = require('gulp-notify');
var request = require('request');
var hash = require('gulp-hash-filename');
var manifest = require('gulp-asset-manifest');
var checkFileSize = require('gulp-check-filesize');
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var sort = require('gulp-sort');
var notify = require('gulp-notify');
var cdnAbsolutePath = require('gulp-cdn-absolute-path');
var del = require('del');
var fs = require('fs');
var path = require('path');

var config = require('./config.json');
var server = require('./scripts/server.js');
var credentials = require('./scripts/credentials.js');
var github = require('./scripts/github.js');
var setup = require('./scripts/setup.js');
var includes = require('./scripts/includes.js');

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


function urlReplacer() {
  return cdnAbsolutePath({
    asset: 'src',
    cdn: `${config.cdn}/${config.slug}`,
    exts: ['jpg', 'jpeg', 'png', 'gif', 'js', 'css', 'mp3', 'mp4', 'eot', 'ttf', 'woff', 'woff2']
  });
}


function styles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass()
      .on('error', notify.onError("SASS <%= error.formatted %>")))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function productionStyles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(urlReplacer())
    .pipe(autoprefixer({
      cascade: false
    }))
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
  return gulp.src('src/graphic.html')
    .pipe(urlReplacer())
    .pipe(insert.prepend(includes.stylesheetIncludeText()))
    .pipe(insert.append(includes.javascriptIncludeText()))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function jsFileComparator(file1, file2) {
  var name1 = path.basename(file1.path);
  var name2 = path.basename(file2.path);
  if (name1 === 'graphic.js') {
    return 1;
  } else if (name2 === 'graphic.js') {
    return -1;
  }

  return 0;
}


function scripts() {
  return gulp.src('src/*.js')
    .pipe(sort(jsFileComparator))
    .pipe(concat('graphic.js'))
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


function productionScripts() {
  return gulp.src('src/*.js')
    .pipe(sort(jsFileComparator))
    .pipe(concat('graphic.js'))
    .pipe(urlReplacer())
    .pipe(hash())
    .pipe(uglify())
    .pipe(manifest({ bundleName: 'js' }))
    .pipe(gulp.dest('dist'));
}


function assets() {
  return gulp.src('src/assets/**', { base: 'src' })
    .pipe(checkFileSize({ fileSizeLimit: 512000 })) // 500kb
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
}


const buildDev = gulp.parallel(html, styles, scripts, assets);

const buildProduction = gulp.series(clean, productionStyles, productionScripts, assets, productionHtml);


function watch() {
  gulp.watch(['src/*.scss'], styles);
  gulp.watch(['src/*.js'], scripts);
  gulp.watch(['src/assets/**'], assets);
  return gulp.watch(['src/graphic.html'], html);
}


function clean() {
  return del(['asset_manifest.json', 'dist/**']);
}


function endrunDeploy(done, host) {
  credentials.ensureCredentials(function(creds) {
    host = host || config.endrun_host;
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
gulp.task('default', gulp.series(clean, startServer, buildDev, openBrowser, watch));
gulp.task('deploy', gulp.series(
  github.ensureRepoClean,
  buildProduction,
  S3Deploy,
  endrunDeploy,
  buildDev
));

// Asset tasks
gulp.task('sass:production', productionStyles);
gulp.task('scripts:production', productionScripts);
gulp.task('html:production', productionHtml);
gulp.task('clean', clean);
gulp.task('build:production', buildProduction);

// Deployment
gulp.task('deploy:endrun', endrunDeploy);
gulp.task('deploy:s3', S3Deploy);

// Credential management
gulp.task('credentials', credentials.ensureCredentialsTask);
gulp.task('clearcreds', credentials.clearServicePasswords);
gulp.task('credentials:endrun', credentials.resetEndrunKey);
gulp.task('credentials:aws', credentials.resetAWSKeys);

