// packages
import { reload } from 'gulp-livereload';
import polka from 'polka';
import send from '@polka/send-type';
import sirv from 'sirv';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';

// local
import { getLocalConfig } from './config.js';
import * as renderer from './localrenderer.js';
import getWebpackConfig from '../webpack.config.js';

const htmlContentType = {
  'Content-Type': 'text/html',
};

export default function server(options) {
  var app = polka();
  app.use(sirv('build', { dev: true }));
  app.use('/examples', sirv('build-examples', { dev: true }));
  app.use(sirv('post-templates', { dev: true }));

  var config = getLocalConfig();
  console.log('Config:', config);

  const lrPort = options.lrPort || 35729;

  const webpackConfig = getWebpackConfig('development');
  const compiler = webpack(webpackConfig);

  compiler.hooks.done.tap('done', () => {
    reload();
  });

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    })
  );

  app.get('/', function (_, res) {
    send(res, 200, renderer.renderTemplate({ lrPort: lrPort }), {
      'Content-Type': 'text/html',
    });
  });

  app.get('/examples/', function (_, res) {
    send(
      res,
      200,
      renderer.renderTemplate({
        lrPort: lrPort,
        examples: true,
      }),
      htmlContentType
    );
  });

  app.get('/embeds/', function (_, res) {
    send(
      res,
      200,
      renderer.renderTemplate({
        lrPort: lrPort,
        template: 'embeds',
      }),
      htmlContentType
    );
  });

  app.get('/readme/', function (_, res) {
    send(res, 200, renderer.renderReadme({ lrPort: lrPort }), htmlContentType);
  });

  app.get('/templates/charts/readme/', function (_, res) {
    send(
      res,
      200,
      renderer.renderGraphicsReadme({ lrPort: lrPort }),
      htmlContentType
    );
  });

  const port = options.port || 3000;

  app.listen(port);

  console.log(
    'Dev server listening on port ' + port + ', livereload on ' + lrPort
  );
  return app;
}
