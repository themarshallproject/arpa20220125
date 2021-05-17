const github = require('./github.js');
const config = require('../config.json');
const readline = require('readline');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
var argv = require('minimist')(process.argv.slice(2));

function setup(done) {
  // If the slug isn't equal to the default, assume the project has already been setup.

  if (!argv.force && config.slug !== 'cecinestpasuneslug') {
    console.log("\nLooks like this project has already been set up!\nTo setup anyway, run \n\n\tgulp setup --force\n")
    return github.ensureUpdatesRemote(done);
  }

  function cleanup() {
    console.log('All setup!')
    done();
  }

  getSlug(function(slug) {
    console.log(`Using slug: ${slug}`)
    config.slug = slug;
    getType(function() {
      fs.writeFileSync('config.json', JSON.stringify(config, null, 2));

      if (config.type == 'header') {
        handleHeaderTemplateFiles(() => handleMatchingRepo(cleanup))
      } else {
        handleMatchingRepo(cleanup);
      }
    });
  });
}


function handleMatchingRepo(cb) {
  getBooleanInput('Do you want to create a matching Github repo?', function(repo) {
    if (repo) {
      github.createAndSetRepository(() => {
        github.setupDefaultLabels(cb);
      });
    } else {
      cb();
    }
  });
}


function handleHeaderTemplateFiles(cb) {
  const readPathMustache = './post-templates/_dynamic-header.mustache';
  const readPathData = './post-templates/default-header-data.json';
  const writePathMustache = './src/header.mustache';
  const writePathData = './post-templates/custom-header-data.json';

  function writeTemplateFile(src, dest, callback) {
    if (fs.existsSync(dest)) {
      getBooleanInput(`Do you want to overwrite the existing ${ dest } file?`, (overwrite) => {
        if (overwrite) {
          fs.copyFileSync(src, dest);
          console.log(`Template copied to ${ dest }`)
        } else {
          console.log('Did not copy template.');
        }

        callback();
      });
    } else {
      fs.copyFileSync(src, dest);
      console.log(`Header template file copied to ${ dest }`)
      callback();
    }
  }

  writeTemplateFile(readPathMustache, writePathMustache, () => {
    writeTemplateFile(readPathData, writePathData, cb);
  });
}


function getType(cb) {

  getInputFromValues('\n\n\t[c]ommentary graphic\n\t[b]ase graphic\n\t[f]reeform post\n\tfreeform [h]ead\n\nWhat kind of project is this?', ['c', 'b', 'f', 'h'], function(response) {
    switch(response) {
      case 'c':
        config.local_template = 'commentary';
        config.type = 'graphic';
        break;
      case 'b':
        config.local_template = 'post';
        config.type = 'graphic';
        break;
      case 'f':
        config.local_template = 'freeform';
        config.type = 'post';
        break;
      case 'h':
        config.local_template = 'freeform-header';
        config.type = 'header';
        break;
      default:
        break;
    }
    cb();
  });
}


function resetType(done) {
  getType(function() {
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    done();
  });
}


function getSlug(cb) {
  function validator(value) {
    if (/[^\w-]/.test(value)) {
      return "Slugs can contain only letters, numbers, dashes, and underscores.";
    }
  }

  var currentDir = path.basename(process.cwd());

  getInput("Enter a slug, (you can leave off the date) (leave blank for: " + currentDir + ")", validator, function(slug) {
    if (slug.trim().length === 0) {
      slug = currentDir;
    }

    slug = slug.toLowerCase().trim();

    getBooleanInput("Do you want to append the date", function(date) {
      if (date) {
        slug += moment().format('YYYYMMDD');
      }
      cb(slug);
    });
  });
}


function getInput(prompt, validator, cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`${prompt}: ` , (answer) => {
    rl.close();
    answere = answer.trim();
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
  getInputFromValues(prompt + ' [y/n]', ['y', 'n'], function(answer) {
    cb(answer === 'y');
  });
}


module.exports = {
  setup: setup,
  resetType: resetType,
  handleHeaderTemplateFiles: handleHeaderTemplateFiles
};
