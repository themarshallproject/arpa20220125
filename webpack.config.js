const path = require('path');


module.exports = {
  entry: {
    graphic: ['./src/graphic.js']
  },
  output: {
    path: __dirname + '/build',
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
  },
  resolve: {
    alias: {
      svelte: path.dirname(require.resolve('svelte/package.json'))
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main']
  },
  module: {
    rules: [
      // transpile js svelte helpers
      {
        test: /\.m?js$/,
        include: [/svelte/],
        use: ['babel-loader'],
      },
      {
        test: /\.svelte$/,
        use: [
          'babel-loader',
          {
            loader: 'svelte-loader',
            options: {
              hotReload: false,
              compilerOptions: {
                dev: true
              }
            }
          }
        ]
      },
      {
        // required to prevent errors from Svelte on Webpack 5+
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  mode: 'production',
};
