# 改动记录 (CHANGELOG)

> 本文件记录本仓库每次有实质改动的内容，按时间倒序 / 时间线排列。
> 路径均相对于仓库根目录 `micro-front-REACT/`。

---

## 2026-08-05

### 1. 单点登录整体接入（OAuth2 授权码模式 / OIDC）

在 `host-app` 主应用中新增单点登录模块，覆盖文档四步：授权跳转 → 授权码回跳 → code 换令牌 → 获取用户信息，并包含登出与防重定向死循环。

#### 1.1 新增模块 `host-app/src/auth/`（8 个文件）

| 文件 | 职责 |
|---|---|
| `ssoConfig.js` | 配置中心。优先级：`window.__SSO_CONFIG__` > `.env` 的 `REACT_APP_SSO_*` > 内置默认值；自动派生 `authorize` / `token` / `userinfo` / `endsession` 四个端点；`redirect_uri` 留空时自动取 `window.location.origin` |
| `tokenStorage.js` | 令牌持久化（localStorage）：`access_token` / `id_token` / `token_type` / `expires_at` / `scope` / `userinfo`；`isTokenValid()` 带 60 秒提前量；支持解析 Base64/JWT 令牌取用户 id |
| `ssoService.js` | 文档四步实现：拼接授权地址跳转、回调 state 校验、`POST /connect/token` 换令牌（支持后端代理 `tokenProxyUrl`）、`GET /connect/userinfo`；另含 `/connect/endsession` 登出与防重定向死循环（30 秒内最多 3 次跳转） |
| `AuthContext.jsx` | 状态机 + `useAuth()`；`StrictMode` 下用 `useRef` 保证授权码只换一次；登录后把 `sub` 写入 `CURRENT_USER_ID`（菜单配置按真实用户隔离）、把 `scope + role` 写入 `USER_PERMISSIONS` |
| `AuthGuard.jsx` / `AuthGuard.module.css` | 登录完成前拦截整个应用，分别渲染「校验中 / 换取令牌中 / 跳转中 / 登录失败 / 无权限 / 需登录」 |
| `httpClient.js` | `http.get/post/...` 自动加 `Authorization: Bearer xxx`；**401 → 清令牌重新单点登录**；**403 → 按配置重登一次，仍无权限则展示无权限页**（避免死循环） |
| `authEvents.js` / `index.js` | 事件常量与统一出口，避免 `httpClient` 反向依赖 React 层 |

#### 1.2 改动既有文件

| 文件 | 改动说明 |
|---|---|
| `host-app/src/App.jsx` | 挂载顺序改为 `AuthProvider → AuthGuard → AppInitializer`，登录通过后才加载菜单和路由 |
| `host-app/src/components/TopMenuBar/UserInfo.jsx` | 展示认证中心返回的姓名 / 角色 / 工号；退出走统一登出（不再 `localStorage.clear()` 误删菜单配置） |
| `host-app/src/components/SubAppContainer/SubAppWrapper.jsx` | 子应用通过 `props.auth.getAuthorization()` 或 `AUTH_STATE_UPDATE` 消息复用主应用令牌，无需二次登录 |
| `host-app/src/communication/messageProtocol.js` | 新增 `AUTH_STATE_UPDATE` / `AUTH_LOGOUT` 消息类型 |
| `host-app/webpack.config.js` | 新增零依赖 `.env` 解析 + `DefinePlugin`（只注入 `REACT_APP_*` 与 `NODE_ENV`） |
| `host-app/.env` / `.env.development` / `.env.production` | 新增 SSO 配置项（`REACT_APP_SSO_*`） |

#### 1.3 环境变量说明（`.env` / `.env.development`）

| 变量 | 说明 |
|---|---|
| `REACT_APP_SSO_ENABLED` | 是否启用单点登录（本地无认证中心可设 `false` 用模拟用户） |
| `REACT_APP_SSO_BASE_URL` | 认证中心地址，如 `http://192.168.120.237:31000` |
| `REACT_APP_SSO_CLIENT_ID` / `REACT_APP_SSO_CLIENT_SECRET` | 注册值 |
| `REACT_APP_SSO_SCOPE` | 可访问的权限范围 |
| `REACT_APP_SSO_REDIRECT_URI` | 登录回跳地址，**留空则自动取当前站点 origin**（推荐留空） |
| `REACT_APP_SSO_POST_LOGOUT_REDIRECT_URI` | 登出回跳地址，留空同 redirect_uri |
| `REACT_APP_SSO_TOKEN_PROXY_URL` | 后端令牌代理地址；配置后由后端用 code 换令牌（避免前端暴露 `client_secret`、规避跨域） |
| `REACT_APP_SSO_AUTO_LOGIN` | 无登录态时是否自动跳转认证中心 |
| `REACT_APP_SSO_FETCH_USERINFO` | 登录后是否调用 `/connect/userinfo` |
| `REACT_APP_SSO_RELOGIN_ON_FORBIDDEN` | 接口 403 时是否重新走一次单点登录 |

---

