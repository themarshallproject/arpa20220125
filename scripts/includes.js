var fs = require('fs');
const log = require('fancy-log');

var config = require('../config.json');


function stylesheetIncludeText() {
  var manifest = JSON.parse(fs.readFileSync('asset_manifest.json'));
  var stylesheets = manifest.css.map(function(filename) {
    filename = './dist/' + filename;
    var size = fs.statSync(filename).size;
    log('Handling css file ', filename, size + 'b minified');

    if (config.type === 'header') {
      log('Inlinining CSS for freeform header');
      return '<style>' + fs.readFileSync(filename) + '</style>';
    } else if (size < config.inline_threshold) {
      log('Small CSS file found, inlining');
      return '<style>' + fs.readFileSync(filename) + '</style>';
    } else if (size === 0) {
      log('Empty CSS file found, omitting');
      return '';
    } else {
      log('Largs CSS file found, will load asynchronously');
      var url = config.cdn + '/' + config.slug + '/' + filename;
      return '<link rel="stylesheet" href="' + url + '">';
    }
  }).join('\n');

  return stylesheets + '\n';
}


function javascriptIncludeText() {
  var manifest = JSON.parse(fs.readFileSync('asset_manifest.json'));
  var scripts = manifest.js.map(function(filename) {
    filename = './dist/' + filename;
    var size = fs.statSync(filename).size;
    log('Handling js file ', filename, size + 'b minified');

    if (size > config.inline_threshold) {
      log('Largs JS file found, will load asynchronously');
      var url = config.cdn + '/' + config.slug + '/' + filename;
      return '<script src="' + url + '" type="text/javascript"></script>';
    } else if (size === 0) {
      log('Empty JS file found, omitting');
      return '';
    } else {
      log('Small JS file found, inlining');
      return '<script type="text/javascript">' + fs.readFileSync(filename) + '</script>';
    }
  }).join('\n');

  return scripts + '\n';
}


module.exports = {
  stylesheetIncludeText,
  javascriptIncludeText,
}
