// native
import { writeFileSync, readdirSync } from 'fs';
import { basename, extname, join } from 'path';

// packages

import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import changedInPlace from 'gulp-changed-in-place';
import gulpSass from 'gulp-sass';
import gulpIf from 'gulp-if';
import { prepend, append } from 'gulp-insert';
import livereload, { listen } from 'gulp-livereload';
import markdown from 'gulp-markdown';
import toc from 'gulp-markdown-toc';
import revAll from 'gulp-rev-all';
import sourcemaps from 'gulp-sourcemaps';
import open from 'open';
import dartSass from 'sass-embedded';
import webpack from 'webpack';

// local
import getWebpackConfig from './webpack.config.js';
import * as credentials from './scripts/credentials.js';
import * as endrun from './scripts/endrun.js';
import * as examples from './scripts/examples.js';
import * as externaldata from './scripts/externaldata.js';
import * as externalEmbeds from './scripts/external-embeds.js';
import * as github from './scripts/github.js';
import * as google from './scripts/google.js';
import * as includes from './scripts/includes.js';
import server from './scripts/server.js';
import * as setup from './scripts/setup.js';
import * as docs from './scripts/docs.js';
import * as sheets from './scripts/sheets.js';
import * as videos from './scripts/videos.js';
import * as s3 from './scripts/s3.js';

// plugins
import gulpFileSize from './scripts/gulp-plugins/file-size.js';

// utils
import { getLocalConfig } from './scripts/config.js';
import { cleanDir } from './scripts/utils.js';

var serverPort, multiple_graphics;

const { local_markdown, generate_external_embeds, cdn, slug } =
  getLocalConfig();

// Pass dart sass to gulp-sass
const sass = gulpSass(dartSass);

async function startServer() {
  const port = await getPort({ port: [3000, 3001, 3002, 3003] });
  const lrPort = await getPort({ port: 35729 });

  server({ port, lrPort });
  listen({ port: lrPort });
  serverPort = port;
}

function openBrowser() {
  return open('http://localhost:' + serverPort);
}

function styles() {
  return gulp
    .src('src/graphic.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: ['templates/'],
      }).on('error', sass.logError)
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}

