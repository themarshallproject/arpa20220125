const fs = require('fs');
const gulp = require('gulp');
const gulpIf = require('gulp-if');
const markdown = require('gulp-markdown');
const livereload = require('gulp-livereload');

var externalData = require('./externaldata.js');
const config = require('../config.json');

function embedLoaderHtml(cb) {
  const fileContents = fs.readFileSync('src/graphic.html', 'utf-8');
  const embedContents = renderEmbed(fileContents);
  fs.writeFileSync('./embed/embed.html', embedContents);
  cb();
}


function embedGraphicHtml() {
  return gulp.src('src/*.html')
    .pipe(externalData.getExternalData())
    .pipe(externalData.renderGraphicHTML())
    .pipe(gulpIf(config.local_markdown, markdown()))
    .pipe(gulp.dest('embed'))
    .pipe(livereload());
}


function renderEmbed(html) {
  const embedId = `g-tmp-embed-${ config.slug }`;
  const jsFilepath = '../graphic.js';
  const cssFilepath = '../graphic.css';
  return `
  <div id="${ embedId }"></div>
  <script type="module">
    import TMPGraphicEmbed from './embed-loader.js';
    const tmpEmbed = new TMPGraphicEmbed({
      id: '${ embedId }',
      graphicUrl: './graphic.html',
      jsUrl: '${ jsFilepath }',
      cssUrl: '${ cssFilepath }'
      });
  </script>
    `;
}

module.exports = {
  embedGraphicHtml: embedGraphicHtml,
  embedLoaderHtml: embedLoaderHtml
}
