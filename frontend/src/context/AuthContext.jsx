import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/baseApi';
import { getStoredUser, getStoredToken, storeAuthData, clearAuthData } from '../utils/authUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state once on mount
  useEffect(() => {
    const initializeAuth = async () => {
      let initialUser = null; // Hold user state until the end
      const storedUser = getStoredUser();
      const token = getStoredToken();
      
      if (storedUser && token) {
        try {
          // Check if token is expired before using it
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const isExpired = tokenData.exp * 1000 < Date.now();
          
          if (isExpired) {
            // If token is expired, clear auth data silently
            clearAuthData();
          } else {
            // Only set auth state if token is valid
            initialUser = storedUser; // Set potential user
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error parsing token:', error);
          clearAuthData();
        }
      }
      
      // Batch state updates at the end
      setUser(initialUser); 
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      // Temporarily set loading true for the duration of the async operation
      // This loading is different from the initial auth loading
      // Consider adding a specific 'actionLoading' state if needed elsewhere
      // setLoading(true); 
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed.';
      const errors = err.response?.data?.errors || [];
      setError(errorMessage);
      throw { message: errorMessage, errors };
    } finally {
       // setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    let actionError = null; // Use local error state for the action
    try {
      // setLoading(true); // Consider separate loading state if UI needs it
      setError(null); // Clear global error
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username, password
      });
      
      const { user: loggedInUser, token } = response.data;
      
      // Update state
      setUser(loggedInUser); 
      // No need to set isAuthenticated separately
      
      // Store data
      storeAuthData(loggedInUser, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return loggedInUser;
    } catch (err) {
      const errorData = err.response?.data || {};
      actionError = errorData.message || 'Login failed'; // Set local error
      setError(actionError); // Optionally set global error too
      throw { message: actionError, originalError: errorData };
    } finally {
      // setLoading(false); // Turn off loading if set at start
    }
  }, []);

  // Centralized logout function
  const logout = useCallback(() => {
    setUser(null); // Only need to clear user
    // No need to set isAuthenticated
    clearAuthData();
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login'; // Consider using navigate hook if possible
  }, []);

  // Setup token refresh interceptor once
  /* 
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 && 
          !originalRequest._retry && 
          getStoredToken() &&
          !originalRequest.url.includes('/refresh-token')
        ) {
          originalRequest._retry = true;
          try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`);
            const newToken = response.data.accessToken;
            
            // Update stored token only
            localStorage.setItem('token', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Silent logout on refresh failure
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => axios.interceptors.response.eject(interceptor);
  }, []);
  */

  // Derive isAuthenticated directly
  const isAuthenticated = !!user;

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    loading, // Initial loading state
    error,
    login,
    logout,
    register,
    isAuthenticated // Derived state
  }), [user, loading, error, isAuthenticated, login, logout, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 