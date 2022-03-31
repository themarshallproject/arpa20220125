// native
import { platform } from 'node:os';

// packages
import log, { error as _error } from 'fancy-log';
import keychain from 'keychain';
import { createInterface } from 'readline';

// local
import { readJsonSync, writeJsonSync } from './utils.js';

export const ACCOUNT = 'gfx';
const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH || './.credentials.json';

export const ENDRUN = {
  key: 'gfx-endrun',
  name: 'EndRun API key',
  hint: 'You can get your API key at https://www.themarshallproject.org/admin/api_keys. They expire after 30 days.',
};
export const ENDRUN_LOCAL = {
  key: 'gfx-endrun-local',
  name: 'Local or staging EndRun API key',
  hint: 'For use with non-default EndRun hosts, which can be specified in config.json. You can get your API key on the specified EndRun host.',
};
export const AWS_SECRET = {
  key: 'gfx-aws-secret',
  name: 'AWS Secret Token',
};
export const AWS_ACCESS = {
  key: 'gfx-aws-access',
  name: 'AWS Access token',
};
export const GITHUB = {
  key: 'gfx-github',
  name: 'Github personal access token',
  hint: 'You can get a personal access token at https://github.com/settings/tokens. Make sure it has at least "repo" scope.',
};
export const GOOGLE_CLIENT = {
  key: 'gfx-google-client-secret',
  name: 'client_secret.json for google apis',
  hint: "You can retrieve this at https://console.cloud.google.com/apis/credentials?organizationId=132720938840&project=gfx-rig-1531502584775. Download the client_secret.json file for the OAuth 2 app. Copy the text of the downloaded JSON file here. (And then delete the file so it's not lying around!)",
};
export const GOOGLE_TOKEN = {
  key: 'gfx-google-token',
  name: 'OAuth2 bearer token for google apis',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
};
const MUX_SECRET = {
  key: 'gfx-mux-secret',
  name: 'Mux Secret Token',
};
const MUX_ACCESS = {
  key: 'gfx-mux-access',
  name: 'Mux Access token',
};
const REQUIRED_CREDS = [ENDRUN, AWS_SECRET, AWS_ACCESS, GITHUB];

// In MacOS we use the system-wide keychain to store credentials. On
// other platforms we just use a plain JSON file.
function readCredentialsFile() {
  try {
    return readJsonSync(CREDENTIALS_PATH);
  } catch (err) {
    _error('Could not load credentials file, may not exist', err);
  }
}

function writeCredentialsFile(credentials) {
  writeJsonSync(CREDENTIALS_PATH, credentials);
}

/**
 * @param {string} service
 * @param {string} account
 * @returns {Promise<string>}
 */
export function getPassword(service, account) {
  return new Promise((resolve, reject) => {
    if (platform() === 'darwin') {
      keychain.getPassword({ service, account }, (err, password) => {
        if (err) {
          return reject(err);
        }

        resolve(password);
      });
    } else {
      const credentials = readCredentialsFile();
      resolve(credentials[service]);
    }
  });
}

/**
 * @param {string} service
 * @param {string} account
 * @param {string} passsword
 * @returns {Promise<void>}
 */
export function setPassword(service, account, password) {
  return new Promise((resolve, reject) => {
    if (platform() === 'darwin') {
      keychain.setPassword({ service, account, password }, (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    } else {
      const credentials = readCredentialsFile();
      credentials[service] = password;
      writeCredentialsFile(credentials);

      resolve();
    }
  });
}

export function deletePassword(service, account) {
  return new Promise((resolve, reject) => {
    if (platform() === 'darwin') {
      keychain.deletePassword({ service, account }, (err) => {
        if (err && err.code !== 'PasswordNotFound') {
          return reject(err);
        }

        resolve();
      });
    } else {
      setPassword(service, account, null).then(resolve).catch(reject);
    }
  });
}

export async function ensureCredential(service) {
  try {
    const secret = await getPassword(service.key, ACCOUNT);

    if (secret == null) {
      return resetServicePassword(service);
    }

    log(`Found ${service.name}.`);
    return secret;
  } catch (err) {
    if (err.code === 'PasswordNotFound') {
      return resetServicePassword(service);
    }

    throw err;
  }
}

/**
 * @param {{key: string, name: string}[]} requestedKeys
 */
async function ensureRequestedCredentials(requestedKeys) {
  for (const service of requestedKeys) {
    await ensureCredential(service);
  }
}

export function ensureRequiredCredentialsTask() {
  return ensureRequestedCredentials(REQUIRED_CREDS);
}

export function resetServicePassword(service) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (service.hint) {
      log('\n\n\t' + service.hint + '\n\n');
    }

    rl.question(`Enter your ${service.name}: `, async (answer) => {
      rl.close();
      await setPassword(service.key, ACCOUNT, answer);

      resolve(answer);
    });
  });
}

export async function clearServicePasswords(cb) {
  for (const service of REQUIRED_CREDS) {
    await deletePassword(service.key, ACCOUNT);
  }
}

export async function getMuxCredentials() {
  const MUX_CREDENTIALS = [MUX_ACCESS, MUX_SECRET];

  await ensureRequestedCredentials(MUX_CREDENTIALS);
  return getRequestedCredentials(MUX_CREDENTIALS);
}

export async function getEndrunLocalCredentials() {
  const endrunLocalCreds = [ENDRUN_LOCAL];

  await ensureRequestedCredentials(endrunLocalCreds);
  return getRequestedCredentials(endrunLocalCreds);
}

async function getRequestedCredentials(requestedKeys) {
  /** @type {Record<string, string>} */
  const keys = {};

  for (const { key } of requestedKeys) {
    keys[key] = await getPassword(key, ACCOUNT);
  }

  return keys;
}

export function resetEndrunKey() {
  return resetServicePassword(ENDRUN);
}

export function resetEndrunLocalKey() {
  return resetServicePassword(ENDRUN_LOCAL);
}

export function resetGithubKey() {
  return resetServicePassword(GITHUB);
}

export async function resetAWSKeys() {
  await resetServicePassword(AWS_ACCESS);
  await resetServicePassword(AWS_SECRET);
}