function productionStyles() {
  return gulp
    .src('src/graphic.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass
        .sync({
          outputStyle: 'compressed',
          includePaths: ['templates/'],
        })
        .on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build'));
}

function graphicsReadme() {
  return gulp
    .src('templates/charts/README.md')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(toc())
    .pipe(gulp.dest('templates/charts'))
    .pipe(gulp.dest('build/templates/charts'))
    .pipe(livereload());
}

function readme() {
  return gulp
    .src('README.md')
    .pipe(changedInPlace({ firstPass: true }))
    .pipe(toc())
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}

function mustache() {
  return gulp.src('src/*.mustache').pipe(gulp.dest('build')).pipe(livereload());
}

function productionMustache() {
  return gulp
    .src('src/*.mustache')
    .pipe(prepend(includes.stylesheetIncludeText()))
    .pipe(prepend(includes.javascriptIncludeText()))
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}

function html() {
  return gulp
    .src('src/*.html')
    .pipe(externaldata.getExternalData())
    .pipe(externaldata.renderGraphicHTML())
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}

function productionHtml() {
  if (multiple_graphics) {
    writeFileSync(
      './build/includes.html',
      includes.stylesheetIncludeText() + includes.javascriptIncludeText()
    );
  }
  return gulp
    .src('src/*.html')
    .pipe(externaldata.getExternalData())
    .pipe(externaldata.renderGraphicHTML())
    .pipe(gulpIf(local_markdown, markdown()))
    .pipe(gulpIf(singleOrHeader, prepend(includes.stylesheetIncludeText())))
    .pipe(gulpIf(singleOrHeader, append(includes.javascriptIncludeText())))
    .pipe(gulp.dest('build'))
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
  return gulp
    .src('src/*.html')
    .pipe(externaldata.getExternalData())
    .pipe(externaldata.renderGraphicHTML())
    .pipe(gulpIf(local_markdown, markdown()))
    .pipe(gulp.dest('build/embed-contents'));
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

function productionScripts() {
  return new Promise((resolve, reject) => {
    const webpackConfig = getWebpackConfig('production');
    const bundle = webpack(webpackConfig);

    bundle.run((err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

function assets() {
  return gulp
    .src('src/assets/**', { base: 'src' })
    .pipe(gulpFileSize({ fileSizeLimit: 512000 })) // 500kb
    .pipe(gulp.dest('build'))
    .pipe(livereload());
}

const buildDev = gulp.series(
  clean,
  gulp.parallel(mustache, html, styles, assets, readme, graphicsReadme)
);

const buildProduction = gulp.series(
  clean,
  productionStyles,
  productionScripts,
  assets,
  checkGraphicsCount,
  productionMustache,
  productionHtml
);

const buildEmbed = gulp.series(
  embedGraphicHtml,
  externalEmbeds.embedLoaderHtml
);

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
  gulp.watch(['README.md'], readme);
  gulp.watch(['templates/charts/README.md'], graphicsReadme);
  gulp.watch(['src/*.scss', 'templates/charts/stylesheets/*.scss'], styles);
  gulp.watch(['src/assets/**'], assets);

  // Triggers a full refresh (html doesn't actually need to be recompiled)
  gulp.watch(['post-templates/**'], html);
  gulp.watch(['post-templates/custom-header-data.json'], mustache);

  gulp.watch(['src/*.mustache'], mustache);
  return gulp.watch(['src/*.html', 'src/template-files'], html);
}

function clean() {
  return Promise.all([cleanDir('./dist'), cleanDir('./build')]);
}

function revision() {
  return gulp
    .src('build/**', { base: 'build' })
    .pipe(
      revAll.revision({
        transformPath: (rev, source, file) => {
          return new URL(join(slug, rev), cdn).href;
        },
        dontGlobal: [/.*\/embed-loaders\/*/],
        // If you want an unversioned file. Careful deploying with this, the
        // cache times are long.
        // dontRenameFile: [/.*.csv/],
        includeFilesInManifest: ['.html', '.mustache', '.js', '.css'],
      })
    )
    .pipe(gulp.dest('dist'))
    .pipe(revAll.manifestFile())
    .pipe(gulp.dest('dist'));
}

const defaultTask = gulp.series(
  clean,
  buildDev,
  endrun.getPostData,
  startServer,
  openBrowser,
  watch
);

// Primary interface
gulp.task(
  'setup',
  gulp.series(
    setup.setup,
    setup.resetType,
    setup.handleHeaderTemplateFiles,
    setup.handleMatchingRepo,
    github.ensureUpdatesRemote,
    github.updateDependabotSettings,
    defaultTask
  )
);
gulp.task('default', defaultTask);
gulp.task(
  'deploy',
  gulp.series(
    github.ensureRepoCleanAndPushed,
    buildProduction,
    buildEmbedIfFlagged(),
    revision,
    s3.deploy,
    endrun.endrunDeploy,
    buildDev
  )
);

// Asset tasks
gulp.task('sass:production', productionStyles);
gulp.task('scripts:production', productionScripts);
gulp.task('html:production', productionHtml);
gulp.task('clean', clean);
gulp.task('build:production', buildProduction);
gulp.task(
  'build:embed',
  gulp.series(buildProduction, externalEmbeds.setEmbedConfigFlag, buildEmbed)
);
gulp.task('build:examples', examples.build);
gulp.task('revision', revision);
gulp.task('docs:download', docs.downloadData);
gulp.task('sheets:download', sheets.downloadData);
gulp.task('videos:transcode', videos.transcodeUploadedVideos);
gulp.task('posts:download', endrun.getPostData);

// Deployment
gulp.task('deploy:endrun', endrun.endrunDeploy);
gulp.task('deploy:s3', gulp.series(buildProduction, revision, s3.deploy));

gulp.task('deploy:s3:raw', s3.deploy);
gulp.task('deploy:data', s3.deployData);

// Credential management
gulp.task('credentials', credentials.ensureRequiredCredentialsTask);
gulp.task('credentials:clear', credentials.clearServicePasswords);
gulp.task('credentials:endrun', credentials.resetEndrunKey);
gulp.task('credentials:endrun_local', credentials.resetEndrunLocalKey);
gulp.task('credentials:aws', credentials.resetAWSKeys);
gulp.task('credentials:github', credentials.resetGithubKey);
gulp.task('credentials:google', google.resetGoogleToken);
gulp.task('credentials:google_client', google.resetGoogleClient);

// Configuration management
gulp.task('reset:type', setup.resetType);
gulp.task('dependabot:disable', github.updateDependabotSettings);

// Rig updates management
gulp.task('repo:create', github.createAndSetRepository);
gulp.task('repo:labels', github.setupDefaultLabels);
gulp.task('repo:issues', github.createDefaultIssues);
gulp.task('remote:add', github.ensureUpdatesRemote);
gulp.task('update', github.pullUpdates);
