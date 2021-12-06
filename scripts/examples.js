// packages
import gulp from 'gulp';
import concat from 'gulp-concat';
import sass from 'gulp-dart-sass';
import flatmap from 'gulp-flatmap';
import header from 'gulp-header';
import livereload from 'gulp-livereload';
import { onError } from 'gulp-notify';
import replace from 'gulp-replace';
import mergeStream from 'merge-stream';
import webpackStream from 'webpack-stream';

// local
import { getExternalData, renderGraphicHTML } from './externaldata.js';
import { cleanDir } from './utils.js';
import webpackConfig from '../webpack.config.js';

const { src, dest, series, parallel } = gulp;

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
  const replacer = /(assets\/[\w-\/]+\.\w{2,4})(\W)/g;
  return replace(replacer, `${exampleSlug}/$1$2`);
}

function exampleHtml() {
  return src('examples/*/*.html')
    .pipe(getExternalData({ examples: true }))
    .pipe(renderGraphicHTML({ examples: true }))
    .pipe(dest('build-examples'))
    .pipe(
      flatmap(function (stream, file) {
        // Replace asset paths to use subfolders that correspond to slug for the given example
        var exampleSlug = getSlugFromBuild(file);
        var pathData = {
          relative: file.relative,
        };

        return src(file.path)
          .pipe(addSlugToPaths(exampleSlug))
          .pipe(
            header(
              '<!-- Find this example at examples/${ relative } -->',
              pathData
            )
          )
          .pipe(dest(`${file.base}/${exampleSlug}`));
      })
    )
    .pipe(livereload());
}

function exampleStyles() {
  return src('examples/*/graphic.scss')
    .pipe(
      flatmap(function (stream, file) {
        // Replace asset paths to use subfolders that correspond to slug for the given example
        var exampleSlug = getSlugFromExamples(file);

        return src(file.path)
          .pipe(
            sass({
              includePaths: ['src/', 'templates/'],
            }).on('error', onError('SASS <%= error.formatted %>'))
          )
          .pipe(addSlugToPaths(exampleSlug));
      })
    )
    .pipe(concat('graphic.css'))
    .pipe(dest('build-examples'))
    .pipe(livereload());
}

function exampleScripts() {
  // Compile the vendor js
  var libJs = src('examples/*/lib/*.js');

  var graphicJs = src('examples/*/graphic.js').pipe(
    flatmap(function (stream, file) {
      // Replace asset paths to use subfolders that correspond to slug for the given example
      var exampleSlug = getSlugFromExamples(file);

      return src(file.path)
        .pipe(webpackStream(webpackConfig('development')))
        .pipe(addSlugToPaths(exampleSlug));
    })
  );

  return mergeStream(libJs, graphicJs)
    .pipe(concat('graphic.js'))
    .pipe(dest('build-examples'))
    .pipe(livereload());
}

function exampleAssets() {
  return src('examples/*/assets/**', { base: 'examples' })
    .pipe(dest('build-examples'))
    .pipe(livereload());
}

function exampleClean() {
  return cleanDir('./build-examples');
}

const exampleBuild = series(
  exampleClean,
  parallel(exampleHtml, exampleStyles, exampleScripts, exampleAssets)
);

export const styles = exampleStyles;
export const html = exampleHtml;
export const scripts = exampleScripts;
export const assets = exampleAssets;
export const clean = exampleClean;
export const build = exampleBuild;
