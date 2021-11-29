import express from 'express';
import fs from 'fs';
import * as renderer from './localrenderer.js';

export default function server(options) {
  var app = express();
  app.use(express.static('build'));
  app.use('/examples', express.static('build-examples'));
  app.use(express.static('post-templates'));

  var config;
  config = JSON.parse(fs.readFileSync('./config.json'), 'utf-8');
  console.log('Config:', config);

  const lrPort = options.lrPort || 35729;

  app.get('/', function (req, res) {
    res.send(renderer.renderTemplate({ lrPort: lrPort }));
  });

  app.get('/examples/', function (req, res) {
    res.send(
      renderer.renderTemplate({
        lrPort: lrPort,
        examples: true,
      })
    );
  });

  app.get('/embeds/', function (req, res) {
    res.send(
      renderer.renderTemplate({
        lrPort: lrPort,
        template: 'embeds',
      })
    );
  });

  app.get('/readme/', function (req, res) {
    res.send(renderer.renderReadme({ lrPort: lrPort }));
  });

  app.get('/templates/charts/readme/', function (req, res) {
    res.send(renderer.renderGraphicsReadme({ lrPort: lrPort }));
  });

  const port = options.port || 3000;

  app.listen(port);

  console.log(
    'Express server listening on port ' + port + ', livereload on ' + lrPort
  );
  return app;
}
