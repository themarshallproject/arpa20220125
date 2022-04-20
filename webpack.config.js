// native
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// packages
import esbuild from 'esbuild';

// plugins
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jsRegex = /\.(mjs|js)$/;
const tsRegex = /\.ts$/;

// Support browserslist
// "defaults and supports es6-module and supports es6-module-dynamic-import",
const target = ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'];

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
      extensions: ['.mjs', '.js', '.ts', '.svelte'],
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
        // javascript support
        {
          test: jsRegex,
          exclude: {
            // exclude node_modules...
            or: [/node_modules/],
            // ...but keep svelte internals
            not: [/node_modules\/svelte\/internal/],
          },
          use: {
            loader: 'esbuild-loader',
            options: {
              implementation: esbuild,
              loader: 'js',
              target,
            },
          },
        },
        // typescript support
        {
          test: tsRegex,
          exclude: {
            // exclude node_modules...
            or: [/node_modules/],
            // ...but keep svelte internals
            not: [/node_modules\/svelte\/internal/],
          },
          use: {
            loader: 'esbuild-loader',
            options: {
              implementation: esbuild,
              loader: 'ts',
              target,
            },
          },
        },
      ].filter(Boolean),
    },
    plugins: [isDev && new CaseSensitivePathsPlugin()].filter(Boolean),
  };

  return config;
}
