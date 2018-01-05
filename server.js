var express = require('express');
var fs = require('fs');
var marked = require('marked');

module.exports = function(options) {
  var app = express();
  app.use(express.static('dist'));

  var config;
  config = JSON.parse(fs.readFileSync('./config.json'), 'utf-8');
  console.log('Config:', config);

  // TODO is this really the best way to serve fonts?
  var fonts = fs.readFileSync('./templates/fonts.css', 'utf-8');

  var template = fs.readFileSync('./templates/' + config.local_template + '.html', 'utf-8') // todo, configurable
  var lrPort = options.lrPort || 35729;
  var injectPayload = [
    "<script src='//localhost:" + lrPort + "/livereload.js'></script>",
    "<link rel='stylesheet' href='/fonts.css'>",
    "<link rel='stylesheet' href='/app.css'>",
    "<script src='/app.js'></script>\n"
  ].join("\n");

  app.get('/', function(req, res){
    fs.readFile('./dist/app.html', 'utf8', function(err, content) {

      var contentHTML;
      if (config.local_markdown === 'true') {
        contentHTML = marked(content);
      } else {
        contentHTML = content;
      }
      var html = template.replace('|CONTENT|', injectPayload + contentHTML);
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

