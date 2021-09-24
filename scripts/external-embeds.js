const fs = require('fs');
const gulp = require('gulp');
const transform = require('gulp-transform');

const config = require('../config.json');
const loaderScriptVersion = '0.1.11';

function embedLoaderHtml(cb) {
  return gulp.src('src/*.html')
    .pipe(transform('utf-8', renderEmbed))
    .pipe(gulp.dest('build/embed-loaders'));
}


function renderEmbed(contents, file) {
  const embedId = `g-tmp-embed-${ config.slug }-${ file.stem }`;
  return `<div id="${ embedId }" data-tmp-slug="${ config.slug }"></div>
<script type="text/javascript" src="${ config.cdn }/tmp-gfx-embed-loader/loader-${ loaderScriptVersion }.js"></script>
<script type="text/javascript">
  var tmpEmbed = new TMPGraphicEmbed({
    id: '${ embedId }',
    graphicPath: 'embed-contents/${ file.basename }',
    baseUrl: '${ config.cdn }/${ config.slug }',
    });
</script>`;
}


function getEmbedLoaders(options) {
  const dirPath = './embed-loaders/';
  const files = fs.readdirSync(dirPath, 'utf-8');
  const loaders = {};

  files.forEach(function(filename) {
    const key = filename.replace(/embed-(.+).html/, '$1');
    loaders[key] = fs.readFileSync(dirPath + filename, 'utf-8');
  });

  return loaders;
}

module.exports = {
  embedLoaderHtml: embedLoaderHtml,
  getEmbedLoaders: getEmbedLoaders
}
