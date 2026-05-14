import React, { Suspense } from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routeConfig';
import MainLayout from '../../widgets/layout/MainLayout';
import EmbeddedLayout from '../../widgets/layout/EmbeddedLayout';
import Loading from '../../shared/ui/Loading';
import { useMode } from '../providers/ModeContext';

/**
 * Application router component
 *
 * Standalone mode : BrowserRouter + MainLayout (full header + sidebar)
 * Embedded mode   : MemoryRouter  + EmbeddedLayout (no header, isolated routing)
 *
 * MemoryRouter isolates the sub-app's internal navigation from host-app's router,
 * preventing URL conflicts and history interference.
 */
const AppRouter = () => {
  const { isEmbedded } = useMode();

  const Router   = isEmbedded ? MemoryRouter : BrowserRouter;
  const Layout   = isEmbedded ? EmbeddedLayout : MainLayout;

  return (
    <Router>
      <Layout>
        <Suspense fallback={<Loading message="Loading page..." />}>
          <Routes>
            {routes.map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default AppRouter;
