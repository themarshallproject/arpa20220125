// native
import fs from 'fs';

// packages
import gulp from 'gulp';
import jeditor from 'gulp-json-editor';
import rename from 'gulp-rename';

// plugins
import gulpTransform from './gulp-plugins/transform.js';

// local
import { getLocalConfig } from './config.js';

const config = getLocalConfig();

export function embedLoaderHtml(cb) {
  return gulp
    .src('src/*.html')
    .pipe(gulpTransform(renderEmbed))
    .pipe(rename({ prefix: 'embed-' }))
    .pipe(gulp.dest('build/embed-loaders'));
}

function renderEmbed(_, file) {
  const embedId = `g-tmp-embed-${config.slug}-${file.stem}`;
  return `<div id="${embedId}" data-tmp-slug="${config.slug}"></div>
<script type="text/javascript" src="${config.cdn}/tmp-gfx-embed-loader/loader-${config.embed_loader_version}.js"></script>
<script type="text/javascript">
  var tmpEmbed = new TMPGraphicEmbed({
    id: '${embedId}',
    graphicPath: 'embed-contents/${file.basename}',
    baseUrl: '${config.cdn}/${config.slug}',
  });
</script>`;
}

export function getEmbedLoaders(options) {
  const dirPath = './dist/embed-loaders/';
  const files = fs.readdirSync(dirPath, 'utf-8');
  const loaders = {};

  files.forEach(function (filename) {
    const key = filename.replace(/embed-(.+).html/, '$1');
    loaders[key] = fs.readFileSync(dirPath + filename, 'utf-8');
  });

  return loaders;
}

export function setEmbedConfigFlag(done) {
  if (!config.generate_external_embeds) {
    console.log(
      'Setting config.generate_external_embeds to true. Deploying from now on will include graphic embed code.'
    );
    return gulp
      .src('./config.json')
      .pipe(
        jeditor({
          generate_external_embeds: true,
        })
      )
      .pipe(gulp.dest('./'));
  }
  done();
}
