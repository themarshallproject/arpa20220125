// local
import { readJsonSync, writeJsonSync } from './utils.js';

const CONFIG_LOCATION = './config.json';

export function getLocalConfig() {
  return readJsonSync(CONFIG_LOCATION);
}

export function setLocalConfig(configUpdates) {
  const config = Object.assign({}, getLocalConfig(), configUpdates);
  writeJsonSync(CONFIG_LOCATION, config, 2);
}
