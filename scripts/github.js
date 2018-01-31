const github = require('@octokit/rest')();
const credentials = require('./credentials.js');
var child_process = require('child_process');


function createRepository(name, cb) {
  credentials.ensureCredentials(function(creds) {
    github.authenticate({
      type: 'token',
      token: creds['gfx-github']
    });
    console.log('Creating github repo themarshallproject/' + name);
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
        console.log(JSON.parse(error.message).errors.map((e) => e.message).join());
        console.log('Did someone already set up this repository?');
      } else {
        console.log('Unrecognized error:', error);
      }
    });
  });
}


function createAndSetRepository(done) {
  var config = require('../config.json');
  createRepository(config.slug, function(repo) {
    console.log('Repo successfully created at ' + repo.html_url);
    console.log('Setting new repo to origin remote');
    console.log(child_process.execFileSync('git', ['remote', 'set-url', 'origin', repo.ssh_url]));
    console.log('Adding original gfx repo as remote updates');
    console.log(child_process.execFileSync('git', ['remote', 'add', 'updates', 'git@github.com:themarshallproject/gfx-v2.git']));
    done();
  });
}


function ensureRepoClean(done) {
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
    throw new Error('\n\nYou haven\'t pushed your code to Github!\n\n\tgit push\n\nbefore deploying.\n');
  }

  done();
}


module.exports = {
  createRepository,
  createAndSetRepository,
  ensureRepoClean
};
