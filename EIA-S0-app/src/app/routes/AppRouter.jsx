import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routeConfig';
import MainLayout from '../../widgets/layout/MainLayout';
import EmbeddedLayout from '../../widgets/layout/EmbeddedLayout';
import Loading from '../../shared/ui/Loading';
import { useMode } from '../providers/ModeContext';

/**
 * Application router component
 *
 * - Standalone mode: full MainLayout (Header + Sidebar) + BrowserRouter at '/'
 * - Embedded mode:   EmbeddedLayout (Sidebar only) + BrowserRouter with basename
 *   so internal navigation stays within the host's /app/:appId/* wildcard route.
 *
 * @param {string}   [basePath='']    Route prefix injected by host app (e.g. '/app/eia-s0-app')
 * @param {function} [onRouteChange]  Host-app route-sync callback
 */
const AppRouter = ({ basePath = '', onRouteChange }) => {
  const { isEmbedded } = useMode();
  const Layout = isEmbedded ? EmbeddedLayout : MainLayout;

  return (
    <BrowserRouter basename={isEmbedded ? (basePath || '/') : '/'}>
      <Layout>
        <Suspense fallback={<Loading message="Loading page..." />}>
          <Routes>
            {routes.map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;