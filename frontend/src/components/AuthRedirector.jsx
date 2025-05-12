import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const AuthRedirector = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect until auth state is initialized
    if (authLoading) {
      return;
    }

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // If authenticated and on an auth page, redirect to home
    if (isAuthenticated && isAuthPage) {
      navigate('/', { replace: true });
    } 
    // If not authenticated and not on an auth page, redirect to login
    else if (!isAuthenticated && !isAuthPage) {
      navigate('/login', { replace: true });
    }
    
    // Otherwise, stay on the current page (covers authenticated on non-auth page, 
    // and unauthenticated on auth page)

  }, [isAuthenticated, authLoading, location.pathname, navigate]);

  // Render children only after initial auth check potentially redirects
  // Or, always render children and let the effect handle the redirect asynchronously
  // Always rendering children is usually smoother UX unless authLoading is lengthy.
  // Given the constraint about no loading states, we'll always render children.
  return children; 
};

export default AuthRedirector; 