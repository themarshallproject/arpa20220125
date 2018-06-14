var express = require('express');
var fs = require('fs');
var marked = require('marked');

module.exports = function(options) {
  var app = express();
  app.use(express.static('build'));

  var config;
  config = JSON.parse(fs.readFileSync('./config.json'), 'utf-8');
  console.log('Config:', config);

  // TODO is this really the best way to serve fonts?
  var fonts = fs.readFileSync('./post-templates/fonts.css', 'utf-8');

  var lrPort = options.lrPort || 35729;
  var livereloadScript = "<script src='//localhost:" + lrPort + "/livereload.js'></script>";
  var injectPayload = [
    livereloadScript,
    "<link rel='stylesheet' href='/fonts.css'>",
    "<link rel='stylesheet' href='/graphic.css'>",
    "<script src='/graphic.js'></script>\n"
  ].join("\n");

  app.get('/', function(req, res){
    fs.readFile('./build/graphic.html', 'utf8', function(err, content) {
      var template = fs.readFileSync('./post-templates/' + config.local_template + '.html', 'utf-8') // todo, configurable

      var contentHTML;
      if (config.local_markdown === true) {
        contentHTML = marked(content);
      } else {
        contentHTML = content;
      }
      var html = template.replace('|CONTENT|', injectPayload + contentHTML);
      res.send(html);
    });
  });

  app.get('/readme/', function(req, res) {
    fs.readFile('./build/README.md', 'utf8', function(err, content) {
      var template = fs.readFileSync('./post-templates/readme.html', 'utf-8');
      var contentHTML = marked(content);
      var html = template.replace('|CONTENT|', livereloadScript + contentHTML);
      res.send(html);
    });
  });

  app.get('/fonts.css', function(req, res) {
    res.contentType('text/css');
    res.setHeader('Cache-Control', 'public,max-age=60')
    res.send(fonts);
  });

  port = options.port || 3000;

  app.listen(port);

  console.log('Express server listening on port ' + port + ', livereload on ' + lrPort);
  return app;
};

