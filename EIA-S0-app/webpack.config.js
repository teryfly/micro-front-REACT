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
  },

  output: {
    publicPath: 'http://localhost:7002/',
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
    // EIA-S0-app 暴露模块
    new ModuleFederationPlugin({
      name: 'remoteApp2', // 远程容器名称
      filename: 'remoteEntry.js',

      exposes: {
        './Button': './src/Button',
        './App': './src/App', // 新增：暴露完整首页
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