/**
 * 单点登录模块统一出口
 *
 * 典型用法：
 *   // 1. 应用入口
 *   <AuthProvider><AuthGuard>{app}</AuthGuard></AuthProvider>
 *
 *   // 2. 组件内取用户 / 登出
 *   const { user, logout, isAuthenticated } = useAuth();
 *
 *   // 3. 调后端接口（自动带 token，401/403 自动触发单点登录）
 *   const data = await http.get('/api/xxx');
 *
 * @module auth
 */

export { AuthProvider, useAuth, AuthStatus, AUTH_EVENTS } from './AuthContext';
export { default as AuthGuard } from './AuthGuard';
export { default as ssoService, AuthError } from './ssoService';
export { getSsoConfig, resetSsoConfigCache } from './ssoConfig';
export { http, createHttpClient, HttpError } from './httpClient';
export {
  getAccessToken,
  getIdToken,
  getTokenType,
  getAuthorizationHeader,
  getUserInfo,
  getScopes,
  getSession,
  isTokenValid,
  clearAuth,
} from './tokenStorage';
