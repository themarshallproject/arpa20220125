import { writeFileSync } from 'fs';

import { readJsonSync } from './utils.js';

const CONFIG_LOCATION = './config.json';

export function getLocalConfig() {
  return readJsonSync(CONFIG_LOCATION);
}

export function setLocalConfig(configUpdates) {
  const config = Object.assign({}, getLocalConfig(), configUpdates);
  writeFileSync(CONFIG_LOCATION, JSON.stringify(config, null, 2));
}
