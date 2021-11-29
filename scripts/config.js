import { readJsonSync } from './utils.js';

let config;

export function getLocalConfig() {
  if (!config) {
    config = readJsonSync('./config.json');
  }

  return config;
}
