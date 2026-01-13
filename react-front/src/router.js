import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes';

import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import FilesPage from './pages/FilesPage/FilesPage';
import ProtectedRoute from "./components/ProtectedRoute";
import FileViewerPage from "./pages/FileViewerPage";

import { AuthContext } from './context/AuthContext';

function AppRouter() {
 const { isAuthenticated, isLoading } = useContext(AuthContext);
  
 if (isLoading) {
    // Optional: can be replaced with a spinner component
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Root route: logical entry point only */}
        <Route
          path={ROUTES.HOME}
          element={
            isAuthenticated
              ? <Navigate to={ROUTES.FILES} replace />
              : <Navigate to={ROUTES.LOGIN} replace />
          }
        />

        {/* Public auth routes */}
        <Route
          path={ROUTES.LOGIN}
          element={
            isAuthenticated
              ? <Navigate to={ROUTES.FILES} replace />
              : <LoginPage />
          }
        />

        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected main app */}
        <Route
          path={ROUTES.FILES}
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.FILES}/:id`}
          element={
            <ProtectedRoute>
              <FilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.FILES}/:id/view`}
          element={
            <ProtectedRoute>
              <FileViewerPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;