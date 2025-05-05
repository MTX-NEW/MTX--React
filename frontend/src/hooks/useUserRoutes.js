import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagePermissionsApi } from '@/api/baseApi';
import useAuth from './useAuth';
import { routes as routesConfig } from '../routesConfig';

/**
 * Hook to fetch routes/pages that the current user has permission to access
 * @returns {Object} - { routes, loading, error }
 */
const useUserRoutes = () => {
  const { user } = useAuth();
 // console.log("User", user);
  
  // Get the user's type ID from the auth context
  const userTypeId = user?.user_type?.type_id;
  
  // Use react-query to fetch and cache the routes
  const { 
    data: routes = [], 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['userRoutes', userTypeId],
    queryFn: () => pagePermissionsApi.getUserRoutes(userTypeId)
      .then(response => response.data),
    // Don't try to fetch if we don't have a typeId
    enabled: !!userTypeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
  console.log("Routes", routes);
  // Transform the routes data for use in sidebar and layouts

  // Create a filtered version of routesConfig based on user permissions
  const filteredRoutes = createFilteredRoutes(routes);

  return {
    routes,
    filteredRoutes,
    loading,
    error
  };
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

/**
 * Helper to map section names to icon names
 */
const getIconForSection = (section) => {
  const iconMap = {
    'Trip system': 'faBus',
    'Time sheet': 'faClock',
    'Manage users': 'faUsers',
    'Manage Vehicles': 'faCar',
    'Manage emails': 'faEnvelope',
    'HR': 'faUserTie',
    'Forms': 'faFileAlt',
    'Claims': 'faClipboard',
    'Import data': 'faUpload'
  };

  return iconMap[section] || 'faCircle'; // Default icon
};

/**
 * Helper to format page name for display
 */
const formatPageName = (pageName) => {
  return pageName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default useUserRoutes; 