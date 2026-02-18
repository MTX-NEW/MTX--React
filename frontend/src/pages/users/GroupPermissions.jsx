import React, { useState, useEffect } from "react";
import AccordionGroup from "@/components/users/usersettings/AccordionGroup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useResource } from "@/hooks/useResource";
import { groupApi, userTypeApi, groupPermissionsApi } from "@/api/baseApi";
import { CircularProgress } from "@mui/material";

const GroupPermissions = () => {
  const { data: groups, loading: groupsLoading } = useResource(groupApi);
  const { data: allTypes, loading: typesLoading } = useResource(userTypeApi);
  const [groupPermissions, setGroupPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Set initial load to false once data is first loaded
 /* useEffect(() => {
    if (!groupsLoading && !typesLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [groupsLoading, typesLoading]);
*/
  // Fetch permissions for all groups
  useEffect(() => {
    const fetchAllPermissions = async () => {
      if (!groups?.length) return;
      
      try {
        const permissionsMap = {};
        await Promise.all(
          groups.map(async (group) => {
            const response = await groupPermissionsApi.getGroupPermissions(group.group_id);
            // Store the type_ids of the permissions
            permissionsMap[group.group_id] = response.data.map(type => type.type_id);
          })
        );
        setGroupPermissions(permissionsMap);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    if (groups?.length && !groupsLoading && !typesLoading) {
      fetchAllPermissions();
    }
  }, [groups, groupsLoading, typesLoading]);

  const handleSave = async (groupId, selectedTypeIds) => {
    try {
      await groupPermissionsApi.updateGroupPermissions(groupId, selectedTypeIds);
      setGroupPermissions(prev => ({
        ...prev,
        [groupId]: selectedTypeIds
      }));
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  if (initialLoad && (loading || groupsLoading || typesLoading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  // Filter and map user types
  const getTypesForGroup = () => {
    return allTypes.map(type => ({
      id: type.type_id,
      label: type.display_name,
      disabled: type.status === 'Inactive',
      status: type.status
    }));
  };

  return (
    <div className="container mx-auto px-4">
      <div className=" shadow-md rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Organisation Permissions</h2>
          <p className="text-gray-600">Manage access rights for each organisation</p>
        </div>

        <div className="space-y-4">
          {groups.map((group) => (
            <AccordionGroup
              key={group.group_id}
              title={group.full_name}
              options={getTypesForGroup()}
              selectedOptions={groupPermissions[group.group_id] || []}
              onSave={(selectedOptions) => handleSave(group.group_id, selectedOptions)}
            />
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

// Note: Component is still exported as UserSettings for now
// You'll rename the file later
export default GroupPermissions;
