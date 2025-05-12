import { createContext, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagePermissionsApi } from '@/api/baseApi';
import useAuth from '@/hooks/useAuth';
import { routes as routesConfig } from '../routesConfig';

const UserRoutesContext = createContext();

export const UserRoutesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  // At this point, auth is guaranteed to be initialized
  // Get the user's type ID from the auth context
  const userTypeId = user?.user_type?.type_id;
  console.log('UserRoutesProvider rendered with:', { 
    userTypeId,
    isAuthenticated, 
    hasUserType: !!user?.user_type,
    user: user ? JSON.stringify(user).substring(0, 50) + '...' : null
  });
  
  useEffect(() => {
    console.log('UserRoutesProvider rendered with:', { 
      userTypeId,
      isAuthenticated, 
      hasUserType: !!user?.user_type,
      user: user ? JSON.stringify(user).substring(0, 50) + '...' : null
    });
  }, [user, userTypeId, isAuthenticated]);
  
  // Use react-query to fetch and cache the routes
  const { 
    data: routes = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['userRoutes', userTypeId],
    queryFn: () => {
      // Double check authentication and userTypeId before making the API call
      if (!isAuthenticated || !userTypeId) {
        console.log('Skipping API call - not authenticated or no userTypeId');
        return Promise.resolve([]);
      }
      //console.log('Making API call with userTypeId:', userTypeId);
      return pagePermissionsApi.getUserRoutes(userTypeId)
        .then(response => response.data)
        .catch(err => {
          console.error('Error fetching user routes:', err);
          return [];
        });
    },
    // Only fetch if we have a userTypeId AND we're authenticated
    enabled: !!userTypeId && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Create a filtered version of routesConfig based on user permissions
  const filteredRoutes = createFilteredRoutes(routes);

  const value = {
    routes,
    filteredRoutes,
    loading,
    error
  };

  return (
    <UserRoutesContext.Provider value={value}>
      {children}
    </UserRoutesContext.Provider>
  );
};

export const useUserRoutes = () => {
  const context = useContext(UserRoutesContext);
  if (context === undefined) {
    throw new Error('useUserRoutes must be used within a UserRoutesProvider');
  }
  return context;
};

/**
 * Merges the user's permissions with the routes configuration
 * @param {Array} apiRoutes - Routes from the API
 * @returns {Array} - Filtered routes configuration for navigation
 */
function createFilteredRoutes(apiRoutes = []) {
  // Skip if no routes
  if (!apiRoutes.length) return [];
  
  // Create a map of allowed pages by section
  const allowedPagesBySectionMap = {};
  apiRoutes.forEach(group => {
    if (group.section === 'Driver Panel') return; // Ignore Driver Panel
    allowedPagesBySectionMap[group.section] = new Set(
      group.pages.map(page => page.page_name)
    );
  });
  
  // Filter and transform the routes config
  return Object.entries(routesConfig)
    .filter(([key, section]) => {
      // Skip Driver Panel
      if (key === 'driverPanel') return false;
      
      // Find the matching section from API
      const allowedPages = allowedPagesBySectionMap[section.label];
      if (!allowedPages) return false;
      
      // Check if the section or any of its tabs are accessible
      return allowedPages.has(section.id) || 
        (section.tabs && section.tabs.some(tab => allowedPages.has(tab.id)));
    })
    .map(([key, section]) => {
      const allowedPages = allowedPagesBySectionMap[section.label];
      
      // Find matching pages from API for additional info like can_edit
      const apiSection = apiRoutes.find(r => r.section === section.label);
      const getPageDetails = (id) => 
        apiSection?.pages.find(p => p.page_name === id) || {};
      
      // Create a copy with filtered tabs
      return {
        ...section,
        tabs: section.tabs
          ? section.tabs
              .filter(tab => allowedPages.has(tab.id))
              .map(tab => ({
                ...tab,
                can_edit: getPageDetails(tab.id).can_edit
              }))
          : []
      };
    });
} 