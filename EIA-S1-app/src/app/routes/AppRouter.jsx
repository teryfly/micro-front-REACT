import React, { useEffect } from 'react';
import { MemoryRouter, BrowserRouter, useLocation } from 'react-router-dom';

/**
 * RouteChangeNotifier — reports route changes to parent host-app.
 */
function RouteChangeNotifier({ onRouteChange }) {
  const location = useLocation();
  useEffect(() => {
    if (typeof onRouteChange === 'function') onRouteChange(location.pathname);
  }, [location.pathname]);
  return null;
}

/**
 * AppRouter — provides the router context only (no layout or routes here).
 *
 * - embedded=true  → MemoryRouter (isolated, host-app owns URL)
 * - embedded=false → BrowserRouter (standalone, real URL bar)
 *
 * Children receive full react-router-dom context (useNavigate, useLocation, etc.).
 */
function AppRouter({ embedded = true, basePath = '', onRouteChange, children }) {
  const notifier = <RouteChangeNotifier onRouteChange={onRouteChange} />;

  if (embedded) {
    return (
      <MemoryRouter initialEntries={['/templates']}>
        {notifier}
        {children}
      </MemoryRouter>
    );
  }

  return (
    <BrowserRouter basename={basePath}>
      {notifier}
      {children}
    </BrowserRouter>
  );
}

export default AppRouter;
