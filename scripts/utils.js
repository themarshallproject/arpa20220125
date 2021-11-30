// native
import { readFileSync } from 'fs';

// packages
import { premove } from 'premove';

/**
 * @param {string} path
 */
export function readJsonSync(path) {
  return JSON.parse(readFileSync(path));
}

/**
 * @param {string} filepath
 * @returns {Promise<void | false>}
 */
export async function cleanDir(filepath) {
  return premove(filepath);
}
