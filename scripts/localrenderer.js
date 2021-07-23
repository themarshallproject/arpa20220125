const fs = require('fs');
const config = require('../config.json');
const marked = require('marked');
const Mustache = require('mustache');

function renderTemplate(options) {
  const renderedTemplate = renderGraphics(options);
  const renderedWithNav = renderNavBar(renderedTemplate);
  return renderMetadata(renderedWithNav);
}


function renderMetadata(html) {
  return html.replace(/\|META:(.*)\|/, (match, group1) => config[group1]);
}


function renderNavBar(html) {
  var navBarHtml = fs.readFileSync('./post-templates/_nav-bar.html');
  return html.replace(/\|NAV_BAR\|/, navBarHtml);
}


function renderFromPostData(html) {
  var postResponse = fs.readFileSync('./post-templates/custom-header-data.json');
  var postData = JSON.parse(postResponse);
  var renderedHtml = Mustache.render(html, postData);
  return renderedHtml;
}


function renderGraphics(options) {
  var template = fs.readFileSync('./post-templates/' + config.local_template + '.html', 'utf-8');
  var multiTemplate = fs.readFileSync('./post-templates/_multi-graphic.html', 'utf-8');
  var localText = fs.readFileSync('./post-templates/localtext.md', 'utf-8').trim();

  var graphics = options.examples ? getExamples(options) : getGraphics(options);
  var graphicKeys = Object.keys(graphics).filter(k => k != 'header');
  var headerHTML = graphics['header'];

  if (localText && !options.examples) {
    content = replaceGraphics(graphics, localText);
  } else {
    content = '';
    for (i in graphicKeys) {
      const key = graphicKeys[i];
      if (i < graphicKeys.length - 1) {
        // If we have multiple graphics and it's not the last graphic in the
        // list, we want to add some lorem ipsum to space them out.
        graphicHTML = multiTemplate.replace('|CONTENT|', graphics[key]);
        content += graphicHTML;
      } else {
        content += graphics[key];
      }
    }
  }

  var contentHTML;
  if (config.local_markdown === true) {
    contentHTML = marked(content);
  } else {
    contentHTML = content;
  }

  if (headerHTML) {
    // Render mustache templates using post data from Endrun.
    headerHTML = renderFromPostData(headerHTML);
    var html = template.replace('|CONTENT|', getIncludes(options) + headerHTML);
    html = html.replace('|GRAPHIC_CONTENT|', contentHTML);
  } else {
    var html = template.replace('|CONTENT|', getIncludes(options) + contentHTML);
    html = html.replace('|GRAPHIC_CONTENT|', '');
  }
  return html;
}


function replaceGraphics(graphics, text) {
  var regex = /\[graphic .*slug=["\']?(\S+):(\S+)[\'"]?\s*.*\]/;
  var lines = text.split('\n');
  return lines.map(function(line) {
    var groups = line.match(regex);
    if (groups === null) {
      return line;
    }

    var slug = groups[1];
    var key = groups[2];

    // TODO test these cases
    if (slug != config.slug) {
      return renderWarning('Found graphic slug that does not match repo slug.');
    }

    if (graphics[key] === undefined) {
      return renderWarning('Missing graphic with slug ' + slug + ':' + key);
    }

    return graphics[key];
  }).join('\n');
}


function renderWarning(text) {
  return '<h1 style="color: red;">' + text + '</h1>'
}


function getGraphics(options) {
  var dirPath = options && options.dirPath || './build/';
  var files = fs.readdirSync(dirPath, 'utf-8');
  var graphics = {};
  var isProduction = options && options.isProduction || false;

  files.forEach(function(filename) {
    let key;
    if (filename.match(/[^_].*\.html$/)) {
      key = filename.replace(/\.html$/, '');
    } else if (filename == 'header.mustache') {
      key = 'header';
    }

    if (key && isProduction) {
      var htmlFile = require('../dist/rev-manifest.json')[filename];
      graphics[key] = fs.readFileSync('./dist/' + htmlFile, 'utf-8');
    } else if (key) {
      graphics[key] = fs.readFileSync(dirPath + filename, 'utf-8');
    }
  });

  return graphics;
}


function getExamples(options) {
  var parentDirPath = './build-examples/';
  var dirs = fs.readdirSync(parentDirPath, 'utf-8').filter((d) => {
    return fs.lstatSync(parentDirPath + d).isDirectory();
  })
  var graphics = {};

  dirs.forEach((dirPath) => {
    var dirOptions = options;
    dirOptions['dirPath'] = `${parentDirPath + dirPath}/`;

    var dirGraphics = getGraphics(dirOptions)
    Object.assign(graphics, dirGraphics);
  })

  return graphics;
}


function renderReadme(options) {
  var content = fs.readFileSync('./build/README.md', 'utf8')
  var template = fs.readFileSync('./post-templates/readme.html', 'utf-8');
  var contentHTML = marked(content);
  var html = template.replace('|CONTENT|', getLRScript(options) + contentHTML);
  return html;
}


function renderGraphicsReadme(options) {
  var content = fs.readFileSync('./build/templates/charts/README.md', 'utf8')
  var template = fs.readFileSync('./post-templates/readme.html', 'utf-8');
  var contentHTML = marked(content);
  var html = template.replace('|CONTENT|', getLRScript(options) + contentHTML);
  return html;
}


function getIncludes(options) {
  const dirPath = options.examples ? '/examples' : '';
  return [
    getLRScript(options),
    `<link rel='stylesheet' href='/fonts.css'>`,
    `<link rel='stylesheet' href='${dirPath}/graphic.css'>`,
    `<script src='${dirPath}/graphic.js'></script>\n`
  ].join("\n");
}


function getLRScript(options) {
  return "<script src='//localhost:" + options.lrPort + "/livereload.js'></script>";
}


module.exports = {
  renderTemplate: renderTemplate,
  renderReadme: renderReadme,
  renderGraphicsReadme: renderGraphicsReadme,
  getGraphics: getGraphics
}
