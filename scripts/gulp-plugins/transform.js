// native
import { Buffer } from 'buffer';
import { Transform } from 'stream';

/**
 * @param {(contents: Buffer, file: import('vinyl')) => string} fn
 * @returns {Transform}
 */
export default function gulpTransform(fn) {
  return new Transform({
    objectMode: true,
    transform(/** @type {import('vinyl')} */ file, _, cb) {
      if (file.isBuffer()) {
        file.contents = Buffer.from(fn(file.contents, file));
      }

      cb(null, file);
    },
  });
}
