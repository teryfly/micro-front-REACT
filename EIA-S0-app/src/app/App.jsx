/**
 * Main Application Component
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { NotificationProvider } from './providers/NotificationProvider';
import AppRoutes from './routes/AppRoutes';
import MainLayout from '../widgets/layout/MainLayout';
import '../ui/styles/global.css';

function App({ token, baseURL }) {
  return (
    <AuthProvider initialToken={token}>
      <NotificationProvider>
        <BrowserRouter>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;