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
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
      watch: {
        ignored: /node_modules/,
      }
    }
  },

  output: {
    publicPath: 'http://localhost:7000/',
    clean: true
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
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          }
        ]
      }
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'host',

      // 移除硬编码的remotes，改为运行时动态加载
      remotes: {},

      shared: {
        react: { 
          singleton: true, 
          strictVersion: true,
          requiredVersion: '^19.2.0',
          eager: false
        },
        'react-dom': { 
          singleton: true,
          strictVersion: true, 
          requiredVersion: '^19.2.0',
          eager: false
        }
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};