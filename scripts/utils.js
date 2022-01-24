// native
import { readFileSync, writeFileSync } from 'fs';

// packages
import { premove } from 'premove';

/**
 * @param {string} path
 * @returns {unknown}
 */
export function readJsonSync(path) {
  return JSON.parse(readFileSync(path));
}

/**
 * @param {string} path
 * @param {string} content
 * @param {number} [indent]
 * @returns {void}
 */
export function writeJsonSync(path, content, indent) {
  writeFileSync(path, JSON.stringify(content, null, indent));
}

/**
 * @param {string} filepath
 * @returns {Promise<void | false>}
 */
export async function cleanDir(filepath) {
  return premove(filepath);
}
