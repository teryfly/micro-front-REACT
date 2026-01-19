const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',

  devServer: {
    port: 7001,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    historyApiFallback: true,
  },

  output: {
    publicPath: 'http://localhost:7001/',
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
      name: 'remoteApp1',
      filename: 'remoteEntry.js',

      exposes: {
        './Button': './src/Button',
        './App': './src/App',
        './EmbeddedApp': './src/EmbeddedApp', // NEW: Expose embedded mode component
      },

      shared: {
        react: { 
          singleton: true, 
          strictVersion: true,
          requiredVersion: '^19.2.0',
          eager: false,
        },
        'react-dom': { 
          singleton: true, 
          strictVersion: true,
          requiredVersion: '^19.2.0',
          eager: false,
        },
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};