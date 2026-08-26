/**
 * 单点登录（OAuth2 授权码模式 / OIDC）配置中心
 *
 * 配置优先级（从高到低）：
 *   1. window.__SSO_CONFIG__      运行时注入（部署后改 index.html 即可生效，无需重新打包）
 *   2. .env 中的 REACT_APP_SSO_*  构建期注入（由 webpack.config.js 的 DefinePlugin 提供）
 *   3. 本文件的 DEFAULTS          兜底默认值
 *
 * 认证中心约定的端点：
 *   [baseUrl]/connect/authorize   跳转登录
 *   [baseUrl]/connect/token       授权码换令牌
 *   [baseUrl]/connect/userinfo    获取用户信息
 *   [baseUrl]/connect/endsession  登出
 *
 * @module auth/ssoConfig
 */

const DEFAULTS = {
  /** 是否启用单点登录；本地无认证中心时可置为 false 走 mock 用户 */
  enabled: true,
  /** 认证中心地址（不带尾部斜杠） */
  baseUrl: 'http://192.168.120.237:31000',
  /** 注册的客户端 id */
  clientId: 'aggr-main',
  /** 注册的客户端密钥（前端持有存在泄露风险，生产建议配置 tokenProxyUrl 由后端换取令牌） */
  clientSecret: '20ecf18bff34469188368d1ab2ff1be9',
  /** 注册的权限范围，空格分隔 */
  scope: 'openid profile phone role workno identityapi oauthapi basicapi resource-pool-api schedule-api isp-scheduler-api fhirapi applicationform-api patient-portal-api logging-router-api',
  /** 注册的登录成功回跳地址；留空则取 window.location.origin */
  redirectUri: '',
  /** 登出后回跳地址；留空则取 window.location.origin */
  postLogoutRedirectUri: '',
  /** 后端令牌代理地址（可选）。配置后前端 POST {code, redirect_uri} 到该地址换取令牌，避免暴露密钥 / 规避跨域 */
  tokenProxyUrl: '',
  /** 无 token 时是否自动跳转登录（false 时展示登录按钮） */
  autoLogin: true,
  /** 登录后是否调用 /connect/userinfo 拉取用户信息 */
  fetchUserInfo: true,
  /** 授权请求是否携带 state（防 CSRF，认证中心会原样回传） */
  useState: true,
  /** authorize 请求是否附带 client_secret（文档示例中带，标准协议不需要，默认关闭） */
  secretInAuthorize: false,
  /** 登录后是否把用户 sub 同步为菜单配置的 CURRENT_USER_ID */
  syncUserId: true,
  /** 接口返回 403（无权限）时是否重新走单点登录（带一次性保护，避免死循环） */
  reloginOnForbidden: true,
  /** 令牌过期提前量（秒），提前该时间视为已过期 */
  expireBufferSeconds: 60,
  /** 登录重定向防死循环：时间窗口内最大跳转次数 */
  maxLoginAttempts: 3,
  /** 登录重定向防死循环：时间窗口（毫秒） */
  loginAttemptWindowMs: 30000,
};

/** 环境变量键名 -> 配置字段名 */
const ENV_KEY_MAP = {
  REACT_APP_SSO_ENABLED: 'enabled',
  REACT_APP_SSO_BASE_URL: 'baseUrl',
  REACT_APP_SSO_CLIENT_ID: 'clientId',
  REACT_APP_SSO_CLIENT_SECRET: 'clientSecret',
  REACT_APP_SSO_SCOPE: 'scope',
  REACT_APP_SSO_REDIRECT_URI: 'redirectUri',
  REACT_APP_SSO_POST_LOGOUT_REDIRECT_URI: 'postLogoutRedirectUri',
  REACT_APP_SSO_TOKEN_PROXY_URL: 'tokenProxyUrl',
  REACT_APP_SSO_AUTO_LOGIN: 'autoLogin',
  REACT_APP_SSO_FETCH_USERINFO: 'fetchUserInfo',
  REACT_APP_SSO_USE_STATE: 'useState',
  REACT_APP_SSO_SECRET_IN_AUTHORIZE: 'secretInAuthorize',
  REACT_APP_SSO_SYNC_USER_ID: 'syncUserId',
  REACT_APP_SSO_RELOGIN_ON_FORBIDDEN: 'reloginOnForbidden',
  REACT_APP_SSO_EXPIRE_BUFFER: 'expireBufferSeconds',
};

