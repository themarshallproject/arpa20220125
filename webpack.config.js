import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const babelPreset = {
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-env'],
  },
};

export default function getConfig(env) {
  const config = {
    output: {
      path: __dirname + '/build',
      filename: '[name].js',
      chunkFilename: '[name].[id].js',
    },
    resolve: {
      alias: {
        svelte: path.dirname(require.resolve('svelte/package.json')),
      },
      extensions: ['.mjs', '.js', '.svelte'],
      mainFields: ['svelte', 'browser', 'module', 'main'],
      modules: [path.resolve(__dirname, 'templates'), 'node_modules'],
    },
    module: {
      rules: [
        // transpile js
        {
          test: /\.js$/,
          use: babelPreset,
        },
        // transpile js svelte helpers
        {
          test: /\.m?js$/,
          include: [/svelte/],
          use: babelPreset,
        },
        {
          test: /\.svelte$/,
          use: [
            babelPreset,
            {
              loader: 'svelte-loader',
              options: {
                hotReload: false,
                compilerOptions: {
                  dev: env === 'development' ? true : false,
                },
              },
            },
          ],
        },
        {
          // required to prevent errors from Svelte on Webpack 5+
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    mode: env,
    devtool: env === 'production' ? false : 'inline-source-map',
  };

  if (env === 'production') {
    config.optimization = {
      minimize: true,
    };
  }

  return config;
}
