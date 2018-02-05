const github = require('@octokit/rest')();
const credentials = require('./credentials.js');
const child_process = require('child_process');
const log = require('fancy-log');


function createRepository(name, cb) {
  credentials.ensureCredentials(function(creds) {
    github.authenticate({
      type: 'token',
      token: creds['gfx-github']
    });
    log('Creating github repo themarshallproject/' + name);
    github.repos.createForOrg({
      org: 'themarshallproject',
      name: name,
      private: true,
      has_issues: false,
      has_projects: false,
      has_wiki: false,
      description: 'Repo automatically created by gfx rig.',
    }).then((result) => {
      cb(result.data);
    }).catch((error) => {
      if (error.code == 422) {
        log.error(JSON.parse(error.message).errors.map((e) => e.message).join());
        log('Did someone already set up this repository?');
      } else {
        log.error('Unrecognized error:', error);
      }
    });
  });
}


function createAndSetRepository(done) {
  var config = require('../config.json');
  createRepository(config.slug, function(repo) {
    log('Repo successfully created at ' + repo.html_url);
    log('Setting new repo to origin remote');
    log(child_process.execFileSync('git', ['remote', 'set-url', 'origin', repo.ssh_url]).toString());
    log('Adding original gfx repo as remote updates');
    log(child_process.execFileSync('git', ['remote', 'add', 'updates', 'git@github.com:themarshallproject/gfx-v2.git']).toString());
    done();
  });
}


function ensureRepoCleanAndPushed(done) {
  child_process.execFileSync('git', ['fetch']);

  var statusOutput = child_process.execFileSync('git', ['status', '--porcelain']).toString();
  if (statusOutput.length !== 0) {
    throw new Error('\n\nCowardly refusing to deploy until you\'ve committed (and pushed!) your changes.\n');
  }

  const headSHA = child_process.execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
  const currentRef = child_process.execFileSync('git', ['symbolic-ref', '-q', 'HEAD']).toString().trim();
  const upstream = child_process.execFileSync('git', ['for-each-ref', "--format=%(upstream:short)", currentRef]).toString().trim();
  const originSHA = child_process.execFileSync('git', ['rev-parse', upstream]).toString().trim();

  if (headSHA !== originSHA) {
    log('Pushing local changes to origin.');
    child_process.execFileSync('git', ['push', '--porcelain', '--quiet']);
  }

  done();
}


module.exports = {
  createRepository,
  createAndSetRepository,
  ensureRepoCleanAndPushed
};
