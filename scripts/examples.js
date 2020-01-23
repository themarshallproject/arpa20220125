var babel = require('gulp-babel');
var babelify = require('babelify');
var bro = require('gulp-bro');
var concat = require('gulp-concat');
var del = require('del');
var flatmap = require('gulp-flatmap');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var log = require('fancy-log');
var mergeStream = require('merge-stream');
var notify = require('gulp-notify');
var replace = require('gulp-replace');
var sass = require('gulp-sass');

var externalData = require('./externaldata.js');
var getGraphics = require('./localrenderer.js').getGraphics;


// Retrieve an example's slug from its path within /examples/
function getSlugFromExamples(file) {
  return file.path.match(/\/examples\/([^\/]+)\//)[1];
}


// Retrieve an example's slug from its path within /build-examples/
function getSlugFromBuild(file) {
  return file.path.match(/\/build-examples\/([^\/]+)\//)[1];
}


// Use gulp-replace to add example slug to asset paths
function addSlugToPaths(exampleSlug) {
  const replacer = /(assets\/.+\.\w+)/g;
  return replace(replacer, `${ exampleSlug }/$1`);
}


function exampleHtml() {
  return gulp.src('examples/*/*.html')
    .pipe(externalData.getExternalData({ examples: true }))
    .pipe(externalData.renderGraphicHTML({ examples: true }))
    .pipe(gulp.dest('build-examples'))
    .pipe(flatmap(function(stream, file) {
      // Replace asset paths to use subfolders that correspond to slug for the given example
      var exampleSlug = getSlugFromBuild(file);

      return gulp.src(file.path)
        .pipe(addSlugToPaths(exampleSlug))
        .pipe(gulp.dest(`${ file.base }/${ exampleSlug }`))
    }))
    .pipe(livereload());
}


function exampleStyles() {
  return gulp.src('examples/*/graphic.scss')
    .pipe(flatmap(function(stream, file) {
      // Replace asset paths to use subfolders that correspond to slug for the given example
      var exampleSlug = getSlugFromExamples(file);

      return gulp.src(file.path)
        .pipe(sass({
          includePaths: [
            'src/',
            'templates/'
          ]
        })
          .on('error', notify.onError("SASS <%= error.formatted %>")))
        .pipe(addSlugToPaths(exampleSlug))
    }))
    .pipe(concat('graphic.css'))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function exampleScripts() {
  // Compile the vendor js
  var libJs = gulp.src('examples/*/lib/*.js');

  var graphicJs = gulp.src('examples/*/graphic.js')
    .pipe(flatmap(function(stream, file) {
      // Replace asset paths to use subfolders that correspond to slug for the given example
      var exampleSlug = getSlugFromExamples(file);

      return gulp.src(file.path)
        .pipe(bro({
          paths: [
            '../../templates'
          ],
          transform: [
            babelify.configure({ presets: ['@babel/preset-env'] })
          ]
        }))
        .pipe(addSlugToPaths(exampleSlug))
    }))

  return mergeStream(libJs, graphicJs)
    .pipe(concat('graphic.js'))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function exampleAssets() {
  return gulp.src('examples/*/assets/**', { base: 'examples' })
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function exampleClean() {
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