const BOOLEAN_FIELDS = [
  'enabled',
  'autoLogin',
  'fetchUserInfo',
  'useState',
  'secretInAuthorize',
  'syncUserId',
  'reloginOnForbidden',
];

const NUMBER_FIELDS = ['expireBufferSeconds', 'maxLoginAttempts', 'loginAttemptWindowMs'];

/**
 * 安全读取构建期注入的环境变量
 * @returns {Object}
 */
function readBuildEnv() {
  try {
    // webpack DefinePlugin 会把 process.env 替换为对象字面量
    // eslint-disable-next-line no-undef
    if (typeof process !== 'undefined' && process && process.env) {
      // eslint-disable-next-line no-undef
      return process.env;
    }
  } catch (error) {
    /* 浏览器环境下没有 process，忽略 */
  }
  return {};
}

/**
 * 读取运行时注入的配置（window.__SSO_CONFIG__）
 * @returns {Object}
 */
function readRuntimeConfig() {
  if (typeof window === 'undefined') return {};
  return window.__SSO_CONFIG__ || {};
}

function toBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function toNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function trimTrailingSlash(url) {
  return typeof url === 'string' ? url.replace(/\/+$/, '') : url;
}

let cachedConfig = null;

/**
 * 获取单点登录配置（结果会缓存，调用 resetSsoConfigCache 可重新计算）
 * @returns {Object} 配置对象（含各端点完整地址）
 */
export function getSsoConfig() {
  if (cachedConfig) return cachedConfig;

  const buildEnv = readBuildEnv();
  const runtime = readRuntimeConfig();
  const merged = { ...DEFAULTS };

  // 1. 环境变量覆盖
  Object.keys(ENV_KEY_MAP).forEach((envKey) => {
    const field = ENV_KEY_MAP[envKey];
    const value = buildEnv[envKey];
    if (value !== undefined && value !== '') {
      merged[field] = value;
    }
  });

  // 2. 运行时配置覆盖
  Object.keys(runtime).forEach((field) => {
    if (runtime[field] !== undefined && runtime[field] !== '') {
      merged[field] = runtime[field];
    }
  });

  // 3. 类型归一化
  BOOLEAN_FIELDS.forEach((field) => {
    merged[field] = toBoolean(merged[field], DEFAULTS[field]);
  });
  NUMBER_FIELDS.forEach((field) => {
    merged[field] = toNumber(merged[field], DEFAULTS[field]);
  });

  merged.baseUrl = trimTrailingSlash(merged.baseUrl);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  merged.redirectUri = merged.redirectUri || origin;
  merged.postLogoutRedirectUri = merged.postLogoutRedirectUri || origin;

  // 4. 端点
  merged.authorizeEndpoint = `${merged.baseUrl}/connect/authorize`;
  merged.tokenEndpoint = `${merged.baseUrl}/connect/token`;
  merged.userInfoEndpoint = `${merged.baseUrl}/connect/userinfo`;
  merged.endSessionEndpoint = `${merged.baseUrl}/connect/endsession`;

  cachedConfig = Object.freeze(merged);

  // 友好提示：环境变量写死的 redirect_uri 与当前访问地址不一致时，
  // 认证中心会把授权码回跳到写死的地址，导致“用 IP / 域名访问进不去”。
  if (
    typeof window !== 'undefined' &&
    buildEnv.REACT_APP_SSO_REDIRECT_URI &&
    buildEnv.REACT_APP_SSO_REDIRECT_URI !== window.location.origin
  ) {
    console.warn(
      '[SSO] 注意：REACT_APP_SSO_REDIRECT_URI 配置为',
      buildEnv.REACT_APP_SSO_REDIRECT_URI,
      '，但当前访问地址是',
      window.location.origin,
      '。若用 IP / 域名访问，请将该变量留空以自动跟随当前地址，并确保认证中心已登记该地址。'
    );
  }

  if (buildEnv.NODE_ENV !== 'production') {
    console.log('[SSO] 配置加载完成:', {
      enabled: cachedConfig.enabled,
      baseUrl: cachedConfig.baseUrl,
      clientId: cachedConfig.clientId,
      scope: cachedConfig.scope,
      redirectUri: cachedConfig.redirectUri,
      tokenProxyUrl: cachedConfig.tokenProxyUrl || '(未配置，前端直连认证中心)',
    });
  }

  return cachedConfig;
}

/**
 * 清除配置缓存（修改 window.__SSO_CONFIG__ 后调用）
 */
export function resetSsoConfigCache() {
  cachedConfig = null;
}

export default getSsoConfig;
