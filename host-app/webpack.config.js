const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

/**
 * 解析 .env 文件（零依赖实现，避免引入 dotenv）
 * @param {string} file 文件绝对路径
 * @returns {Object}
 */
function parseEnvFile(file) {
  if (!fs.existsSync(file)) return {};

  const result = {};
  fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const index = trimmed.indexOf('=');
      if (index === -1) return;

      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    });

  return result;
}

/**
 * 收集需要注入浏览器端的环境变量
 * 优先级：shell 环境变量 > .env.[mode].local > .env.local > .env.[mode] > .env
 * 仅注入 REACT_APP_ 前缀的变量 + NODE_ENV
 * @returns {Object}
 */
function collectClientEnv() {
  const mode = process.env.NODE_ENV || 'development';
  const fileEnv = {
    ...parseEnvFile(path.resolve(__dirname, '.env')),
    ...parseEnvFile(path.resolve(__dirname, `.env.${mode}`)),
    ...parseEnvFile(path.resolve(__dirname, '.env.local')),
    ...parseEnvFile(path.resolve(__dirname, `.env.${mode}.local`)),
  };

  const clientEnv = { NODE_ENV: mode };

  Object.keys(fileEnv)
    .filter((key) => key.startsWith('REACT_APP_'))
    .forEach((key) => {
      clientEnv[key] = fileEnv[key];
    });

  // shell 环境变量优先级最高
  Object.keys(process.env)
    .filter((key) => key.startsWith('REACT_APP_'))
    .forEach((key) => {
      clientEnv[key] = process.env[key];
    });

  return clientEnv;
}

const clientEnv = collectClientEnv();

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
      watch: { ignored: /node_modules/ },
    },

    /**
     * 子应用生成 API（Node.js 服务端，运行在 webpack-dev-server 进程中）
     *
     * POST /api/generate-subapp  — 从 sub_app_template 生成配置好的子应用压缩包
     * GET  /api/list-generated   — 列出 public/generated-sub-apps/ 下已有的压缩包
     */
    setupMiddlewares: (middlewares, devServer) => {
      const app      = devServer.app;
      const fs       = require('fs');
      const fsp      = fs.promises;
      const np       = require('path');
      const JSZip    = require('jszip');

      const TMPL_DIR = np.join(__dirname, 'sub_app_template');
      const OUT_DIR  = np.join(__dirname, 'public', 'generated-sub-apps');

      if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

      /* 手动解析 JSON 请求体 */
      function parseBody(req) {
        return new Promise((resolve, reject) => {
          let raw = '';
          req.on('data', c => (raw += c.toString()));
          req.on('end', () => { try { resolve(JSON.parse(raw)); } catch (e) { reject(e); } });
          req.on('error', reject);
        });
      }

      /* 替换 {{VAR}} 占位符 */
      function applyVars(text, vars) {
        return text.replace(/\{\{(\w+)\}\}/g, (_, k) =>
          vars[k] !== undefined ? vars[k] : `{{${k}}}`
        );
      }

      /* 递归读取模板文件（跳过 node_modules / .git / dist / package-lock） */
      async function readTmpl(dir, base = '') {
        const out = {};
        let entries;
        try { entries = await fsp.readdir(dir, { withFileTypes: true }); }
        catch { return out; }
        for (const e of entries) {
          if (['node_modules', '.git', 'dist'].includes(e.name)) continue;
          if (e.name === 'package-lock.json') continue;
          const full = np.join(dir, e.name);
          const rel  = base ? `${base}/${e.name}` : e.name;
          if (e.isDirectory()) {
            Object.assign(out, await readTmpl(full, rel));
          } else {
            try { out[rel] = await fsp.readFile(full, 'utf8'); } catch { /* skip binary */ }
          }
        }
        return out;
      }

      /* ── POST /api/generate-subapp ── */
      app.post('/api/generate-subapp', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const { appId, appName, containerName, port, route, primaryColor, description, apiBaseUrl }
            = await parseBody(req);

          if (!appId || !appName || !containerName || !port) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: '缺少必填字段' }));
          }

          const vars = {
            APP_NAME:       appName,
            APP_ID:         appId,
            CONTAINER_NAME: containerName,
            PORT:           String(port),
            ROUTE:          route || `/${appId}`,
            PRIMARY_COLOR:  primaryColor || '#1890ff',
            DESCRIPTION:    description  || `${appName} 微前端子应用`,
            API_BASE_URL:   apiBaseUrl   || 'http://localhost:5090',
          };

          const tmplFiles = await readTmpl(TMPL_DIR);
          if (!Object.keys(tmplFiles).length) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: `模板目录为空: ${TMPL_DIR}` }));
          }

          /* 打包为 ZIP */
          const zip    = new JSZip();
          const folder = zip.folder(appId);
          for (const [p, c] of Object.entries(tmplFiles)) folder.file(p, applyVars(c, vars));

          const buf     = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
          const zipName = `${appId}.zip`;
          const zipPath = np.join(OUT_DIR, zipName);
          await fsp.writeFile(zipPath, buf);

          /* 同时展开源文件到 public/generated-sub-apps/[appId]/ */
          const srcDir = np.join(OUT_DIR, appId);
          await fsp.mkdir(srcDir, { recursive: true });
          for (const [p, c] of Object.entries(tmplFiles)) {
            const dest = np.join(srcDir, p);
            await fsp.mkdir(np.dirname(dest), { recursive: true });
            await fsp.writeFile(dest, applyVars(c, vars), 'utf8');
          }

          const stat = await fsp.stat(zipPath);
          res.end(JSON.stringify({
            success:     true,
            appId,
            zipName,
            downloadUrl: `/generated-sub-apps/${zipName}`,
            filesCount:  Object.keys(tmplFiles).length,
            sizeBytes:   stat.size,
            createdAt:   stat.mtime.toISOString(),
          }));

        } catch (err) {
          console.error('[generate-subapp]', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      /* ── GET /api/list-generated ── */
      app.get('/api/list-generated', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        try {
          const zips = fs.existsSync(OUT_DIR)
            ? fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.zip'))
            : [];
          const apps = zips
            .map(f => {
              const fp   = np.join(OUT_DIR, f);
              const stat = fs.statSync(fp);
              return {
                appId:       f.replace('.zip', ''),
                zipName:     f,
                downloadUrl: `/generated-sub-apps/${f}`,
                sizeBytes:   stat.size,
                createdAt:   stat.mtime.toISOString(),
              };
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          res.end(JSON.stringify({ apps }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      return middlewares;
    },
  },

  output: {
    // 'auto' 让 webpack 在运行时根据当前页面地址（localhost / IP / 域名）自动确定资源路径，
    // 避免把资源写死成 http://localhost:7000，从而支持用本机 IP 或任意域名访问而不白屏。
    // shell 环境变量 REACT_APP_PUBLIC_PATH 可强制覆盖（用于生产 CDN 场景）。
    publicPath: process.env.REACT_APP_PUBLIC_PATH || (process.env.NODE_ENV === 'production' ? './' : 'auto'),
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
                localIdentName: '[name]__[local]--[hash:base64:5]',
                namedExport: false,
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
    /**
     * 把 .env 中的 REACT_APP_* 注入到浏览器端
     * 注意：这里整体替换 process.env，因此代码里可以安全使用 process.env.REACT_APP_XXX
     */
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(clientEnv),
    }),

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
