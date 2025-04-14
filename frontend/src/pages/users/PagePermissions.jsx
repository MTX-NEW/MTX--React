import React, { useState, useEffect } from "react";
import AccordionGroup from "@/components/users/usersettings/AccordionGroup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userTypeApi, pagePermissionsApi } from "@/api/baseApi";
import { CircularProgress } from "@mui/material";
import { routes } from "@/routesConfig";

const PagePermissions = () => {
  const [loading, setLoading] = useState(true);
  const [userTypes, setUserTypes] = useState([]);
  const [pagePermissions, setPagePermissions] = useState({});

  // Fetch user types first
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        const response = await userTypeApi.getAll();
        setUserTypes(response.data);
      } catch (error) {
        console.error("Error fetching user types:", error);
        toast.error("Failed to load user types");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTypes();
  }, []);

  // Fetch permissions for a specific page
  const fetchPagePermissions = async (pageName) => {
    try {
      const response = await pagePermissionsApi.getByPage(pageName);
      setPagePermissions(prev => ({
        ...prev,
        [pageName]: response.data || []
      }));
    } catch (error) {
      console.error(`Error fetching permissions for ${pageName}:`, error);
      setPagePermissions(prev => ({
        ...prev,
        [pageName]: []
      }));
    }
  };

  // Effect to fetch initial permissions for all pages
  useEffect(() => {
    if (!loading && routes.manageUsers.tabs) {
      routes.manageUsers.tabs.forEach(page => {
        fetchPagePermissions(page.name);
      });
    }
  }, [loading]);

  const handleSave = async (pageName, type, isView, selectedTypeIds) => {
    try {
      // Get current permissions for the page
      const currentPermissions = pagePermissions[pageName] || [];
      
      // Create a map of existing permissions
      const permissionsMap = new Map(
        currentPermissions.map(p => [p.type_id, { 
          type_id: p.type_id,
          page_name: pageName,
          can_view: Number(p.can_view),
          can_edit: Number(p.can_edit)
        }])
      );

      // Update permissions based on selection
      userTypes.forEach(userType => {
        const typeId = userType.type_id;
        const isSelected = selectedTypeIds.includes(typeId);
        const existingPermission = permissionsMap.get(typeId);
        
        if (!existingPermission) {
          // If no existing permission, create new one with default values
          permissionsMap.set(typeId, {
            type_id: typeId,
            page_name: pageName,
            can_view: isView ? (isSelected ? 1 : 0) : 0,
            can_edit: !isView ? (isSelected ? 1 : 0) : 0
          });
        } else {
          // Update only the relevant permission (view or edit)
          const updatedPermission = {
            ...existingPermission,
            [isView ? 'can_view' : 'can_edit']: isSelected ? 1 : 0
          };
          permissionsMap.set(typeId, updatedPermission);
        }
      });

      // Convert map back to array
      const updatedPermissions = Array.from(permissionsMap.values());

      await pagePermissionsApi.updatePagePermissions(pageName, updatedPermissions);
      await fetchPagePermissions(pageName);
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  // Filter and map user types
  const getTypesForPage = () => {
    return userTypes?.map(type => ({
      id: type.type_id,
      label: type.display_name,
      disabled: type.status === 'Inactive',
      status: type.status
    })) || [];
  };

  // Get permissions for a specific page and type (view/edit)
  const getPagePermissions = (pageName, isView = true) => {
    const permissions = pagePermissions[pageName] || [];
    return permissions
      .filter(p => isView ? Number(p.can_view) === 1 : Number(p.can_edit) === 1)
      .map(p => p.type_id);
  };

  return (
    <div className="container mx-auto px-2 min-h-screen">
      <div className="shadow-md rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Page Permissions</h2>
          <p className="text-sm text-gray-600">Manage access rights for each page</p>
        </div>

        <div className="space-y-2">
          {routes.manageUsers.tabs.map((page) => (
            <div key={page.name} className="border rounded-lg p-3">
              <h3 className="text-lg font-semibold mb-2">{page.name}</h3>
              
              {/* View Permissions */}
              <div className="mb-2">
                <AccordionGroup
                  title="View Access"
                  options={getTypesForPage()}
                  selectedOptions={getPagePermissions(page.name, true)}
                  onSave={(selectedOptions) => handleSave(page.name, 'view', true, selectedOptions)}
                  compactMode={true}
                />
              </div>

              {/* Edit Permissions */}
              <div>
                <AccordionGroup
                  title="Edit Access"
                  options={getTypesForPage()}
                  selectedOptions={getPagePermissions(page.name, false)}
                  onSave={(selectedOptions) => handleSave(page.name, 'edit', false, selectedOptions)}
                  compactMode={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PagePermissions; 