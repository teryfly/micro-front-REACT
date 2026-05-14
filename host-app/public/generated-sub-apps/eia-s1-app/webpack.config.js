const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

// Override via env: APP_NAME=myApp PORT=7003 npm start
const APP_NAME = process.env.APP_NAME || 'eIAS1App';
const PORT = parseInt(process.env.PORT || '7005', 10);

module.exports = {
  entry: './src/index.js',
  mode: 'development',

  devServer: {
    port: PORT,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  output: {
    publicPath: `http://localhost:${PORT}/`,
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-react'] },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: APP_NAME,
      filename: 'remoteEntry.js',

      exposes: {
        // 主集成入口 — host-app 通过此模块嵌入整个子应用
        './EmbeddedApp': './src/EmbeddedApp',
        // 独立首页（向下兼容）
        './App': './src/App',
        // 单独组件示例（向下兼容）
        './Button': './src/Button',
      },

      shared: {
        react: { singleton: true, requiredVersion: '>=18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '>=18.0.0' },
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
