const gulp = require('gulp');
const gulpIf = require('gulp-if');
const gzip = require('gulp-gzip');
const log = require('fancy-log');
const credentials = require('./credentials.js');
const config = require('../config.json');


function deploy(done) {
  credentials.ensureCredentials(function(creds) {
    const s3 = require('gulp-s3-upload')({
      accessKeyId: creds['gfx-aws-access'],
      secretAccessKey: creds['gfx-aws-secret']
    });
    gulp.src('dist/**', { base: 'dist' })
      .pipe(
        gulpIf(
          (file) => { return !file.path.match(/\.mp4$/) },
          gzip({ append: false })))
      .pipe(s3({
        bucket: config.bucket,
        ACL: 'public-read',
        CacheControl: 'max-age=2592000', // One month
        keyTransform: function(filename) {
          const key = config.slug + '/' + filename;
          console.log(config.cdn + '/' + key);
          return key;
        },
        maps: {
          ContentEncoding: (keyname) => {
            if (keyname.match(/\.mp4$/)) {
              console.log('Skipping gzip for mp4');
              return null;
            }
            return 'gzip';
          }
        }
      })).on('end', done);
  });
}


function deployData(done) {
  credentials.ensureCredentials(function(creds) {
    const s3 = require('gulp-s3-upload')({
      accessKeyId: creds['gfx-aws-access'],
      secretAccessKey: creds['gfx-aws-secret']
    });
    gulp.src('analysis/output_data/**', { base: 'analysis/output_data' })
      .pipe(s3({
        bucket: config.data_bucket,
        ACL: 'public-read',
        keyTransform: function(filename) {
          const key = config.slug + '/' + filename;
          const url = `https://s3.amazonaws.com/${config.data_bucket}/${key}`;
          log.info('Deployed to url: ' + url)
          return key;
        },
      })).on('end', done);
  });
}


module.exports = {
  deploy,
  deployData,
}