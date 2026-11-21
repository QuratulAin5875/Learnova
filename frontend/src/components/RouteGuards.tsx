import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Protects all authenticated learner routes.
 * If the user is not signed in, redirects to /login?expired=1 so the Login screen
 * shows the Figma "Your session has expired. Please log in again." banner.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login?expired=1" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

/**
 * Protects all /admin/* routes (FR21-04, FR22-03, NFR05).
 * Non-authenticated users go to /login; authenticated learners with role !== 'admin'
 * are blocked and routed to /403 ("You don't have permission to view this page").
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login?expired=1" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
