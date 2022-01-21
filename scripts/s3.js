// packages
import gulp from 'gulp';
import gulpIf from 'gulp-if';
import gzip from 'gulp-gzip';
import gulpS3Upload from 'gulp-s3-upload';
import log from 'fancy-log';

// local
import * as credentials from './credentials.js';
import { getLocalConfig } from './config.js';
import { S3Deploy } from './s3/index.js';

const config = getLocalConfig();

async function getS3Credentials() {
  const accessKeyId = await credentials.ensureCredential(
    credentials.AWS_ACCESS
  );
  const secretAccessKey = await credentials.ensureCredential(
    credentials.AWS_SECRET
  );

  return { accessKeyId, secretAccessKey };
}

export async function deploy(done) {
  const { accessKeyId, secretAccessKey } = await getS3Credentials();

  const client = new S3Deploy({ accessKeyId, secretAccessKey });

  const s3 = gulpS3Upload({ accessKeyId, secretAccessKey });

  gulp
    .src('dist/**', {
      base: 'dist',
      ignore: 'dist/embed-loaders/*',
    })
    .pipe(
      gulpIf((file) => {
        return !file.path.match(/\.mp4$/);
      }, gzip({ append: false }))
    )
    .pipe(
      s3({
        bucket: config.bucket,
        ACL: 'public-read',
        keyTransform: function (filename) {
          const key = config.slug + '/' + filename;
          console.log(config.cdn + '/' + key);
          return key;
        },
        maps: {
          CacheControl: (keyname) => {
            if (keyname.match(/rev-manifest\.json/)) {
              console.log('Set 30-second max-age on rev-manifest.json');
              return 'max-age=30';
            }
            console.log('Set month-long max age on other files');
            return 'max-age=2592000';
          },
          ContentEncoding: (keyname) => {
            if (keyname.match(/\.mp4$/)) {
              console.log('Skipping gzip for mp4');
              return null;
            }
            return 'gzip';
          },
        },
      })
    )
    .on('end', done);
}

export async function deployData(done) {
  const { accessKeyId, secretAccessKey } = await getS3Credentials();

  const s3 = gulpS3Upload({ accessKeyId, secretAccessKey });

  gulp
    .src('analysis/output_data/**', { base: 'analysis/output_data' })
    .pipe(
      s3({
        bucket: config.data_bucket,
        ACL: 'public-read',
        keyTransform: function (filename) {
          const key = config.slug + '/' + filename;
          const url = `https://s3.amazonaws.com/${config.data_bucket}/${key}`;
          log.info('Deployed to url: ' + url);
          return key;
        },
      })
    )
    .on('end', done);
}
