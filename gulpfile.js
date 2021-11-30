// native
import { writeFileSync, readdirSync } from 'fs';
import { basename, extname } from 'path';

// packages
import del from 'del';
import firstOpenPort from 'first-open-port';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import changedInPlace from 'gulp-changed-in-place';
import checkFileSize from 'gulp-check-filesize';
import concat from 'gulp-concat';
import sass from 'gulp-dart-sass';
import gulpIf from 'gulp-if';
import { prepend, append } from 'gulp-insert';
import livereload, { listen } from 'gulp-livereload';
import markdown from 'gulp-markdown';
import toc from 'gulp-markdown-toc';
import { onError } from 'gulp-notify';
import revAll from 'gulp-rev-all';
import sort from 'gulp-sort';
import uglify from 'gulp-uglify';
import mergeStream from 'merge-stream';
import open from 'open';
import urljoin from 'url-join';
import webpackStream from 'webpack-stream';

// local
import webpackConfig from './webpack.config.js';
import {
  ensureCredentialsTask,
  clearServicePasswords,
  resetEndrunKey,
  resetEndrunLocalKey,
  resetAWSKeys,
  resetGithubKey,
  resetGoogleToken,
  resetGoogleClient,
} from './scripts/credentials.js';
import { getPostData, endrunDeploy } from './scripts/endrun.js';
import {
  styles as _styles,
  scripts as _scripts,
  html as _html,
  assets as _assets,
  build,
} from './scripts/examples.js';
import { getExternalData, renderGraphicHTML } from './scripts/externaldata.js';
import {
  embedLoaderHtml,
  setEmbedConfigFlag,
} from './scripts/external-embeds.js';
import {
  ensureRepoCleanAndPushed,
  createAndSetRepository,
  setupDefaultLabels,
  ensureUpdatesRemote,
  pullUpdates,
} from './scripts/github.js';
import {
  stylesheetIncludeText,
  javascriptIncludeText,
} from './scripts/includes.js';
import server from './scripts/server.js';
import { setup as _setup, resetType } from './scripts/setup.js';
import { downloadData } from './scripts/sheets.js';
import { transcodeUploadedVideos } from './scripts/videos.js';
import { deploy, deployData } from './scripts/s3.js';
import { getLocalConfig } from './scripts/config.js';

const { src, dest, series, parallel, watch: _watch, task } = gulp;

var serverPort, lrPort;
var multiple_graphics;

const { local_markdown, use_es6, generate_external_embeds, cdn, slug } =
  getLocalConfig();

function startServer() {
  return firstOpenPort(3000)
    .then(function (port) {
      serverPort = port;
      return firstOpenPort(35729);
    })
    .then(function (port) {
      lrPort = port;
    })
    .then(function () {
      server({ port: serverPort, lrPort: lrPort });
      listen({ port: lrPort });
    });
}

function openBrowser(done) {
  open('http://localhost:' + serverPort);
  done();
}

function styles() {
  return src('src/graphic.scss')
    .pipe(
      sass({
        includePaths: ['templates/'],
      }).on('error', onError('SASS <%= error.formatted %>'))
    )
    .pipe(dest('build'))
    .pipe(livereload());
}

