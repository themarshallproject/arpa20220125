// native
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// packages
import gulp from 'gulp';
import concat from 'gulp-concat';
import gulpSass from 'gulp-sass';
import flatmap from 'gulp-flatmap';
import header from 'gulp-header';
import livereload from 'gulp-livereload';
import replace from 'gulp-replace';
import dartSass from 'sass';
import webpack from 'webpack';

// local
import { getExternalData, renderGraphicHTML } from './externaldata.js';
import { cleanDir } from './utils.js';
import getWebpackConfig from '../webpack.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { src, dest, series, parallel } = gulp;
const sass = gulpSass(dartSass);

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
      flatmap(function (_, file) {
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
      flatmap(function (_, file) {
        // Replace asset paths to use subfolders that correspond to slug for the given example
        var exampleSlug = getSlugFromExamples(file);

        return src(file.path)
          .pipe(
            sass
              .sync({
                includePaths: ['src/', 'templates/'],
              })
              .on('error', sass.logError)
          )
          .pipe(addSlugToPaths(exampleSlug));
      })
    )
    .pipe(concat('graphic.css'))
    .pipe(dest('build-examples'))
    .pipe(livereload());
}

function exampleScripts() {
  return new Promise((resolve, reject) => {
    const webpackConfig = getWebpackConfig(
      'production',
      {
        graphic: [
          './examples/bar-charts/graphic.js',
          './examples/line-charts/graphic.js',
        ],
      },
      path.join(process.cwd(), 'build-examples')
    );

    const compiler = webpack(webpackConfig);

    compiler.run((err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
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
