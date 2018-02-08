var fs = require('fs');
const log = require('fancy-log');

var config = require('../config.json');


function stylesheetIncludeText() {
  var stylesheets;
  var filename = 'graphic.css';
  var filepath = './build/' + filename;
  var size = fs.statSync(filepath).size;
  log('Handling css file ', filename, size + 'b minified');

  if (config.type === 'header') {
    log('Inlinining CSS for freeform header');
    stylesheets = '<style>' + fs.readFileSync(filepath) + '</style>';
  } else if (size < config.inline_threshold) {
    log('Small CSS file found, inlining');
    stylesheets = '<style>' + fs.readFileSync(filepath) + '</style>';
  } else if (size === 0) {
    log('Empty CSS file found, omitting');
    stylesheets = '';
  } else {
    log('Largs CSS file found, will load asynchronously');
    stylesheets = '<link rel="stylesheet" href="/' + filename + '">';
  }

  return stylesheets + '\n';
}


function javascriptIncludeText() {
  var scripts;
  var filename = 'graphic.js';
  var filepath = './build/' + filename;
  var size = fs.statSync(filepath).size;
  log('Handling js file graphic.js ' + size + 'b minified');

  if (size > config.inline_threshold) {
    log('Largs JS file found, will load asynchronously');
    scripts = '<script src="/' + filename + '" type="text/javascript"></script>';
  } else if (size === 0) {
    log('Empty JS file found, omitting');
    scripts = '';
  } else {
    log('Small JS file found, inlining');
    scripts = '<script type="text/javascript">' + fs.readFileSync(filepath) + '</script>';
  }

  return scripts + '\n';
}


module.exports = {
  stylesheetIncludeText,
  javascriptIncludeText,
}
