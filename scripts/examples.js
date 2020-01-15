var babel = require('gulp-babel');
var babelify = require('babelify');
var bro = require('gulp-bro');
var checkFileSize = require('gulp-check-filesize');
var concat = require('gulp-concat');
var del = require('del');
var flatmap = require('gulp-flatmap');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var log = require('fancy-log');
var mergeStream = require('merge-stream');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var RevAll = require('gulp-rev-all');
var sass = require('gulp-sass');
var sort = require('gulp-sort');
var tap = require('gulp-tap');
var urljoin = require('url-join');

var externalData = require('./externaldata.js');
var getGraphics = require('./localrenderer.js').getGraphics;

function exampleStyles() {
  return gulp.src('examples/*/graphic.scss')
    .pipe(flatmap(function(stream, file) {
      var exampleSlug = file.path.match(/\/examples\/([^\/]+)\//)[1];

      return gulp.src(file.path)
        .pipe(sass({
          includePaths: [
            'src/',
            'templates/'
          ]
        })
          .on('error', notify.onError("SASS <%= error.formatted %>")))
        // TODO this regex is not foolproof...
        .pipe(replace(/(assets\/.+\.\w+)/g, `${ exampleSlug }/$1`))
    }))
    .pipe(concat('graphic.css'))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function exampleHtml() {
  return gulp.src('examples/*/*.html')
    .pipe(externalData.getExternalData({ examples: true }))
    .pipe(externalData.renderGraphicHTML({ examples: true }))
    .pipe(gulp.dest('build-examples'))
    .pipe(flatmap(function(stream, file) {
      var exampleSlug = file.path.match(/\/build-examples\/([^\/]+)\//)[1];

        // TODO this regex is not foolproof...
      return gulp.src(file.path)
        .pipe(replace(/(assets\/.+\.\w+)/g, function(match) {
          return `${ exampleSlug }/${ match }`
        }))
        .pipe(gulp.dest(`${ file.base }/${ exampleSlug }`))
    }))
    .pipe(livereload());
}


function exampleScripts() {
  // Compile the vendor js
  var libJs = gulp.src('examples/*/lib/*.js');

  var graphicJs = gulp.src('examples/*/graphic.js')
    .pipe(flatmap(function(stream, file) {
      var exampleSlug = file.path.match(/\/examples\/([^\/]+)\//)[1];

      return gulp.src(file.path)
        .pipe(bro({
          paths: [
            '../../templates'
          ],
          transform: [
            babelify.configure({ presets: ['@babel/preset-env'] })
          ]
        }))
        // TODO this regex is not foolproof...
        .pipe(replace(/(assets\/.+\.\w+)/g, `${ exampleSlug }/$1`))
    }))

  return mergeStream(libJs, graphicJs)
    .pipe(concat('graphic.js'))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function exampleAssets() {
  return gulp.src('examples/*/assets/**', { base: 'examples' })
    .pipe(checkFileSize({ fileSizeLimit: 512000 })) // 500kb
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function exampleClean() {
  log('example clean');
  return del('build-examples/**');
}


const exampleBuild = gulp.series(exampleClean, gulp.parallel(
  exampleHtml,
  exampleStyles,
  exampleScripts,
  exampleAssets
));

module.exports = {
  styles: exampleStyles,
  html: exampleHtml,
  scripts: exampleScripts,
  assets: exampleAssets,
  clean: exampleClean,
  build: exampleBuild
}
