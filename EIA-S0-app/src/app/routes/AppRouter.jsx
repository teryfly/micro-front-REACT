import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { routes } from './routeConfig';
import MainLayout from '../../widgets/layout/MainLayout';
import EmbeddedLayout from '../../widgets/layout/EmbeddedLayout';
import Loading from '../../shared/ui/Loading';
import { useMode } from '../providers/ModeContext';
import { useRouteSync } from '../../shared/hooks/useRouteSync';
import { RUN_MODES } from '../../shared/utils/modeDetector';

/**
 * Application router component
 * Configures all routes with lazy loading, suspense fallback, and layout wrapper.
 * Supports both standalone and embedded modes with different layouts.
 * 
 * @param {Object} props
 * @param {string} [props.basePath=''] - Router base path for embedded mode
 * @param {Function} [props.onRouteChange] - Route change callback (embedded mode)
 */
const AppRouter = ({ basePath = '', onRouteChange }) => {
  return (
    <BrowserRouter basename={basePath}>
      <RouterContent onRouteChange={onRouteChange} />
    </BrowserRouter>
  );
};

/**
 * Router content component (inside BrowserRouter context)
 * Renders appropriate layout based on running mode
 */
const RouterContent = ({ onRouteChange }) => {
  const { mode, eventBus, embedded } = useMode();
  const isEmbedded = mode === RUN_MODES.EMBEDDED;

  // Initialize route sync (embedded mode only)
  useRouteSync(onRouteChange, eventBus, embedded);

  // Choose layout based on mode
  const LayoutComponent = isEmbedded ? EmbeddedLayout : MainLayout;

  return (
    <LayoutComponent>
      <Suspense fallback={<Loading message="Loading page..." />}>
        <Routes>
          {routes.map(({ path, element: Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
        </Routes>
      </Suspense>
    </LayoutComponent>
  );
};

export default AppRouter;