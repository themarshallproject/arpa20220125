var RevAll = require('gulp-rev-all');
var autoprefixer = require('gulp-autoprefixer');
var webpackStream = require('webpack-stream');
var changedInPlace = require('gulp-changed-in-place');
var checkFileSize = require('gulp-check-filesize');
var concat = require('gulp-concat');
var del = require('del');
var firstOpenPort = require('first-open-port');
var fs = require('fs');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var insert = require('gulp-insert');
var livereload = require('gulp-livereload');
var log = require('fancy-log');
var markdown = require('gulp-markdown');
var mergeStream = require('merge-stream');
var notify = require('gulp-notify');
var opn = require('opn');
var path = require('path');
var request = require('request');
var sass = require('gulp-dart-sass');
var sort = require('gulp-sort');
var sourcemaps = require('gulp-sourcemaps');
var toc = require('gulp-markdown-toc');
var uglify = require('gulp-uglify');
var urljoin = require('url-join');

var config = require('./config.json');
var webpackConfig = require('./webpack.config.js');
var credentials = require('./scripts/credentials.js');
var endrun = require('./scripts/endrun.js');
var examples = require('./scripts/examples.js');
var externalData = require('./scripts/externaldata.js');
var externalEmbeds = require('./scripts/external-embeds.js');
var getGraphics = require('./scripts/localrenderer.js').getGraphics;
var github = require('./scripts/github.js');
var includes = require('./scripts/includes.js');
var server = require('./scripts/server.js');
var setup = require('./scripts/setup.js');
var sheets = require('./scripts/sheets.js');
var videos = require('./scripts/videos.js');
var s3 = require('./scripts/s3.js');

var serverPort, lrPort;
var multiple_graphics;

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
    .pipe(sass({
      includePaths: [
        'templates/'
      ]
    })
      .on('error', notify.onError("SASS <%= error.formatted %>")))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function productionStyles() {
  return gulp.src('src/graphic.scss')
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        'templates/'
      ]
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('build'));
}


function graphicsReadme() {
  return gulp.src('templates/charts/README.md')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(toc())
    .pipe(gulp.dest('templates/charts'))
    .pipe(gulp.dest('build/templates/charts'))
    .pipe(livereload());
}


