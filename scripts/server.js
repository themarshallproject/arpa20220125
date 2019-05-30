var express = require('express');
var fs = require('fs');
var renderer = require('./localrenderer.js');

module.exports = function(options) {
  var app = express();
  app.use(express.static('build'));
  app.use(express.static('post-templates'));

  var config;
  config = JSON.parse(fs.readFileSync('./config.json'), 'utf-8');
  console.log('Config:', config);

  var lrPort = options.lrPort || 35729;

  app.get('/', function(req, res) {
    res.send(renderer.renderTemplate({ lrPort: lrPort }));
  });

  app.get('/readme/', function(req, res) {
    res.send(renderer.renderReadme({ lrPort: lrPort }))
  });

  app.get('/graphic-templates/readme/', function(req, res) {
    res.send(renderer.renderGraphicsReadme({ lrPort: lrPort }))
  });

  port = options.port || 3000;

  app.listen(port);

  console.log('Express server listening on port ' + port + ', livereload on ' + lrPort);
  return app;
};

