var express = require('express');
var fs = require('fs');
var renderer = require('./localrenderer.js');

module.exports = function(options) {
  var app = express();
  app.use(express.static('build'));

  var config;
  config = JSON.parse(fs.readFileSync('./config.json'), 'utf-8');
  console.log('Config:', config);

  // TODO is this really the best way to serve fonts?
  var fonts = fs.readFileSync('./post-templates/fonts.css', 'utf-8');
  var ghMarkdown = fs.readFileSync('./post-templates/github-markdown.css', 'utf-8');

  var lrPort = options.lrPort || 35729;

  app.get('/', function(req, res) {
    res.send(renderer.renderTemplate({ lrPort: lrPort }));
  });

  app.get('/readme/', function(req, res) {
    res.send(renderer.renderReadme({ lrPort: lrPort }))
  });

  app.get('/fonts.css', function(req, res) {
    res.contentType('text/css');
    res.setHeader('Cache-Control', 'public,max-age=60')
    res.send(fonts);
  });

  app.get('/github-markdown.css', function(req, res) {
    res.contentType('text/css');
    res.setHeader('Cache-Control', 'public,max-age=60')
    res.send(ghMarkdown);
  });

  port = options.port || 3000;

  app.listen(port);

  console.log('Express server listening on port ' + port + ', livereload on ' + lrPort);
  return app;
};

