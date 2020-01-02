var babel = require('gulp-babel');
var babelify = require('babelify');
var bro = require('gulp-bro');
var concat = require('gulp-concat');
var gulp = require('gulp');
var livereload = require('gulp-livereload');
var mergeStream = require('merge-stream');
var notify = require('gulp-notify');
var sass = require('gulp-sass');
var sort = require('gulp-sort');

var externalData = require('./externaldata.js');
var getGraphics = require('./localrenderer.js').getGraphics;

function styles() {
  return gulp.src('examples/*/graphic.scss')
    .pipe(sass({
      includePaths: [
        'src/',
        'templates/'
      ]
    })
      .on('error', notify.onError("SASS <%= error.formatted %>")))
    .pipe(concat('graphic.css'))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function html() {
  return gulp.src('examples/*/*.html')
    .pipe(externalData.getExternalData({ examples: true }))
    .pipe(externalData.renderGraphicHTML({ examples: true }))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}


function scripts() {
  // Compile the vendor js
  var libJs = gulp.src('examples/*/lib/*.js');

  var graphicJs = gulp.src('examples/*/graphic.js')
    .pipe(bro({
      paths: [
        '../../templates'
      ],
      transform: [
        babelify.configure({ presets: ['@babel/preset-env'] })
      ]
    }));

  return mergeStream(libJs, graphicJs)
    .pipe(concat('graphic.js'))
    .pipe(gulp.dest('build-examples'))
    .pipe(livereload());
}

module.exports = {
  styles,
  html,
  scripts,
}
