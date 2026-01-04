/**
 * Application Routes
 */

import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loading } from '../../ui/components';

const DocTypeManager = lazy(() => import('../../features/doctype/DocTypeManager'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading message="Loading page..." />}>
      <Routes>
        <Route path="/" element={<DocTypeManager />} />
        <Route path="/doctype" element={<DocTypeManager />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;