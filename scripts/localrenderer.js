var fs = require('fs');
var config = require('../config.json');
var marked = require('marked');

function renderTemplate(options) {
  if (config.multiple_graphics || options.examples) {
    return renderMultiple(options);
  } else {
    return renderSingle(options)
  }
}


function renderSingle(options) {
  var content = fs.readFileSync('./build/graphic.html', 'utf-8');
  var template = fs.readFileSync('./post-templates/' + config.local_template + '.html', 'utf-8');
  var contentHTML;
  if (config.local_markdown === true) {
    contentHTML = marked(content);
  } else {
    contentHTML = content;
  }

  var html = template.replace('|CONTENT|', getIncludes(options) + contentHTML);
  html = html.replace('|GRAPHIC_CONTENT|', '');
  return html;
}


function renderMultiple(options) {
  var template = fs.readFileSync('./post-templates/' + config.local_template + '.html', 'utf-8');
  var multiTemplate = fs.readFileSync('./post-templates/_multi-graphic.html', 'utf-8');
  var localText = fs.readFileSync('./post-templates/localtext.md', 'utf-8').trim();

  var graphics = options.examples ? getExamples(options) : getGraphics(options);
  var headerContent = graphics['header'];

  if (localText && !options.examples) {
    content = replaceGraphics(graphics, localText);
  } else {
    content = '';
    for (key in graphics) {
      if (key !== 'header') {
        graphicHTML = multiTemplate.replace('|CONTENT|', graphics[key]);
        content += graphicHTML;
      }
    }
  }
  var contentHTML;
  if (config.local_markdown === true) {
    contentHTML = marked(content);
  } else {
    contentHTML = content;
  }

  if (headerContent) {
    var html = template.replace('|CONTENT|', getIncludes(options) + headerContent);
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
  var dirPath = options.dirPath || './build/';
  var files = fs.readdirSync(dirPath, 'utf-8');
  var graphics = {};
  var isProduction = options && options.isProduction || false;

  files.forEach(function(filename) {
    if (filename.match(/[^_].*\.html$/)) {
      var key = filename.replace(/\.html$/, '');
      if (isProduction) {
        var htmlFile = require('../dist/rev-manifest.json')[filename];
        graphics[key] = fs.readFileSync('./dist/' + htmlFile, 'utf-8');
      } else {
        graphics[key] = fs.readFileSync(dirPath + filename, 'utf-8');
      }
    }
  });
  return graphics;
}


function getExamples(options) {
  var parentDirPath = './build/examples/';
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
  if (options.examples) {
    return [
      getLRScript(options),
      "<link rel='stylesheet' href='/fonts.css'>",
      "<link rel='stylesheet' href='/examples/examples.css'>",
      "<script src='/examples/examples.js'></script>\n"
    ].join("\n");
  } else {
    return [
      getLRScript(options),
      "<link rel='stylesheet' href='/fonts.css'>",
      "<link rel='stylesheet' href='/graphic.css'>",
      "<script src='/graphic.js'></script>\n"
    ].join("\n");
  }
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
