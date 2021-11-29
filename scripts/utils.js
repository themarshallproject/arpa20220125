// native
import { readFileSync } from 'fs';

/**
 * @param {string} path
 */
export function readJsonSync(path) {
  return JSON.parse(readFileSync(path));
}
