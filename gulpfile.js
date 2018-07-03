var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var bro = require('gulp-bro');
var babel = require('gulp-babel');
var babelify = require('babelify');
var mergeStream = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var firstOpenPort = require('first-open-port');
var opn = require('opn');
var log = require('fancy-log');
var request = require('request');
var checkFileSize = require('gulp-check-filesize');
var uglify = require('gulp-uglify');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var sort = require('gulp-sort');
var notify = require('gulp-notify');
var RevAll = require('gulp-rev-all');
var gulpIf = require('gulp-if');
var del = require('del');
var urljoin = require('url-join');
var fs = require('fs');
var path = require('path');

var config = require('./config.json');
var server = require('./scripts/server.js');
var credentials = require('./scripts/credentials.js');
var github = require('./scripts/github.js');
var setup = require('./scripts/setup.js');
var includes = require('./scripts/includes.js');
var externalData = require('./scripts/externaldata.js');
var getGraphics = require('./scripts/localrenderer.js').getGraphics;

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
    .pipe(sass()
      .on('error', notify.onError("SASS <%= error.formatted %>")))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function productionStyles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('build'));
}


function readme() {
  return gulp.src('README.md')
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function html() {
  return gulp.src('src/*.html')
    .pipe(externalData.getExternalData())
    .pipe(externalData.renderGraphicHTML())
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function productionHtml() {
  if (config.multiple_graphics) {
    fs.writeFileSync('./build/includes.html',
      includes.stylesheetIncludeText() + includes.javascriptIncludeText())
  }
  return gulp.src('src/*.html')
    .pipe(externalData.getExternalData())
    .pipe(externalData.renderGraphicHTML())
    .pipe(
      gulpIf(singleOrHeader,
        insert.prepend(includes.stylesheetIncludeText())))
    .pipe(
      gulpIf(singleOrHeader,
        insert.append(includes.javascriptIncludeText())))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function singleOrHeader(file) {
  if (!config.multiple_graphics) {
    return true;
  }
  if (path.basename(file.path) === 'header.html') {
    return true;
  }
  return false;
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
  if (config.use_es6) {
    // Compile the vendor js
    var libJs = gulp.src('src/lib/*.js');

    var graphicJs = gulp.src('src/graphic.js')
      .pipe(bro({
        transform: [
          babelify.configure({ presets: ['@babel/preset-env'] })
        ]
      }));

    return mergeStream(libJs, graphicJs)
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(gulp.dest('build'))
      .pipe(livereload());
  } else {
    return gulp.src('src/*.js')
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(gulp.dest('build'))
      .pipe(livereload());
  }
}


function productionScripts() {
  if (config.use_es6) {
    // Compile the vendor js
    var libJs = gulp.src('src/lib/*.js');

    var graphicJs = gulp.src('src/graphic.js')
      .pipe(bro({
        transform: [
          babelify.configure({ presets: ['@babel/preset-env'] })
        ]
      }));

    return mergeStream(libJs, graphicJs)
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(uglify())
      .pipe(gulp.dest('build'))
  } else {
    return gulp.src('src/*.js')
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(uglify())
      .pipe(gulp.dest('build'));
  }
}


function assets() {
  return gulp.src('src/assets/**', { base: 'src' })
    .pipe(checkFileSize({ fileSizeLimit: 512000 })) // 500kb
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


const buildDev = gulp.parallel(html, styles, scripts, assets, readme);

const buildProduction = gulp.series(clean, productionStyles, productionScripts, assets, productionHtml);


function watch() {
  gulp.watch(['README.md'], readme);
  gulp.watch(['src/*.scss'], styles);
  gulp.watch(['src/*.js', 'src/lib/*.js'], scripts);
  gulp.watch(['src/assets/**'], assets);
  // Triggers a full refresh (html doesn't actually need to be recompiled)
  gulp.watch(['post-templates/**'], html);
  return gulp.watch(['src/*.html', 'src/template-files'], html);
}


function clean() {
  return del(['dist/**']);
}


function revision() {
  return gulp.src('build/**')
    .pipe(RevAll.revision({
      transformPath: (rev, source, file) => {
        return urljoin(config.cdn, config.slug, rev);
      },
      includeFilesInManifest: ['.html', '.js', '.css']
    }))
    .pipe(gulp.dest('dist'))
    .pipe(RevAll.manifestFile())
    .pipe(gulp.dest('dist'));
}


function endrunDeploy(done, host) {
  credentials.ensureCredentials(function(creds) {
    host = host || config.endrun_host;
    var endpoint = "/admin/api/v2/deploy-gfx";
    var htmlFile = require('./dist/rev-manifest.json')['graphic.html'];
    var body = {
      token: creds['gfx-endrun'],
      type: config.type,
      slug: config.slug,
      repo: github.getRemoteUrl()
    }

    if (config.multiple_graphics) {
      body['contents'] = getGraphics();
    } else {
      body['html'] = fs.readFileSync(path.join('dist', htmlFile)).toString();
    }

    request.post({
      url: host + endpoint,
      json: true,
      body: body
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

var defaultTask = gulp.series(clean, startServer, buildDev, openBrowser, watch);

// Public interface
gulp.task('setup', gulp.series(setup.setup, defaultTask));
gulp.task('default', defaultTask);
gulp.task('deploy', gulp.series(
  github.ensureRepoCleanAndPushed,
  buildProduction,
  revision,
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
gulp.task('revision', revision);

// Deployment
gulp.task('deploy:endrun', endrunDeploy);
gulp.task('deploy:s3', S3Deploy);

// Credential management
gulp.task('credentials', credentials.ensureCredentialsTask);
gulp.task('credentials:clear', credentials.clearServicePasswords);
gulp.task('credentials:endrun', credentials.resetEndrunKey);
gulp.task('credentials:aws', credentials.resetAWSKeys);

// Configuration management
gulp.task('reset:type', setup.resetType);
