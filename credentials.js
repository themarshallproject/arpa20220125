const keychain = require('keychain');
const readline = require('readline');
const log = require('fancy-log');

var REQUIRED_CREDS = [
  {
    key: 'gfx-aws-access',
    name: 'AWS Access token'
  },
  {
    key: 'gfx-aws-secret',
    name: 'AWS Secret Token'
  },
  {
    key: 'gfx-endrun',
    name: 'EndRun API token'
  }
];

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
  var keys = {};
  var keyCount = 0;

  function checkDone(key, secret) {
    keys[key] = secret;
    keyCount++;
    if (keyCount == REQUIRED_CREDS.length) {
      cb(keys);
    }
  }
  REQUIRED_CREDS.forEach(function(service) {
    keychain.getPassword({ account: 'gfx', service: service.key }, function(err, password) {
      checkDone(service.key, password);
    });
  });

}


function ensureCredentials(done) {
  function ensureNextCredential(index) {
    if (index >= REQUIRED_CREDS.length) {
      return getCredentials(done);
    }

    ensureCredential(REQUIRED_CREDS[index], ensureNextCredential.bind(undefined, index + 1));
  }
  ensureNextCredential(0);
};


function resetEndrunKey(done) {
  resetServicePassword({
    key: 'gfx-endrun',
    name: 'EndRun API token'
  }, done);
}

module.exports = {
  ensureCredentials: ensureCredentials,
  clearServicePasswords: clearServicePasswords,
  getCredentials: getCredentials,
  resetEndrunKey: resetEndrunKey
}
