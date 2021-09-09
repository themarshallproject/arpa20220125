const fs = require('fs');
const glob = require('glob');
const path = require('path');

const config = require('../config.json');

function embedLoaderHtml(cb) {
  const graphicPaths = glob.sync('src/*.html');

  for (i in graphicPaths) {
    const filename = path.basename(graphicPaths[i], '.html');
    const embedContents = renderEmbed(filename);
    fs.writeFileSync(`./embed/loaders/embed-${ filename }.html`, embedContents);
  }

  cb();
}


function renderEmbed(filename) {
  const embedId = `g-tmp-embed-${ config.slug }-${ filename }`;
  const jsFilepath = '../graphic.js';
  const cssFilepath = '../graphic.css';
  return `<div id="${ embedId }" data-tmp-slug="${ config.slug }"></div>
<script type="module">
  import TMPGraphicEmbed from './embed-loader.js';
  const tmpEmbed = new TMPGraphicEmbed({
    id: '${ embedId }',
    graphicUrl: './contents/${ filename }.html',
    jsUrl: '${ jsFilepath }',
    cssUrl: '${ cssFilepath }'
    });
</script>`;
}

module.exports = {
  embedLoaderHtml: embedLoaderHtml
}
