var fs = require('fs');
const log = require('fancy-log');

var config = require('../config.json');


function stylesheetIncludeText(options={}) {
  var stylesheets;
  var filename = 'graphic.css';
  var filepath = './build/' + filename;
  var size = fs.statSync(filepath).size;
  log('Handling css file ', filename, size + 'b minified');

  if (config.type === 'header') {
    log('Inlining CSS for freeform header')
    stylesheets = '<style>' + fs.readFileSync(filepath) + '</style>';
  } else if (options.forceAsync || size > config.inline_threshold) {
    log('Large CSS file found, will load asynchronously');
    stylesheets = '<link rel="stylesheet" href="/' + filename + '">';
  } else if (size === 0) {
    log('Empty CSS file found, omitting');
    stylesheets = '';
  } else {
    log('Small CSS file found, inlining');
    stylesheets = '<style>' + fs.readFileSync(filepath) + '</style>';
  }

  return stylesheets + '\n';
}


function javascriptIncludeText() {
  var scripts;
  var filename = 'graphic.js';
  var filepath = './build/' + filename;
  var size = fs.statSync(filepath).size;
  log('Handling js file graphic.js ' + size + 'b minified');

  if (size > 0) {
    log('JS found, adding script tag');
    scripts = '<script src="/' + filename + '" type="text/javascript" defer></script>';
  } else {
    log('Empty JS file found, omitting');
    scripts = '';
  }

  return scripts + '\n';
}


module.exports = {
  stylesheetIncludeText,
  javascriptIncludeText,
}
