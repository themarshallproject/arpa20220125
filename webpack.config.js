// native
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jsRegex = /\.(mjs|js|jsx|ts|tsx)$/;

/** @typedef {import('webpack').Configuration} WebpackConfig */

/**
 * @param {'development' | 'production'} mode
 * @param {WebpackConfig.entry} entry
 * @param {WebpackConfig.output.path} outputPath
 * @returns {WebpackConfig}
 */
export default function getConfig(mode, entry, outputPath) {
  const isDev = mode === 'development';

  /** @type {WebpackConfig} */
  const config = {
    mode,
    devtool: isDev ? 'eval-source-map' : 'source-map',
    entry: entry || { graphic: './src/graphic.js' },
    output: {
      path: outputPath ? outputPath : path.join(__dirname, 'build'),
      filename: '[name].js',
      chunkFilename: '[name].[id].js',
      publicPath: '/',
    },
    resolve: {
      alias: {
        svelte: path.resolve('node_modules', 'svelte'),
      },
      extensions: ['.mjs', '.js', '.svelte'],
      mainFields: ['svelte', 'module', 'browser', 'main'],
    },
    module: {
      parser: {
        javascript: {
          exportsPresence: 'error',
        },
      },
      rules: [
        {
          test: /\.svelte$/,
          use: {
            loader: 'svelte-loader',
            options: {
              dev: true,
            },
          },
        },
        {
          // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false,
          },
        },
        !isDev && {
          test: jsRegex,
          exclude: {
            // exclude node_modules...
            or: [/node_modules/],
            // ...but keep svelte internals
            not: [/node_modules\/svelte\/internal/],
          },
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['@babel/preset-env'],
            },
          },
        },
      ].filter(Boolean),
    },
  };

  return config;
}
