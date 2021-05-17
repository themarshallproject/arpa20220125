var RevAll = require('gulp-rev-all');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var babelify = require('babelify');
var bro = require('gulp-bro');
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
var credentials = require('./scripts/credentials.js');
var examples = require('./scripts/examples.js');
var externalData = require('./scripts/externaldata.js');
var getGraphics = require('./scripts/localrenderer.js').getGraphics;
var github = require('./scripts/github.js');
var includes = require('./scripts/includes.js');
var server = require('./scripts/server.js');
var setup = require('./scripts/setup.js');
var sheets = require('./scripts/sheets.js');
var videos = require('./scripts/videos.js');
var s3 = require('./scripts/s3.js');

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
  return gulp.src('src/header.mustache')
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}


function productionMustache() {
  return gulp.src('src/header.mustache')
    .pipe(insert.prepend(includes.stylesheetIncludeText()))
    .pipe(insert.prepend(includes.javascriptIncludeText()))
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
        paths: [
          '../templates'
        ],
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
        paths: [
          '../templates'
        ],
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


const buildDev = gulp.series(clean, gulp.parallel(mustache, html, styles, scripts, assets, readme, graphicsReadme));

const buildProduction = gulp.series(clean, productionStyles, productionScripts, assets, productionMustache, productionHtml);


function watch() {
  gulp.watch(['README.md'], readme);
  gulp.watch(['templates/charts/README.md'], graphicsReadme);
  gulp.watch(['src/*.scss', 'templates/charts/stylesheets/*.scss'], styles);
  gulp.watch(['src/*.js', 'src/lib/*.js', 'templates/charts/*.js'], scripts);
  gulp.watch(['src/assets/**'], assets);

  // Triggers a full refresh (html doesn't actually need to be recompiled)
  gulp.watch(['post-templates/**'], html);
  gulp.watch(['post-templates/**'], mustache);

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
  return gulp.src('build/**')
    .pipe(RevAll.revision({
      transformPath: (rev, source, file) => {
        return urljoin(config.cdn, config.slug, rev);
      },
      // If you want an unversioned file. Careful deploying with this, the
      // cache times are long.
      // dontRenameFile: [/.*.csv/],
      includeFilesInManifest: ['.html', '.mustache', '.js', '.css']
    }))
    .pipe(gulp.dest('dist'))
    .pipe(RevAll.manifestFile())
    .pipe(gulp.dest('dist'));
}


function routeEndrunRequest(done, host, callback) {
  host = host || config.endrun_host;
  if (host == 'https://www.themarshallproject.org') {
    credentials.ensureCredentials(function(creds) {
      var endrunCredsKey = 'gfx-endrun';
      var endrunTask = 'endrun';
      callback(host, creds[endrunCredsKey], endrunTask)
    });
  } else {
    credentials.getEndrunLocalCredentials(function(creds) {
      log(`Reminder: You are deploying to an Endrun install hosted at ${ host }. To deploy to https://www.themarshallproject.org, update the endrun_host in config.json.`)

      var endrunCredsKey = 'gfx-endrun-local';
      var endrunTask = 'endrun_local';
      callback(host, creds[endrunCredsKey], endrunTask)
    });
  }
}


function defaultEndrunResponseHandler(error, response, endrunTask) {
  if (error) {
    log.error(error);
  }

  if (response.statusCode === 403) {
    log(`Your API key is invalid! You can get a new one at ${ config.endrun_host }/admin/api_keys\n which you can update here by running:\n\n\tgulp credentials:${ endrunTask }\n\n`);
  }
}


function endrunDeploy(done, host) {
  routeEndrunRequest(done, host, function(host, endrunToken, endrunTask) {
    var endpoint = "/admin/api/v2/deploy-gfx";
    var body = {
      token: endrunToken,
      type: config.type,
      slug: config.slug,
      repo: github.getRemoteUrl()
    }

    // TODO why do we need this?
    //if (config.multiple_graphics) {
      body['contents'] = getGraphics({ isProduction: true });
    //} else {
      //var htmlFile = require('./dist/rev-manifest.json')['graphic.html'];
      //body['html'] = fs.readFileSync(path.join('dist', htmlFile)).toString();
    //}

    request.post({
      url: host + endpoint,
      json: true,
      body: body
    }, function (error, response, body) {
      defaultEndrunResponseHandler(error, response, endrunTask);

      if (response && response.statusCode !== 200) {
        log.error(response.statusCode + ': ' + body.error);
        done(body.error);
      }

      log(body)

      done();
    });
  });
}


function getPostData(done, host) {
  routeEndrunRequest(done, host, function(host, endrunToken, endrunTask) {
    if (config.slug) {
      host = host || config.endrun_host;
      var endpoint = `/admin/api/v2/post-data/${ config.slug }?token=${ endrunToken }`;

      request.get({
        url: host + endpoint,
        json: true,
      }, function (error, response, body) {
        defaultEndrunResponseHandler(error, response, endrunTask);

        if (response && response.statusCode == 404) {
          log.error(response.statusCode + ': ' + JSON.stringify(body) + '\nNo post associated with this graphic slug. To create a new post linked to this slug, run `gulp deploy`. To link this slug to an existing post, add the slug to the "Internal Slug" field on the Endrun post, found in the Advanced post editor.');
          done(body.error);
        } else if (response && response.statusCode !== 200) {
          log.error(response.statusCode + ': ' + body.error + '\nNo post data saved.');
          done(body.error);
        } else if (response && response.statusCode == 200) {
          log('Writing post data to post-templates/custom-header-data.json.');
          const content = JSON.stringify(response.body);
          fs.writeFileSync(`./post-templates/custom-header-data.json`, content);
        }

        done();
      });
    } else {
      log.error('You must specify a slug in config.json to download custom header data.')
      done();
    }
  });
}


var defaultTask = gulp.series(clean, startServer, getPostData, buildDev, examples.build, openBrowser, watch);

// Primary interface
gulp.task('setup', gulp.series(setup.setup, defaultTask));
gulp.task('default', defaultTask);
gulp.task('deploy', gulp.series(
  //github.ensureRepoCleanAndPushed,
  buildProduction,
  revision,
  s3.deploy,
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
gulp.task('sheets:download', sheets.downloadData);
gulp.task('videos:transcode', videos.transcodeUploadedVideos)
gulp.task('posts:download', getPostData)

// Deployment
gulp.task('deploy:endrun', endrunDeploy);
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
