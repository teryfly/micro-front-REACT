/**
 * 带鉴权的 HTTP 客户端
 * - 自动附加 Authorization: {token_type} {access_token}
 * - 请求前校验令牌有效性，过期直接触发重新登录
 * - 401 -> 触发重新单点登录；403 -> 触发无权限处理（按配置可重新登录）
 *
 * 用法：
 *   import { http } from '../auth';
 *   const data = await http.get('/api/xxx');
 *   const api  = http.create({ baseUrl: 'http://192.168.120.237:5090' });
 *
 * @module auth/httpClient
 */

import { getSsoConfig } from './ssoConfig';
import { getAuthorizationHeader, isTokenValid } from './tokenStorage';
import { AUTH_EVENTS, emitAuthEvent } from './authEvents';

/**
 * HTTP 错误
 */
export class HttpError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

const emit = emitAuthEvent;

function joinUrl(baseUrl, url) {
  if (!baseUrl || /^https?:\/\//i.test(url)) return url;
  return `${baseUrl.replace(/\/+$/, '')}/${String(url).replace(/^\/+/, '')}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204) return null;

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }
  return response.text();
}

/**
 * 创建 HTTP 客户端
 * @param {Object} [options]
 * @param {string} [options.baseUrl] 接口前缀
 * @param {boolean} [options.withAuth=true] 是否附加鉴权头
 * @returns {Object}
 */
export function createHttpClient(options = {}) {
  const { baseUrl = '', withAuth = true } = options;

  /**
   * 发起请求
   * @param {string} url
   * @param {Object} [config] fetch 配置，额外支持 { params, data, raw }
   * @returns {Promise<any>}
   */
  async function request(url, config = {}) {
    const { params, data, raw = false, headers = {}, ...rest } = config;
    const ssoConfig = getSsoConfig();

    let fullUrl = joinUrl(baseUrl, url);
    if (params && typeof params === 'object') {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) search.append(key, value);
      });
      const query = search.toString();
      if (query) fullUrl += (fullUrl.includes('?') ? '&' : '?') + query;
    }

    const finalHeaders = { Accept: 'application/json', ...headers };

    if (withAuth && ssoConfig.enabled) {
      // 令牌已过期：直接触发重新登录，避免无谓的失败请求
      if (!isTokenValid()) {
        emit(AUTH_EVENTS.UNAUTHORIZED, `请求 ${url} 前检测到令牌已过期`);
        throw new HttpError('登录状态已失效，正在重新登录', 401);
      }
      const authorization = getAuthorizationHeader();
      if (authorization) finalHeaders.Authorization = authorization;
    }

    let body = rest.body;
    if (data !== undefined && body === undefined) {
      if (data instanceof FormData || typeof data === 'string') {
        body = data;
      } else {
        body = JSON.stringify(data);
        if (!finalHeaders['Content-Type']) finalHeaders['Content-Type'] = 'application/json';
      }
    }

    const response = await fetch(fullUrl, { ...rest, headers: finalHeaders, body });

    if (response.status === 401) {
      emit(AUTH_EVENTS.UNAUTHORIZED, `接口 ${url} 返回 401`);
      throw new HttpError('登录状态已失效，正在重新登录', 401);
    }

    if (response.status === 403) {
      emit(AUTH_EVENTS.FORBIDDEN, `接口 ${url} 返回 403（无权限）`);
      throw new HttpError('没有访问权限', 403);
    }

    if (raw) return response;

    const payload = await parseResponse(response);

    if (!response.ok) {
      const message =
        (payload && (payload.message || payload.error_description || payload.error)) ||
        `请求失败：HTTP ${response.status}`;
      throw new HttpError(message, response.status, payload);
    }

    return payload;
  }

  return {
    request,
    get: (url, config) => request(url, { ...config, method: 'GET' }),
    post: (url, data, config) => request(url, { ...config, method: 'POST', data }),
    put: (url, data, config) => request(url, { ...config, method: 'PUT', data }),
    patch: (url, data, config) => request(url, { ...config, method: 'PATCH', data }),
    del: (url, config) => request(url, { ...config, method: 'DELETE' }),
    create: createHttpClient,
  };
}

/** 默认客户端 */
export const http = createHttpClient();

export default http;