### 2. 修复：用 IP / 域名访问时单点登录不跳转（redirect_uri 写死）

- **根因**：`.env.development` / `.env` 的 `REACT_APP_SSO_REDIRECT_URI` 被写死成 `http://localhost:7000`。认证中心登录成功后把授权码回跳到 localhost，用 IP 访问的标签页收不到 `code`，表现为"用 IP 进不去 / 不跳转"。
- **修复**：将两个文件中的 `REACT_APP_SSO_REDIRECT_URI` / `REACT_APP_SSO_POST_LOGOUT_REDIRECT_URI` 留空，`ssoConfig.js` 已支持"留空则自动取 `window.location.origin`"，从而跟随当前访问地址（localhost / IP / 域名均可）。并在 `ssoConfig.js` 增加"env 写死值与当前访问地址不一致"的控制台告警。
- **注意（需人工处理）**：
  - 认证中心必须把 `http://192.168.120.78:7000` 登记为合法 `redirect_uri`，否则会以"未注册"拒绝。
  - 前端直连换 token（`REACT_APP_SSO_TOKEN_PROXY_URL` 为空）时，认证中心需对当前访问 Origin 开 CORS，否则回跳后换 token 失败 → 建议配后端代理。
  - **改 `.env` 后必须重启 dev server**（webpack 启动期只读一次，不热更新），并硬刷新清缓存。

---

### 3. 修复：用 IP 访问整页白屏（publicPath 写死 localhost，与 redirect_uri 无关）

- **根因**：`host-app/webpack.config.js` 的 `output.publicPath` 读取 Node 的 `process.env.REACT_APP_PUBLIC_PATH`，而 webpack 配置的 `.env` 解析只把变量喂给浏览器端 `DefinePlugin`，**没有写进 Node 的 `process.env`**。因此 `.env` 里的 `REACT_APP_PUBLIC_PATH` 永远不生效，`publicPath` 落到兜底值 `http://localhost:7000/`。
  - 页面输出 `<script src="http://localhost:7000/main.js">`。用 IP 访问时浏览器去**对方自己的 localhost:7000** 拉 main.js → 404 → 整页 JS 不执行 → 白屏且无任何日志（连 `[SSO]` 都没有）。localhost 访问则刚好能拉到，所以"只有 localhost 行"。



### 2026-06-02 

- **修改说明**：全部应用管理弹框修改（静态页面数据交互）
- **修改者**：鄢晓
  - **变更文件**：

    | 文件 | 改动 |
    |---|---|
    | `host-app/src/components/TopMenuBar/TopMenuBar.jsx` | 菜单栏组件调整（合计 +216，含交互逻辑） |
    | `host-app/src/components/TopMenuBar/TopMenuBar.module.css` | 菜单栏样式（+60） |
    | `host-app/package.json` | 依赖新增（+1） |
    | `host-app/package-lock.json` | 依赖锁文件更新（+5294） |

- **说明**：顶部"全部应用"管理弹框的静态页面与数据交互实现。

### 2026-05-26

- **修改说明**：主应用，顶部应用菜单 + 全部应用弹窗展示
- **修改者**：何宪锋
  - **变更文件**：

    | 文件 | 改动 |
    |---|---|
    | `host-app/src/components/TopMenuBar/TopMenuBar.jsx` | 顶部应用菜单栏（+149） |
    | `host-app/src/components/TopMenuBar/TopMenuBar.module.css` | 菜单栏样式（+178） |
    | `host-app/src/services/menuConfigService.js` | 菜单配置服务调整（+71） |
    | `host-app/src/types/menuConfig.types.js` | 菜单配置类型定义（+28） |

  - **说明**：实现顶部应用菜单与"全部应用"弹窗展示，并完善菜单配置数据层（service + types）。

- **修改说明**：多级菜单
- **修改者**：鄢晓
  - **变更文件**：

    | 文件 | 改动 |
    |---|---|
    | `host-app/src/components/TopMenuBar/DynamicMenuItem.jsx` | **新增**动态菜单项组件（+297） |
    | `host-app/src/components/TopMenuBar/MenuItem.module.css` | 菜单项样式（+127） |
    | `host-app/src/components/TopMenuBar/TopMenuBar.jsx` | 菜单栏支持多级（+230） |
    | `host-app/src/types/menuConfig.types.js` | 菜单类型扩展以支持层级（+91） |
    | `host-app/package-lock.json` | 依赖锁更新（±5469） |

  - **说明**：新增 `DynamicMenuItem` 组件与样式，支持多级（嵌套）菜单；菜单类型与菜单栏改造以承载层级结构。

### 2026-05-18

- **修改说明**：主应用生成环境打包配置
- **修改者**：何宪锋
- **变更文件**：

  | 文件 | 改动 |
  |---|---|
  | `host-app/package.json` | 生产构建脚本 / 配置（+6 -4） |
  | `host-app/webpack.config.js` | 生产环境打包配置（+4 -4） |

- **说明**：调整主应用的生产环境打包配置（webpack 输出与 `package.json` 构建脚本）。