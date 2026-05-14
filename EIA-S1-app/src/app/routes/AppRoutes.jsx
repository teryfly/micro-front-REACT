import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { routes } from './routeConfig';

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8c8c8c', fontSize: 14 }}>
      加载中…
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/templates" replace />} />

        {routes
          .filter((r) => !r.redirect)
          .map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}

        <Route path="*" element={<Navigate to="/templates" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
