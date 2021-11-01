const Octokit = require('@octokit/rest');
const credentials = require('./credentials.js');
const child_process = require('child_process');
const log = require('fancy-log');
const gitLabel = require('git-label');

const owner = 'themarshallproject';

function createRepository(name, cb) {
  credentials.ensureCredentials(function(creds) {
    const client = new Octokit({
      auth: `token ${creds['gfx-github']}`
    });
    log('Creating github repo themarshallproject/' + name);
    client.repos.createInOrg({
      org: owner,
      name: name,
      private: true,
      has_issues: true,
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
    ensureUpdatesRemote(done);
  });
}


function setupDefaultLabels(done) {
  log('Removing default labels');
  var config = require('../config.json');

  credentials.ensureCredentials(function(creds) {
    const repoConfig = {
      api: 'https://api.github.com',
      repo: `${owner}/${config.slug}`,
      token: creds['gfx-github']
    };

    const defaultLabelsToRemove = [
      { "name": "bug", "color": "#fc2929" },
      { "name": "duplicate", "color": "#cccccc" },
      { "name": "enhancement", "color": "#84b6eb" },
      { "name": "help wanted", "color": "#159818" },
      { "name": "good first issue", "color": "#7057ff" },
      { "name": "invalid", "color": "#e6e6e6" },
      { "name": "question", "color": "#cc317c" },
      { "name": "wontfix", "color": "#ffffff" }
    ];

    const newLabelsToAdd = [
      { "name": "Type: Bug", "color": "#fc2929" },
      { "name": "Type: Duplicate", "color": "#ffa6e8" },
      { "name": "Type: Question", "color": "#5783b2" },
      { "name": "Type: Major feature", "color": "#f34dfc" },
      { "name": "Type: Minor feature", "color": "#a574f4" },
      { "name": "Type: Nice to have", "color": "#e1d2fd" },
      { "name": "Status: Blocked", "color": "#f4782f" },
      { "name": "Status: In progress", "color": "#f8e400" },
      { "name": "Status: Pending review", "color": "#00d0a9" },
      { "name": "Status: wontfix", "color": "#ffffff" },
      { "name": "Browser: Android", "color": "#baffac" },
      { "name": "Browser: IE/Edge", "color": "#b2f9fc" },
      { "name": "Browser: Chrome", "color": "#ffc6c8" },
      { "name": "Browser: Safari", "color": "#8ec1eb" },
      { "name": "Browser: Firefox", "color": "#ffcb8b" },
      { "name": "Browser: Mobile", "color": "#aaaaaa" }
    ];

    gitLabel.remove(repoConfig, defaultLabelsToRemove)
      .then((result) => {
        log('Replacing default issue labels with more helpful ones');
        gitLabel.add(repoConfig, newLabelsToAdd)
          .then(result => {
            done(result.data);
          }).catch(error => {
            log.error('Error when creating new issue labels:', error);
          })
      }).catch(error => {
        log.error('Error when removing default issue labels: ', error)
      });
  });
}


function ensureUpdatesRemote(done) {
  log('Adding original gfx repo as remote updates');
  try {
    log(child_process.execFileSync('git', ['remote', 'add', 'updates', 'git@github.com:themarshallproject/gfx-v2.git']).toString());
  } catch (error) {
    log('Got error, assuming remote already exists. Carry on.')
  }
  done();
}


function pullUpdates(done) {
  ensureUpdatesRemote(() => {
    log(child_process.execFileSync('git', ['pull', 'updates', 'master']).toString());
    log(child_process.execFileSync('npm', ['install']).toString());
  });
  done();
}


function ensureRepoCleanAndPushed(done) {
  child_process.execFileSync('git', ['fetch']);

  var statusOutput = child_process.execFileSync('git', ['status', '--porcelain']).toString();
  if (statusOutput.length !== 0) {
    throw new Error('\n\nCowardly refusing to deploy until you\'ve committed (and pushed!) your changes.\n');
  }

  const headSHA = child_process.execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();
  const currentRef = child_process.execFileSync('git', ['symbolic-ref', '-q', 'HEAD']).toString().trim();
  const upstream = child_process.execFileSync('git', ['for-each-ref', "--format=%(push:short)", currentRef]).toString().trim();
  const originSHA = child_process.execFileSync('git', ['rev-parse', upstream]).toString().trim();

  if (headSHA !== originSHA) {
    log('Pushing local changes to origin.');
    try {
      child_process.execFileSync('git', ['push', '--porcelain', '--quiet']);
    } catch (error) {
      log("Maybe you need to \n\n\tgit pull\n\n");
      throw error;
    }
  }

  done();
}

function getRemoteUrl() {
  return child_process.execFileSync('git', ['config', '--get', 'remote.origin.url']).toString().trim();
}

function createDefaultIssues(done) {
  const { slug } = require('../config.json');
  const issues = require('./issues.json');

  credentials.ensureCredentials(async (creds) => {
    const client = new Octokit({
      auth: creds['gfx-github'],
    });

    for (const issue of issues) {
      await client.issues.create({
        owner,
        repo: slug,
        title: issue.title,
        labels: issue.labels,
      })
    }

    done();
  });
}

module.exports = {
  createRepository,
  createAndSetRepository,
  setupDefaultLabels,
  ensureRepoCleanAndPushed,
  getRemoteUrl,
  ensureUpdatesRemote,
  pullUpdates,
  createDefaultIssues,
};