function productionStyles() {
  return src('src/graphic.scss')
    .pipe(
      sass({
        outputStyle: 'compressed',
        includePaths: ['templates/'],
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(dest('build'));
}

function graphicsReadme() {
  return src('templates/charts/README.md')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(toc())
    .pipe(dest('templates/charts'))
    .pipe(dest('build/templates/charts'))
    .pipe(livereload());
}

function readme() {
  return src('README.md')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(toc())
    .pipe(dest('.'))
    .pipe(dest('build'))
    .pipe(livereload());
}

function mustache() {
  return src('src/*.mustache').pipe(dest('build')).pipe(livereload());
}

function productionMustache() {
  return src('src/*.mustache')
    .pipe(prepend(stylesheetIncludeText()))
    .pipe(prepend(javascriptIncludeText({ forceAsync: true })))
    .pipe(dest('build'))
    .pipe(livereload());
}

function html() {
  return src('src/*.html')
    .pipe(getExternalData())
    .pipe(renderGraphicHTML())
    .pipe(dest('build'))
    .pipe(livereload());
}

function productionHtml() {
  if (multiple_graphics) {
    writeFileSync(
      './build/includes.html',
      stylesheetIncludeText() + javascriptIncludeText()
    );
  }
  return src('src/*.html')
    .pipe(getExternalData())
    .pipe(renderGraphicHTML())
    .pipe(gulpIf(local_markdown, markdown()))
    .pipe(gulpIf(singleOrHeader, prepend(stylesheetIncludeText())))
    .pipe(gulpIf(singleOrHeader, append(javascriptIncludeText())))
    .pipe(dest('build'))
    .pipe(livereload());
}

function singleOrHeader(file) {
  if (basename(file.path, extname(file.path)) == 'header') {
    return true;
  }
  if (!multiple_graphics) {
    return true;
  }
  return false;
}

function embedGraphicHtml() {
  return src('src/*.html')
    .pipe(getExternalData())
    .pipe(renderGraphicHTML())
    .pipe(gulpIf(local_markdown, markdown()))
    .pipe(dest('build/embed-contents'));
}

function checkGraphicsCount(done) {
  const files = readdirSync('./src/', 'utf-8');
  let fileCount = 0;

  files.forEach(function (filename) {
    if (filename.match(/[^_].*\.html$/) || filename == 'header.mustache') {
      fileCount++;
    }
  });

  multiple_graphics = fileCount > 1;
  done();
}

function jsFileComparator(file1, file2) {
  var name1 = basename(file1.path);
  var name2 = basename(file2.path);
  if (name1 === 'graphic.js') {
    return 1;
  } else if (name2 === 'graphic.js') {
    return -1;
  }

  return 0;
}

function scripts() {
  if (use_es6) {
    // Compile the vendor js
    var libJs = src('src/lib/*.js');

    var graphicJs = src('src/graphic.js').pipe(
      webpackStream(webpackConfig('development'))
    );

    return mergeStream(libJs, graphicJs)
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(dest('build'))
      .pipe(livereload());
  } else {
    return src('src/*.js')
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(dest('build'))
      .pipe(livereload());
  }
}

function productionScripts() {
  if (use_es6) {
    // Compile the vendor js
    var libJs = src('src/lib/*.js');

    var graphicJs = src('src/graphic.js').pipe(
      webpackStream(webpackConfig('production'))
    );

    return mergeStream(libJs, graphicJs)
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(dest('build'));
  } else {
    return src('src/*.js')
      .pipe(sort(jsFileComparator))
      .pipe(concat('graphic.js'))
      .pipe(uglify())
      .pipe(dest('build'));
  }
}

function assets() {
  return src('src/assets/**', { base: 'src' })
    .pipe(checkFileSize({ fileSizeLimit: 512000 })) // 500kb
    .pipe(dest('build'))
    .pipe(livereload());
}

const buildDev = series(
  clean,
  parallel(mustache, html, styles, scripts, assets, readme, graphicsReadme)
);

const buildProduction = series(
  clean,
  productionStyles,
  productionScripts,
  assets,
  checkGraphicsCount,
  productionMustache,
  productionHtml
);

const buildEmbed = series(embedGraphicHtml, embedLoaderHtml);

function buildEmbedIfFlagged() {
  function skipEmbed(cb) {
    cb();
  }

  if (generate_external_embeds) {
    return buildEmbed;
  } else {
    return skipEmbed;
  }
}

function watch() {
  _watch(['README.md'], readme);
  _watch(['templates/charts/README.md'], graphicsReadme);
  _watch(['src/*.scss', 'templates/charts/stylesheets/*.scss'], styles);
  _watch(['src/*.js', 'src/lib/*.js', 'templates/charts/*.js'], scripts);
  _watch(['src/assets/**'], assets);

  // Triggers a full refresh (html doesn't actually need to be recompiled)
  _watch(['post-templates/**'], html);
  _watch(['post-templates/custom-header-data.json'], mustache);

  // Examples
  _watch(
    [
      'examples/*.scss',
      'examples/*/*.scss',
      'templates/charts/stylesheets/*.scss',
    ],
    _styles
  );
  _watch(
    ['examples/*/*.js', 'examples/*/lib/*.js', 'templates/charts/*.js'],
    _scripts
  );
  _watch(['examples/*/*.html', 'examples/*/template-files/*'], _html);
  _watch(['examples/*/assets/**'], _assets);

  _watch(['src/*.mustache'], mustache);
  return _watch(['src/*.html', 'src/template-files'], html);
}

function clean() {
  return del(['dist/**', 'build/**']);
}

function revision() {
  return src('build/**', { base: 'build' })
    .pipe(
      revAll.revision({
        transformPath: (rev, source, file) => {
          return urljoin(cdn, slug, rev);
        },
        dontGlobal: [/.*\/embed-loaders\/*/],
        // If you want an unversioned file. Careful deploying with this, the
        // cache times are long.
        // dontRenameFile: [/.*.csv/],
        includeFilesInManifest: ['.html', '.mustache', '.js', '.css'],
      })
    )
    .pipe(dest('dist'))
    .pipe(revAll.manifestFile())
    .pipe(dest('dist'));
}

var defaultTask = series(
  clean,
  startServer,
  getPostData,
  buildDev,
  build,
  openBrowser,
  watch
);

// Primary interface
task('setup', series(_setup, defaultTask));
task('default', defaultTask);
task(
  'deploy',
  series(
    ensureRepoCleanAndPushed,
    buildProduction,
    buildEmbedIfFlagged(),
    revision,
    deploy,
    endrunDeploy,
    buildDev
  )
);

// Asset tasks
task('sass:production', productionStyles);
task('scripts:production', productionScripts);
task('html:production', productionHtml);
task('clean', clean);
task('build:production', buildProduction);
task('build:embed', series(buildProduction, setEmbedConfigFlag, buildEmbed));
task('revision', revision);
task('sheets:download', downloadData);
task('videos:transcode', transcodeUploadedVideos);
task('posts:download', getPostData);

// Deployment
task('deploy:endrun', endrunDeploy);
task('deploy:s3', series(buildProduction, revision, deploy, buildDev));

task('deploy:s3:raw', deploy);
task('deploy:data', deployData);

// Credential management
task('credentials', ensureCredentialsTask);
task('credentials:clear', clearServicePasswords);
task('credentials:endrun', resetEndrunKey);
task('credentials:endrun_local', resetEndrunLocalKey);
task('credentials:aws', resetAWSKeys);
task('credentials:github', resetGithubKey);
task('credentials:google', resetGoogleToken);
task('credentials:google_client', resetGoogleClient);

// Configuration management
task('reset:type', resetType);

// Rig updates management
task('repo:create', createAndSetRepository);
task('repo:labels', setupDefaultLabels);
task('remote:add', ensureUpdatesRemote);
task('update', pullUpdates);
