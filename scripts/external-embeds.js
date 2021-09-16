const fs = require('fs');
const glob = require('glob');
const path = require('path');

const config = require('../config.json');
const loaderScriptVersion = '1.0.0';

function embedLoaderHtml(cb) {
  const graphicPaths = glob.sync('src/*.html');

  for (i in graphicPaths) {
    const filename = path.basename(graphicPaths[i], '.html');
    const embedLoaders = renderEmbed(filename);
    const loadersPath = './embed/loaders';
    fs.mkdirSync(loadersPath, { recursive: true });
    fs.writeFileSync(`${ loadersPath }/embed-${ filename }.html`, embedLoaders);
  }

  cb();
}


function renderEmbed(filename) {
  const embedId = `g-tmp-embed-${ config.slug }-${ filename }`;
  return `<div id="${ embedId }" data-tmp-slug="${ config.slug }"></div>
<script type="text/javascript" src="${ config.cdn }/tmp-gfx-embed-loader/loader-${ loaderScriptVersion }.js">
<script type="module">
  var tmpEmbed = new TMPGraphicEmbed({
    id: '${ embedId }',
    graphicPath: 'embed/contents/${ filename }.html',
    baseUrl: '${ config.cdn }/${ config.slug }',
    });
</script>`;
}


function getEmbedLoaders(options) {
  const dirPath = './embed/loaders/';
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
