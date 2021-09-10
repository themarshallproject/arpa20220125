const fs = require('fs');
const glob = require('glob');
const path = require('path');

const config = require('../config.json');

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
<script type="module">
  import TMPGraphicEmbed from './embed-loader.js';
  const tmpEmbed = new TMPGraphicEmbed({
    id: '${ embedId }',
    graphicPath: 'embed/contents/${ filename }.html',
    baseUrl: '${ config.cdn }/${ config.slug }',
    });
</script>`;
}

module.exports = {
  embedLoaderHtml: embedLoaderHtml
}
