import { readJsonSync } from './utils.js';

export function getLocalConfig() {
  return readJsonSync('./config.json');
}
