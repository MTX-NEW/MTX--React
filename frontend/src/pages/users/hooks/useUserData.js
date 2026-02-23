import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { userApi, userTypeApi, groupApi, groupPermissionsApi } from '@/api/baseApi';
import { useResource } from '@/hooks/useResource';
import { useQuery } from '@tanstack/react-query';

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

  const { data: archivedUsers = [], refetch: refetchArchived } = useQuery({
    queryKey: ['users', 'archived'],
    queryFn: async () => {
      const res = await userApi.getArchived();
      return res.data || [];
    },
  });

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

  const archiveUser = async (id) => {
    await userApi.archive(id);
    refresh();
    refetchArchived();
  };

  const restoreUser = async (id) => {
    await userApi.restore(id);
    refresh();
    refetchArchived();
  };

  const deleteUserPermanently = async (id) => {
    await userApi.deletePermanent(id);
    refetchArchived();
  };

  return {
    users,
    archivedUsers,
    loading,
    createUser: create,
    updateUser: update,
    deleteUser: remove,
    archiveUser,
    restoreUser,
    deleteUserPermanently,
    refreshUsers: refresh,
    refetchArchivedUsers: refetchArchived,
    userTypes,
    userGroups,
    allowedTypes,
    fetchAllowedTypes,
    refreshUserTypes: fetchStaticData,
    initialLoad,
    setInitialLoad
  };
}; 