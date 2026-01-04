import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routeConfig';
import MainLayout from '../../widgets/layout/MainLayout';
import Loading from '../../shared/ui/Loading';

/**
 * Application router component
 * Configures all routes with lazy loading, suspense fallback, and layout wrapper.
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