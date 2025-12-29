const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',

  devServer: {
    port: 7000,
    hot: true,
    open: true,
  },

  output: {
    publicPath: 'http://localhost:7000/',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'host',

      remotes: {
        // 对应 remote-app (7001)
        remoteApp1: 'remoteApp1@http://localhost:7001/remoteEntry.js',
        // 对应 EIA-S0-app (7002)
        remoteApp2: 'remoteApp2@http://localhost:7002/remoteEntry.js',
      },

      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};