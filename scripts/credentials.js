const keychain = require('keychain');
const readline = require('readline');
const log = require('fancy-log');
const { google } = require('googleapis');

const ENDRUN = {
  key: 'gfx-endrun',
  name: 'EndRun API key',
  hint: 'You can get your API key at https://www.themarshallproject.org/admin/api_keys. They expire after 30 days.'
};
const AWS_SECRET = {
  key: 'gfx-aws-secret',
  name: 'AWS Secret Token'
};
const AWS_ACCESS = {
  key: 'gfx-aws-access',
  name: 'AWS Access token'
};
const GITHUB = {
  key: 'gfx-github',
  name: 'Github personal access token',
  hint: 'You can get a personal access token at https://github.com/settings/tokens. Make sure it has at least "repo" scope.'
}
const GOOGLE_CLIENT = {
  key: 'gfx-google-client-secret',
  name: 'client_secret.json for google apis',
  hint: 'You can retrieve this at https://console.cloud.google.com/apis/credentials?organizationId=132720938840&project=gfx-rig-1531502584775. Download the client_secret.json file for the OAuth 2 app. Copy the text of the downloaded JSON file here. (And then delete the file so it\'s not lying around!)'
}
const GOOGLE_TOKEN = {
  key: 'gfx-google-token',
  name: 'OAuth2 bearer token for google apis',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']

}
const MUX_SECRET = {
  key: 'gfx-mux-secret',
  name: 'Mux Secret Token'
};
const MUX_ACCESS = {
  key: 'gfx-mux-access',
  name: 'Mux Access token'
};
const REQUIRED_CREDS = [ENDRUN, AWS_SECRET, AWS_ACCESS, GITHUB];


function ensureCredential(service, cb) {
  var key = service.key;
  keychain.getPassword({ account: 'gfx', service: key }, function(err, secret) {
    if (secret === '' || (err && err.code === 'PasswordNotFound')) {
      return resetServicePassword(service, cb);
    }

    if (err) {
      log(`Error retrieving password: ${err}`);
      return cb();
    }

    log(`${service.name} found.`)
    return cb();
  });
}


function resetServicePassword(service, cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if (service.hint) {
    log('\n\n\t' + service.hint + '\n\n');
  }

  rl.question(`Enter your ${service.name}: ` , (answer) => {
    keychain.setPassword({ account: 'gfx', service: service.key, password: answer }, cb);
    rl.close();
  });
}


function clearServicePasswords(cb) {
  REQUIRED_CREDS.forEach(function(service) {
    keychain.deletePassword({ account: 'gfx', service: service.key });
  });
  cb && cb();
}


function getCredentials(cb) {
  getRequestedCredentials(REQUIRED_CREDS, cb);
}


function getMuxCredentials(callback) {
  const MUX_CREDENTIALS = [MUX_ACCESS, MUX_SECRET];
  ensureRequestedCredentials(MUX_CREDENTIALS, () => {
    getRequestedCredentials(MUX_CREDENTIALS, callback);
  });
}


function getRequestedCredentials(requestedKeys, cb) {
  var keys = {};
  var keyCount = 0;

  function checkDone(key, secret) {
    keys[key] = secret;
    keyCount++;
    if (keyCount == requestedKeys.length) {
      cb(keys);
    }
  }
  requestedKeys.forEach(function(service) {
    keychain.getPassword({ account: 'gfx', service: service.key }, function(err, password) {
      checkDone(service.key, password);
    });
  });
}


function ensureCredentials(done) {
  ensureRequestedCredentials(REQUIRED_CREDS, done);
};


function ensureRequestedCredentials(requestedKeys, done) {
  function ensureNextCredential(index) {
    if (index >= requestedKeys.length) {
      return getCredentials(done);
    }

    ensureCredential(requestedKeys[index], ensureNextCredential.bind(undefined, index + 1));
  }
  ensureNextCredential(0);
}


// This is necessary because there need to be no arguments to done, or gulp will assume error
function ensureCredentialsTask(done) {
  ensureCredentials(function() {
    done();
  });
}


function resetEndrunKey(done) {
  resetServicePassword(ENDRUN, done);
}


function resetGithubKey(done) {
  resetServicePassword(GITHUB, done);
}


function resetAWSKeys(done) {
  resetServicePassword(AWS_ACCESS, function() {
    resetServicePassword(AWS_SECRET, done);
  });
}


function resetGoogleKeys(done) {
  resetServicePassword(GOOGLE_TOKEN, function() {
    resetServicePassword(GOOGLE_CLIENT, done);
  });
}


/**
 * Ensure that client credentials, and bearer token are present and stored.
 * Calls back with an authenticated client.
 */
function getGoogleClient(done) {
  ensureCredential(GOOGLE_CLIENT, function() {
    keychain.getPassword({ account: 'gfx', service: GOOGLE_CLIENT.key }, function(err, secret) {
      authorize(JSON.parse(secret), done);
    });
  });
}


/**
 * Create an OAuth2 client with stored credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  keychain.getPassword({ account: 'gfx', service: GOOGLE_TOKEN.key }, function(err, secret) {
    if (secret === '' || (err && err.code === 'PasswordNotFound')) {
      return getNewToken(oAuth2Client, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(secret));
    callback(oAuth2Client);
  });
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GOOGLE_TOKEN.scopes,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      keychain.setPassword({
        account: 'gfx',
        service: GOOGLE_TOKEN.key,
        password: JSON.stringify(token)
      });
      callback(oAuth2Client);
    });
  });
}


module.exports = {
  clearServicePasswords,
  ensureCredentials,
  ensureCredentialsTask,
  getCredentials,
  getGoogleClient,
  getMuxCredentials,
  resetAWSKeys,
  resetEndrunKey,
  resetGithubKey,
  resetGoogleKeys,
}
