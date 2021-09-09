const path = require('path');


function getConfig(env) {
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
      modules: [
        path.resolve(__dirname, 'templates'),
        'node_modules'
      ],
    },
    module: {
      rules: [
        // transpile js
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader'
          }
        },
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
                  dev: env === 'development' ? true : false
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
    mode: env,
    devtool: env === 'production' ? false : 'inline-source-map'
  }

  if (env === 'production') {
    config.optimization = {
      minimize: true
    }
  }

  return config;
}


module.exports = getConfig;
