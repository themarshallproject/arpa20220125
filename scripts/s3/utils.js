// native
import { createHash } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

// packages
import glob from 'tiny-glob';

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
  const resolvedDir = resolvePath(dir);

  const files = await glob('**/*', {
    absolute: true,
    cwd: dir,
    filesOnly: true,
  });

  return files.map((file) => {
    const dest = relative(resolvedDir, file);

    return { file, dest };
  });
}

/**
 *
 * @param {string} dest The output destination directory.
 * @param {any} data The data to write to the file.
 * @returns {Promise<void>}
 */
export async function outputFile(dest, data) {
  // get the file's directory
  const dir = dirname(dest);

  // ensure the directory exists
  await fs.mkdir(dir, { recursive: true });

  // attempt to write the file
  try {
    await fs.writeFile(dest, data);
  } catch (e) {
    throw e;
  }
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
