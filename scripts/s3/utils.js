// native
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { relative, resolve } from 'node:path';

// packages
import { totalist } from 'totalist';

/**
 * Resolves a path relative to the current working directory.
 *
 * @private
 * @param {string} relativePath The relative path to resolve
 * @returns {string} The resolved path
 */
export function resolvePath(relativePath) {
  return resolve(process.cwd(), relativePath);
}

/**
 * Finds all the files in a given directory and resolves them relative to the
 * current working directory.
 *
 * @private
 * @param {string} dir The directory to find all the files within
 * @returns {Promise<{file: string, dest: string}[]>} The resolved paths of all the files in the directory
 */
export async function findFiles(dir) {
  const files = [];

  await totalist(dir, (dest, file) => {
    files.push({ file, dest });
  });

  return files;
}

/**
 * Takes the path to a file and calculates its md5.
 *
 * @private
 * @param {string} path The path to a file
 * @returns {Promise<string>} The md5 of the file.
 */
export function md5FromFile(path) {
  return new Promise((resolve, reject) => {
    const input = createReadStream(path);
    const hash = createHash('md5').setEncoding('hex');

    input
      .on('error', reject)
      .pipe(hash)
      .on('error', reject)
      .on('finish', () => {
        resolve(hash.read());
      });
  });
}

/**
 * A pre-compiled regex for determining if a filename contains an 8-character
 * hexadecimal string. This is typically a sign this file has been hashed.
 *
 * @private
 * @type {RegExp}
 */
const hashRegExp = new RegExp('\\.[0-9a-f]{8}\\.');

/**
 * The default function delivery uses to determine if a file should receive
 * cache headers.
 *
 * @private
 * @param {string} path The input path
 * @returns {boolean} Whether or not the file should receive cache headers
 */
export function defaultShouldBeCached(path) {
  return hashRegExp.test(path);
}
