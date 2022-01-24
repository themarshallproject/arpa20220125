// native
import { existsSync, copyFileSync } from 'fs';
import { basename } from 'path';
import { createInterface } from 'readline';

// packages
import { lightFormat } from 'date-fns';
import mri from 'mri';

// local
import { getLocalConfig, setLocalConfig } from './config.js';
import {
  createAndSetRepository,
  createDefaultIssues,
  setupDefaultLabels,
} from './github.js';

const argv = mri(process.argv.slice(2));

export async function setup() {
  const config = getLocalConfig();

  // If the slug isn't equal to the default, assume the project has already been setup.
  if (!argv.force && config.slug !== 'cecinestpasuneslug') {
    console.log(
      '\nLooks like this project has already been set up!\nTo setup anyway, run \n\n\tgulp setup --force\n'
    );
    return 'Setup cancelled.';
  }

  const slug = await getSlug();
  console.log(`Using slug: ${slug}`);
  setLocalConfig({ slug });
}

export async function handleMatchingRepo() {
  const shouldCreateRepo = await getBooleanInput(
    'Do you want to create a matching Github repo?'
  );

  if (shouldCreateRepo) {
    await createAndSetRepository();

    const shouldCreateIssues = await getBooleanInput(
      'Do you want to automatically create GitHub issues for this project? This will give you a headstart on tracking what needs to be done.'
    );

    if (shouldCreateIssues) {
      await setupDefaultLabels();
      await createDefaultIssues();
    } else {
      await setupDefaultLabels();
    }
  }
}

export async function handleHeaderTemplateFiles() {
  const config = getLocalConfig();

  if (config.type !== 'header') {
    console.log('skipping header setup.');
    return;
  }

  const readPathMustache = './post-templates/_dynamic-header.mustache';
  const writePathMustache = './src/header.mustache';

  if (existsSync(writePathMustache)) {
    const shouldOverwrite = await getBooleanInput(
      `Do you want to overwrite the existing ${writePathMustache} file?`
    );

    if (shouldOverwrite) {
      copyFileSync(readPathMustache, writePathMustache);
      console.log(`Template copied to ${writePathMustache}`);
    } else {
      console.log('Did not copy template.');
    }
  } else {
    copyFileSync(readPathMustache, writePathMustache);
    console.log(`Header template file copied to ${writePathMustache}`);
  }
}

async function getType() {
  const response = await getInputFromValues(
    '\n\n\t[c]ommentary graphic\n\t[b]ase graphic\n\t[f]reeform post\n\tfreeform [h]ead\n\nWhat kind of project is this?',
    ['c', 'b', 'f', 'h']
  );

  const configUpdates = {};

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
  }

  return configUpdates;
}

export async function resetType() {
  const configUpdates = await getType();
  setLocalConfig(configUpdates);
}

async function getSlug() {
  function validator(/** @type {string} */ value) {
    if (/[^\w-]/.test(value)) {
      return 'Slugs can contain only letters, numbers, dashes, and underscores.';
    }
  }

  const currentDir = basename(process.cwd());

  let slug = await getInput(
    `Enter a slug. (You can leave off the date.) Leave blank for: ${currentDir}')`,
    validator
  );

  if (slug.trim().length === 0) {
    slug = currentDir;
  }

  slug = slug.toLowerCase().trim();

  const date = await getBooleanInput('Do you want to append the date?');

  if (date) {
    slug += lightFormat(new Date(), 'yyyyMMdd');
  }

  return slug;
}

/**
 * @param {string} prompt
 * @param {(input: string) => string} validator
 * @returns {Promise<string>}
 */
function getInput(prompt, validator) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${prompt}: `, (answer) => {
      rl.close();

      answer = answer.trim();

      const error = validator(answer);

      if (error) {
        console.log(error);
        return getInput(prompt, validator);
      }

      resolve(answer);
    });
  });
}

/**
 * @param {string} prompt
 * @param {string[]} allowedValues
 * @returns {Promise<string>}
 */
function getInputFromValues(prompt, allowedValues) {
  function validator(value) {
    if (!allowedValues.includes(value)) {
      return `${value} is not one of the allowed values.`;
    }
  }

  return getInput(prompt, validator);
}

/**
 * @param {string} prompt
 * @returns {Promise<boolean>}
 */
async function getBooleanInput(prompt) {
  const answer = await getInputFromValues(`${prompt} [y/n]`, ['y', 'n']);

  return answer === 'y';
}
