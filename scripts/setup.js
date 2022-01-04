// native
import { writeFileSync, existsSync, copyFileSync } from 'fs';
import { basename } from 'path';
import { createInterface } from 'readline';

// packages
import { lightFormat } from 'date-fns';
import mri from 'mri';

// local
import { getLocalConfig } from './config.js';
import {
  createAndSetRepository,
  createDefaultIssues,
  setupDefaultLabels,
} from './github.js';

const argv = mri(process.argv.slice(2));
const config = getLocalConfig();

export function setup(done) {
  // If the slug isn't equal to the default, assume the project has already been setup.

  if (!argv.force && config.slug !== 'cecinestpasuneslug') {
    console.log(
      '\nLooks like this project has already been set up!\nTo setup anyway, run \n\n\tgulp setup --force\n'
    );
    return done('Setup cancelled.');
  }

  getSlug(function (slug) {
    console.log(`Using slug: ${slug}`);
    config.slug = slug;
    getType(function () {
      writeFileSync('config.json', JSON.stringify(config, null, 2));
      done();
    });
  });
}

export function handleMatchingRepo(cb) {
  getBooleanInput(
    'Do you want to create a matching Github repo?',
    function (repo) {
      if (repo) {
        createAndSetRepository(() => {
          getBooleanInput(
            'Do you want to automatically create GitHub issues for this project? This will give you a headstart on tracking what needs to be done.',
            (yes) => {
              if (yes) {
                setupDefaultLabels(() => {
                  createDefaultIssues(cb);
                });
              } else {
                setupDefaultLabels(cb);
              }
            }
          );
        });
      } else {
        cb();
      }
    }
  );
}

export function handleHeaderTemplateFiles(cb) {
  if (config.type !== 'header') {
    console.log('skipping header setup.');
    return cb();
  }

  const readPathMustache = './post-templates/_dynamic-header.mustache';
  const writePathMustache = './src/header.mustache';

  if (existsSync(writePathMustache)) {
    getBooleanInput(
      `Do you want to overwrite the existing ${writePathMustache} file?`,
      (overwrite) => {
        if (overwrite) {
          copyFileSync(readPathMustache, writePathMustache);
          console.log(`Template copied to ${writePathMustache}`);
        } else {
          console.log('Did not copy template.');
        }

        cb();
      }
    );
  } else {
    copyFileSync(readPathMustache, writePathMustache);
    console.log(`Header template file copied to ${writePathMustache}`);
    cb();
  }
}

function getType(cb) {
  const configUpdates = {};

  getInputFromValues(
    '\n\n\t[c]ommentary graphic\n\t[b]ase graphic\n\t[f]reeform post\n\tfreeform [h]ead\n\nWhat kind of project is this?',
    ['c', 'b', 'f', 'h'],
    function (response) {
      switch (response) {
        case 'c':
          configUpdates.local_template = 'commentary';
          configUpdates.type = 'graphic';
          break;
        case 'b':
          configUpdates.local_template = 'post';
          configUpdates.type = 'graphic';
          break;
        case 'f':
          configUpdates.local_template = 'freeform';
          configUpdates.type = 'post';
          break;
        case 'h':
          configUpdates.local_template = 'freeform-header';
          configUpdates.type = 'header';
          break;
        default:
          break;
      }
      cb(configUpdates);
    }
  );
}

export function resetType(done) {
  getType(function (configUpdates) {
    writeFileSync(
      'config.json',
      JSON.stringify(Object.assign(config, configUpdates), null, 2)
    );
    done();
  });
}

function getSlug(cb) {
  function validator(value) {
    if (/[^\w-]/.test(value)) {
      return 'Slugs can contain only letters, numbers, dashes, and underscores.';
    }
  }

  var currentDir = basename(process.cwd());

  getInput(
    'Enter a slug, (you can leave off the date) (leave blank for: ' +
      currentDir +
      ')',
    validator,
    function (slug) {
      if (slug.trim().length === 0) {
        slug = currentDir;
      }

      slug = slug.toLowerCase().trim();

      getBooleanInput('Do you want to append the date', function (date) {
        if (date) {
          slug += lightFormat(new Date(), 'yyyyMMdd');
        }
        cb(slug);
      });
    }
  );
}

function getInput(prompt, validator, cb) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`${prompt}: `, (answer) => {
    rl.close();
    answer = answer.trim();
    var error = validator(answer);
    if (error) {
      console.log(error);
      return getInput(prompt, validator, cb);
    }
    cb(answer);
  });
}

function getInputFromValues(prompt, allowedValues, cb) {
  function validator(value) {
    if (allowedValues.indexOf(value) === -1) {
      return `${value} is not one of the allowed values.`;
    }
  }
  getInput(prompt, validator, cb);
}

function getBooleanInput(prompt, cb) {
  getInputFromValues(prompt + ' [y/n]', ['y', 'n'], function (answer) {
    cb(answer === 'y');
  });
}
