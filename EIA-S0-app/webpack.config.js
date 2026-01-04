const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  entry: './src/index.js',
  mode: 'development',

  devServer: {
    port: 7002, // EIA-S0-app
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*', // 允许跨域
    },
    historyApiFallback: true, // React Router support
  },

  output: {
    publicPath: 'http://localhost:7002/',
  },

  module: {
    rules: [
      // CSS Modules support
      {
        test: /\.module\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false, // ensure `import styles from './x.module.css'` works as expected
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
        ],
      },

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
      name: 'remoteApp2',
      filename: 'remoteEntry.js',

      exposes: {
        './Button': './src/Button',
        './App': './src/App',
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