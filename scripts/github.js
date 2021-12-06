// native
import fs from 'fs';
import child_process from 'child_process';

// packages
import log from 'fancy-log';
import { Octokit } from '@octokit/rest';
import yaml from 'yaml';

// local
import * as credentials from './credentials.js';
import { getLocalConfig } from './config.js';

export function createRepository(name, cb) {
  credentials.ensureCredentials(function (creds) {
    const client = new Octokit({
      auth: `token ${creds['gfx-github']}`,
    });
    log('Creating github repo themarshallproject/' + name);
    client.repos
      .createInOrg({
        org: 'themarshallproject',
        name: name,
        private: true,
        has_issues: true,
        has_projects: false,
        has_wiki: false,
        description: 'Repo automatically created by gfx rig.',
      })
      .then((result) => {
        cb(result.data);
      })
      .catch((error) => {
        if (error.code == 422) {
          log.error(
            JSON.parse(error.message)
              .errors.map((e) => e.message)
              .join()
          );
          log('Did someone already set up this repository?');
        } else {
          log.error('Unrecognized error:', error);
        }
      });
  });
}

export function createAndSetRepository(done) {
  var config = getLocalConfig();
  createRepository(config.slug, function (repo) {
    log('Repo successfully created at ' + repo.html_url);
    log('Setting new repo to origin remote');
    log(
      child_process
        .execFileSync('git', ['remote', 'set-url', 'origin', repo.ssh_url])
        .toString()
    );
    ensureUpdatesRemote(done);
  });
}

export function setupDefaultLabels(done) {
  log('Customizing repo issue labels...');
  const { slug } = getLocalConfig();

  const labelsToRemove = [
    'bug',
    'duplicate',
    'enhancement',
    'help wanted',
    'good first issue',
    'invalid',
    'question',
    'wontfix',
  ];

  const labelsToAdd = [
    { name: 'Type: Bug', color: 'fc2929' },
    { name: 'Type: Duplicate', color: 'ffa6e8' },
    { name: 'Type: Question', color: '5783b2' },
    { name: 'Type: Major feature', color: 'f34dfc' },
    { name: 'Type: Minor feature', color: 'a574f4' },
    { name: 'Type: Nice to have', color: 'e1d2fd' },
    { name: 'Status: Blocked', color: 'f4782f' },
    { name: 'Status: In progress', color: 'f8e400' },
    { name: 'Status: Pending review', color: '00d0a9' },
    { name: 'Status: wontfix', color: 'ffffff' },
    { name: 'Browser: Android', color: 'baffac' },
    { name: 'Browser: IE/Edge', color: 'b2f9fc' },
    { name: 'Browser: Chrome', color: 'ffc6c8' },
    { name: 'Browser: Safari', color: '8ec1eb' },
    { name: 'Browser: Firefox', color: 'ffcb8b' },
    { name: 'Browser: Mobile', color: 'aaaaaa' },
  ];

  credentials.ensureCredentials(async (creds) => {
    const client = new Octokit({
      auth: creds['gfx-github'],
    });

    // first remove the default labels, if they exist
    log('Removing default labels');
    for (const name of labelsToRemove) {
      try {
        await client.issues.deleteLabel({
          owner: 'themarshallproject',
          repo: slug,
          name,
        });
      } catch (e) {
        // 404 means the label already didn't exist
        // https://docs.github.com/en/rest/reference/issues#delete-a-label
        if (e.status !== 404) {
          throw e;
        }
      }
    }

    // then add our custom ones
    log('Replacing default issue labels with more helpful ones');
    for (const { name, color } of labelsToAdd) {
      try {
        await client.issues.createLabel({
          owner: 'themarshallproject',
          repo: slug,
          name,
          color,
        });
      } catch (e) {
        // 422 means the label already exists, which is fine
        // https://docs.github.com/en/rest/reference/issues#create-a-label
        if (e.status !== 422) {
          throw e;
        }
      }
    }

    done();
  });
}

export function ensureUpdatesRemote(done) {
  log('Adding original gfx repo as remote updates');
  try {
    log(
      child_process
        .execFileSync('git', [
          'remote',
          'add',
          'updates',
          'git@github.com:themarshallproject/gfx-v2.git',
        ])
        .toString()
    );
  } catch (error) {
    log('Got error, assuming remote already exists. Carry on.');
  }
  done();
}

export function pullUpdates(done) {
  ensureUpdatesRemote(() => {
    log(
      child_process
        .execFileSync('git', ['pull', 'updates', 'master'])
        .toString()
    );
    log(child_process.execFileSync('npm', ['install']).toString());
  });
  done();
}

export function ensureRepoCleanAndPushed(done) {
  child_process.execFileSync('git', ['fetch']);

  var statusOutput = child_process
    .execFileSync('git', ['status', '--porcelain'])
    .toString();
  if (statusOutput.length !== 0) {
    throw new Error(
      "\n\nCowardly refusing to deploy until you've committed (and pushed!) your changes.\n"
    );
  }

  const headSHA = child_process
    .execFileSync('git', ['rev-parse', 'HEAD'])
    .toString()
    .trim();
  const currentRef = child_process
    .execFileSync('git', ['symbolic-ref', '-q', 'HEAD'])
    .toString()
    .trim();
  const upstream = child_process
    .execFileSync('git', ['for-each-ref', '--format=%(push:short)', currentRef])
    .toString()
    .trim();
  const originSHA = child_process
    .execFileSync('git', ['rev-parse', upstream])
    .toString()
    .trim();

  if (headSHA !== originSHA) {
    log('Pushing local changes to origin.');
    try {
      child_process.execFileSync('git', ['push', '--porcelain', '--quiet']);
    } catch (error) {
      log('Maybe you need to \n\n\tgit pull\n\n');
      throw error;
    }
  }

  done();
}

export function updateDependabotSettings(cb) {
  const configLocation = './.github/dependabot.yml';
  const dependabotConfigFile = fs.readFileSync(configLocation);
  const parsedConfig = yaml.parse(dependabotConfigFile.toString());
  parsedConfig.updates.forEach((ecosystem) => {
    log(
      `Setting dependabot package ecosystem ${ecosystem['package-ecosystem']} to production dependencies only`
    );
    // Only allow updates to the production dependencies (none, by default)
    ecosystem.allow = [{ 'dependency-type': 'production' }];
  });
  const updatedConfigFile = yaml.stringify(parsedConfig);
  fs.writeFileSync(configLocation, updatedConfigFile);
  cb();
}

export function getRemoteUrl() {
  return child_process
    .execFileSync('git', ['config', '--get', 'remote.origin.url'])
    .toString()
    .trim();
}
