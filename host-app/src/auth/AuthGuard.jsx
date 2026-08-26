/**
 * 鉴权守卫
 * 登录完成前拦截整个应用渲染，按状态展示：加载 / 跳转中 / 登录失败 / 无权限 / 未登录
 *
 * @module auth/AuthGuard
 */

import React from 'react';
import { useAuth, AuthStatus } from './AuthContext';
import styles from './AuthGuard.module.css';

function Screen({ icon, title, description, children }) {
  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.icon}>{icon}</div>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
        {children ? <div className={styles.actions}>{children}</div> : null}
      </div>
    </div>
  );
}

export default function AuthGuard({ children }) {
  const { status, error, login, logout, config } = useAuth();

  if (status === AuthStatus.AUTHENTICATED) {
    return children;
  }

  if (status === AuthStatus.INITIALIZING) {
    return (
      <Screen icon={<span className={styles.spinner} />} title="正在校验登录状态..." />
    );
  }

  if (status === AuthStatus.AUTHENTICATING) {
    return (
      <Screen
        icon={<span className={styles.spinner} />}
        title="正在完成单点登录..."
        description="正在使用授权码换取访问令牌，请稍候"
      />
    );
  }

  if (status === AuthStatus.REDIRECTING) {
    return (
      <Screen
        icon={<span className={styles.spinner} />}
        title="正在跳转统一认证中心..."
        description={config.authorizeEndpoint}
      />
    );
  }

  if (status === AuthStatus.FORBIDDEN) {
    return (
      <Screen
        icon="🚫"
        title="无访问权限"
        description={error?.message || '当前账号没有访问该系统的权限，请联系管理员分配权限后重试。'}
      >
        <button className={styles.primaryBtn} onClick={() => login({ reason: '用户手动重新登录' })}>
          换个账号登录
        </button>
        <button className={styles.ghostBtn} onClick={() => logout()}>
          退出登录
        </button>
      </Screen>
    );
  }

  if (status === AuthStatus.ERROR) {
    return (
      <Screen
        icon="⚠️"
        title="登录失败"
        description={error?.message || '单点登录过程中发生未知错误'}
      >
        <button className={styles.primaryBtn} onClick={() => login({ reason: '用户手动重试' })}>
          重新登录
        </button>
        <button className={styles.ghostBtn} onClick={() => window.location.replace('/')}>
          返回首页
        </button>
      </Screen>
    );
  }

  // UNAUTHENTICATED：关闭自动跳转时展示登录入口
  return (
    <Screen icon="🔐" title="需要登录" description="请通过统一身份认证中心登录后继续使用">
      <button className={styles.primaryBtn} onClick={() => login({ reason: '用户手动登录' })}>
        立即登录
      </button>
    </Screen>
  );
}
