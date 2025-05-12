import { useUserRoutes as useUserRoutesFromContext } from '@/context/UserRoutesContext';

/**
 * Hook to fetch routes/pages that the current user has permission to access
 * @returns {Object} - { routes, loading, error }
 * 
 * @deprecated Use the UserRoutesContext directly instead. This hook is kept for backward compatibility.
 */
const useUserRoutes = () => {
  return useUserRoutesFromContext();
};

export default useUserRoutes; 