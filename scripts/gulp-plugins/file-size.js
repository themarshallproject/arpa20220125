// native
import { relative } from 'path';
import { Transform } from 'stream';

// packages
import { bold, cyan, magenta, red } from 'colorette';
import log from 'fancy-log';
import prettyBytes from 'pretty-bytes';

/**
 *
 * @param {object} params
 * @param {number} params.fileSizeLimit
 * @returns {import('gulp')}
 */
export default function gulpFileSize({ fileSizeLimit }) {
  const formattedFileSizeLimit = prettyBytes(fileSizeLimit);

  return new Transform({
    objectMode: true,
    transform(/** @type {import('vinyl')} */ file, _, cb) {
      // exclude directories
      if (file.isBuffer()) {
        let message = '';
        const size = file.stat.size;
        const formattedSize = prettyBytes(size);
        const path = relative(process.cwd(), file.path);

        if (size > fileSizeLimit) {
          message = `${bold(red('WARNING:'))} ${cyan(
            path
          )} exceeded filesize limit of ${formattedFileSizeLimit}: ${red(
            formattedSize
          )}`;
        } else {
          message = `Size of ${cyan(path)}: ${magenta(formattedSize)}`;
        }

        log(message);
      }

      cb(null, file);
    },
  });
}
