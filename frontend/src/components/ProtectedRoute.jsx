import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '@/utils/authUtils';

/**
 * A component that protects routes from unauthenticated access
 * Redirects to /login if user is not authenticated
 */
const ProtectedRoute = () => {
  const isAuth = isAuthenticated();
  
  // If authenticated, render the child routes
  // Otherwise, redirect to login
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 