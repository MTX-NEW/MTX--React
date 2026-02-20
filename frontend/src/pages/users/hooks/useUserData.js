import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userApi, userTypeApi, groupApi, groupPermissionsApi } from '@/api/baseApi';
import { useResource } from '@/hooks/useResource';

export const useUserData = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [allowedTypes, setAllowedTypes] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const { 
    data: users, 
    loading, 
    create, 
    update, 
    remove,
    refresh 
  } = useResource(userApi);

  const fetchStaticData = async () => {
    try {
      const [typesResponse, groupsResponse] = await Promise.all([
        userTypeApi.getAll(),
        groupApi.getAll()
      ]);
      setUserTypes(typesResponse.data);
      setUserGroups(groupsResponse.data);
    } catch (error) {
      toast.error("Failed to fetch user types or organisations");
    }
  };

  useEffect(() => {
    fetchStaticData();
    
    // Listen for custom event when user types are updated
    const handleUserTypesUpdate = () => {
      fetchStaticData();
    };
    
    window.addEventListener('userTypesUpdated', handleUserTypesUpdate);
    
    return () => {
      window.removeEventListener('userTypesUpdated', handleUserTypesUpdate);
    };
  }, []);

  const fetchAllowedTypes = async (groupId) => {
    if (!groupId) {
      setAllowedTypes([]);
      return [];
    }
    try {
      const response = await groupPermissionsApi.getGroupPermissions(groupId);
      setAllowedTypes(response.data);
      return response.data.map(type => ({
        label: type.display_name,
        value: type.type_id
      }));
    } catch (error) {
      console.error("Error fetching allowed types:", error);
      toast.error("Failed to fetch allowed types for organisation");
      return [];
    }
  };

  return {
    users,
    loading,
    createUser: create,
    updateUser: update,
    deleteUser: remove,
    refreshUsers: refresh,
    userTypes,
    userGroups,
    allowedTypes,
    fetchAllowedTypes,
    refreshUserTypes: fetchStaticData,
    initialLoad,
    setInitialLoad
  };
}; 