function readme() {
  return gulp.src('README.md')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(toc())
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function mustache() {
  return gulp.src('src/*.mustache')
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function productionMustache() {
  return gulp.src('src/*.mustache')
    .pipe(insert.prepend(includes.stylesheetIncludeText()))
    .pipe(insert.prepend(includes.javascriptIncludeText({ forceAsync: true })))
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
  if (multiple_graphics) {
    fs.writeFileSync('./build/includes.html',
      includes.stylesheetIncludeText() + includes.javascriptIncludeText())
  }
  return gulp.src('src/*.html')
    .pipe(externalData.getExternalData())
    .pipe(externalData.renderGraphicHTML())
    .pipe(gulpIf(config.local_markdown, markdown()))
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
  if (path.basename(file.path, path.extname(file.path)) == 'header') {
    return true;
  }
  if (!multiple_graphics) {
    return true;
  }
  return false;
}


function embedGraphicHtml() {
  return gulp.src('src/*.html')
    .pipe(externalData.getExternalData())
    .pipe(externalData.renderGraphicHTML())
    .pipe(gulpIf(config.local_markdown, markdown()))
    .pipe(gulp.dest('build/embed-contents'))
    .pipe(livereload());
}


function checkGraphicsCount(done) {
  const files = fs.readdirSync('./src/', 'utf-8');
  let fileCount = 0;

  files.forEach(function(filename) {
    if (filename.match(/[^_].*\.html$/) || filename == 'header.mustache') {
      fileCount++;
    }
  });

  multiple_graphics = fileCount > 1;
  done();
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
      .pipe(webpackStream(webpackConfig('development')));

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
      .pipe(webpackStream(webpackConfig('production')));

    return mergeStream(libJs, graphicJs)
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
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


const buildDev = gulp.series(clean, gulp.parallel(mustache, html, styles, scripts, assets, readme, graphicsReadme));

const buildProduction = gulp.series(clean, productionStyles, productionScripts, assets, checkGraphicsCount, productionMustache, productionHtml);

const buildEmbed = gulp.series(embedGraphicHtml, externalEmbeds.embedLoaderHtml);

function buildEmbedIfFlagged() {
  function skipEmbed(cb) { cb(); }

  if (config.generate_external_embeds) {
    return buildEmbed;
  } else {
    return skipEmbed;
  }
}


function watch() {
  gulp.watch(['README.md'], readme);
  gulp.watch(['templates/charts/README.md'], graphicsReadme);
  gulp.watch(['src/*.scss', 'templates/charts/stylesheets/*.scss'], styles);
  gulp.watch(['src/*.js', 'src/lib/*.js', 'templates/charts/*.js'], scripts);
  gulp.watch(['src/assets/**'], assets);

  // Triggers a full refresh (html doesn't actually need to be recompiled)
  gulp.watch(['post-templates/**'], html);
  gulp.watch(['post-templates/custom-header-data.json'], mustache);

  // Examples
  gulp.watch(['examples/*.scss', 'examples/*/*.scss', 'templates/charts/stylesheets/*.scss'], examples.styles);
  gulp.watch(['examples/*/*.js', 'examples/*/lib/*.js', 'templates/charts/*.js'], examples.scripts);
  gulp.watch(['examples/*/*.html', 'examples/*/template-files/*'], examples.html);
  gulp.watch(['examples/*/assets/**'], examples.assets);

  gulp.watch(['src/*.mustache'], mustache);
  return gulp.watch(['src/*.html', 'src/template-files'], html);
}


function clean() {
  return del(['dist/**', 'build/**']);
}


function revision() {
  return gulp.src('build/**', { base: 'build' })
    .pipe(RevAll.revision({
      transformPath: (rev, source, file) => {
        return urljoin(config.cdn, config.slug, rev);
      },
      dontGlobal: [/.*\/embed-loaders\/*/],
      // If you want an unversioned file. Careful deploying with this, the
      // cache times are long.
      // dontRenameFile: [/.*.csv/],
      includeFilesInManifest: ['.html', '.mustache', '.js', '.css']
    }))
    .pipe(gulp.dest('dist'))
    .pipe(RevAll.manifestFile())
    .pipe(gulp.dest('dist'));
}


var defaultTask = gulp.series(clean, startServer, endrun.getPostData, buildDev, examples.build, openBrowser, watch);

// Primary interface
gulp.task('setup', gulp.series(setup.setup, defaultTask));
gulp.task('default', defaultTask);
gulp.task('deploy', gulp.series(
  github.ensureRepoCleanAndPushed,
  buildProduction,
  buildEmbedIfFlagged(),
  revision,
  s3.deploy,
  endrun.endrunDeploy,
  buildDev
));

// Asset tasks
gulp.task('sass:production', productionStyles);
gulp.task('scripts:production', productionScripts);
gulp.task('html:production', productionHtml);
gulp.task('clean', clean);
gulp.task('build:production', buildProduction);
gulp.task('build:embed', gulp.series(buildProduction, externalEmbeds.setEmbedConfigFlag, buildEmbed));
gulp.task('revision', revision);
gulp.task('sheets:download', sheets.downloadData);
gulp.task('videos:transcode', videos.transcodeUploadedVideos)
gulp.task('posts:download', endrun.getPostData)

// Deployment
gulp.task('deploy:endrun', endrun.endrunDeploy);
gulp.task('deploy:s3', gulp.series(
  buildProduction,
  revision,
  s3.deploy,
  buildDev
));

gulp.task('deploy:s3:raw', s3.deploy);
gulp.task('deploy:data', s3.deployData);

// Credential management
gulp.task('credentials', credentials.ensureCredentialsTask);
gulp.task('credentials:clear', credentials.clearServicePasswords);
gulp.task('credentials:endrun', credentials.resetEndrunKey);
gulp.task('credentials:endrun_local', credentials.resetEndrunLocalKey);
gulp.task('credentials:aws', credentials.resetAWSKeys);
gulp.task('credentials:github', credentials.resetGithubKey);
gulp.task('credentials:google', credentials.resetGoogleToken);
gulp.task('credentials:google_client', credentials.resetGoogleClient);

// Configuration management
gulp.task('reset:type', setup.resetType);

// Rig updates management
gulp.task('repo:create', github.createAndSetRepository);
gulp.task('repo:labels', github.setupDefaultLabels);
gulp.task('remote:add', github.ensureUpdatesRemote);
gulp.task('update', github.pullUpdates);
