import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routeConfig';
import MainLayout from '../../widgets/layout/MainLayout';
import Loading from '../../shared/ui/Loading';

/**
 * Application router component
 * Configures React Router with lazy-loaded routes and layout
 * 
 * Features:
 * - BrowserRouter for HTML5 history API
 * - Suspense for lazy-loaded component transitions
 * - MainLayout wrapper for all routes
 * - Loading fallback during code splitting
 * 
 * @example
 * <AppRouter />
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Suspense fallback={<Loading message="Loading page..." />}>
          <Routes>
            {routes.map(({ path, element: Element }) => (
              <Route key={path} path={path} element={<Element />} />
            ))}
          </Routes>
        </Suspense>
      </MainLayout>
    </BrowserRouter>
  );
};

export default AppRouter;