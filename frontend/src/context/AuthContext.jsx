import React, { createContext, useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/baseApi';
import { getStoredUser, getStoredToken, storeAuthData, clearAuthData } from '../utils/authUtils';

export const AuthContext = createContext();

// Create a resource that suspends until authentication is complete
const createAuthResource = () => {
  let status = 'pending';
  let result;
  let error;
  
  const promise = new Promise((resolve, reject) => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const token = getStoredToken();
       // console.log('storedUser', storedUser);
        
        if (storedUser && token) {
          try {
            // Check if token is expired before using it
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const isExpired = tokenData.exp * 1000 < Date.now();
            
            if (isExpired) {
              // If token is expired, clear auth data silently
              clearAuthData();
              resolve({ user: null, token: null });
            } else {
              // Only set auth state if token is valid
              axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              // Wait a small delay to ensure user data is fully processed
              setTimeout(() => {
                resolve({ user: storedUser, token });
              }, 50);
            }
          } catch (error) {
            console.error('Error parsing token:', error);
            clearAuthData();
            resolve({ user: null, token: null });
          }
        } else {
          resolve({ user: null, token: null });
        }
      } catch (err) {
        reject(err);
      }
    };
    
    initializeAuth();
  });
  
  promise.then(
    (res) => {
      status = 'success';
      result = res;
    },
    (err) => {
      status = 'error';
      error = err;
    }
  );
  
  return {
    read() {
      if (status === 'pending') throw promise;
      if (status === 'error') throw error;
      return result;
    }
  };
};

// Create the auth resource
const authResource = createAuthResource();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Read from the auth resource, which will suspend if not ready
  const initialAuth = authResource.read();
  
  // Once we get here, auth is initialized
  useEffect(() => {
    if (initialAuth.user) {
     // console.log('Setting auth user with typeId:', initialAuth.user.user_type?.type_id);
    }
    setUser(initialAuth.user);
  }, [initialAuth]);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed.';
      const errors = err.response?.data?.errors || [];
      setError(errorMessage);
      throw { message: errorMessage, errors };
    }
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    let actionError = null;
    try {
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username, password
      });
      
      const { user: loggedInUser, token } = response.data;
      
      // Update state
      setUser(loggedInUser);
      
      // Store data
      storeAuthData(loggedInUser, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return loggedInUser;
    } catch (err) {
      const errorData = err.response?.data || {};
      actionError = errorData.message || 'Login failed';
      setError(actionError);
      throw { message: actionError, originalError: errorData };
    }
  }, []);

  // Centralized logout function
  const logout = useCallback(() => {
    setUser(null);
    clearAuthData();
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }, []);

  // Derive isAuthenticated directly
  const isAuthenticated = !!user;

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated
  }), [user, loading, error, isAuthenticated, login, logout, register]);

  // Always render children - don't block unauthenticated users
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 