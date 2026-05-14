import React, { useEffect } from 'react';
import AppProviders from './AppProviders';
import AppRouter from './routes/AppRouter';
import AppLayout from './layouts/AppLayout';
import AppRoutes from './routes/AppRoutes';
import { getEventBus } from '../services/eventBus';

/**
 * EmbeddedApp — Module Federation entry for host-app integration.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Props (all optional — host-app passes what it has)              │
 * ├───────────────┬──────────────────────────────────────────────────┤
 * │ embedded      │ boolean  — true when mounted inside host-app     │
 * │ theme         │ object   — CSS var map  { '--color-primary':... }│
 * │ basePath      │ string   — route prefix (standalone BrowserRouter)│
 * │ onRouteChange │ function — called on every route change          │
 * │ eventBus      │ object   — { on, off, emit, once }               │
 * │ token         │ string   — JWT token                             │
 * │ userInfo      │ object   — { name, username, roles, ... }        │
 * │ apiBaseUrl    │ string   — S1 backend base URL                   │
 * │ appId         │ string   — unique app identifier                 │
 * │ appName       │ string   — display name                          │
 * └───────────────┴──────────────────────────────────────────────────┘
 *
 * Render tree:
 *   AppProviders (theme / api / notification contexts)
 *     AppRouter (MemoryRouter in embedded mode, BrowserRouter standalone)
 *       AppLayout (shell: header, sidebar — uses useNavigate/useLocation)
 *         AppRoutes (Suspense + Routes)
 */
function EmbeddedApp({
  embedded      = true,
  theme         = null,
  basePath      = '',
  onRouteChange = null,
  eventBus      = null,
  token         = null,
  userInfo      = null,
  apiBaseUrl    = null,
  appId         = 'eia-s1-app',
  appName       = '模板管理中心',
}) {
  const bus = getEventBus(eventBus);

  useEffect(() => {
    bus.emit('subapp:ready', { appId, appName, embedded });
  }, []);

  if (process.env.NODE_ENV === 'development') {
    console.log('[EIA-S1] EmbeddedApp mounted', { embedded, appId, apiBaseUrl });
  }

  return (
    <AppProviders theme={theme} eventBus={bus} apiBaseUrl={apiBaseUrl}>
      <AppRouter embedded={embedded} basePath={basePath} onRouteChange={onRouteChange}>
        <AppLayout embedded={embedded} appName={appName} userInfo={userInfo}>
          <AppRoutes />
        </AppLayout>
      </AppRouter>
    </AppProviders>
  );
}

export default EmbeddedApp;
