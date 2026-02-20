import React, { useState, useEffect, useMemo, useCallback } from "react";
import PagesAccordionGroup from "@/components/users/usersettings/PagesAccordionGroup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userTypeApi, pagePermissionsApi } from "@/api/baseApi";
import { CircularProgress, Button } from "@mui/material";
import SyncIcon from '@mui/icons-material/Sync';

const PagePermissions = () => {
  const [loading, setLoading] = useState(true);
  const [syncingPages, setSyncingPages] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedSection, setSelectedSection] = useState('all');

  // Get all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Use Promise.all to fetch data in parallel
      const [userTypesResponse, permissionsResponse] = await Promise.all([
        userTypeApi.getAll(),
        pagePermissionsApi.getAllPermissions()
      ]);
      
      setUserTypes(userTypesResponse.data);
      setPermissions(permissionsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Memoize the processed data to avoid recalculation on each render
  const { pageMap, uniquePages, sections } = useMemo(() => {
    // Create a map of page_id -> permissions
    const pageMap = {};
    // Track unique pages and sections
    const pagesSet = new Set();
    const uniquePagesArray = [];
    const sectionsSet = new Set();
    
    permissions.forEach(perm => {
      // Build page map
      if (!pageMap[perm.page_id]) {
        pageMap[perm.page_id] = [];
      }
      pageMap[perm.page_id].push(perm);
      
      // Track page if new
      const pageId = perm.Page.page_id;
      if (!pagesSet.has(pageId)) {
        pagesSet.add(pageId);
        uniquePagesArray.push(perm.Page);
        sectionsSet.add(perm.Page.page_section);
      }
    });
    
    return {
      pageMap,
      uniquePages: uniquePagesArray,
      sections: ['all', ...Array.from(sectionsSet)]
    };
  }, [permissions]);

  // Memoize filtered pages based on selected section
  const filteredPages = useMemo(() => {
    return selectedSection === 'all' 
      ? uniquePages 
      : uniquePages.filter(page => page.page_section === selectedSection);
  }, [selectedSection, uniquePages]);

  // Memoize formatted user types for component props
  const formattedUserTypes = useMemo(() => {
    return userTypes?.map(type => ({
      id: type.type_id,
      label: type.display_name,
      disabled: type.status === 'Inactive',
      status: type.status
    })) || [];
  }, [userTypes]);

  // Sync pages from routes to database
  const handleSyncPages = async () => {
    try {
      setSyncingPages(true);
      const response = await pagePermissionsApi.syncPages();
      
      // Show success message with details
      const { created, existing } = response.data;
      toast.success(`Pages synced successfully! Created: ${created}, Already existing: ${existing}`);
      
      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error("Error syncing pages:", error);
      toast.error("Failed to sync pages");
    } finally {
      setSyncingPages(false);
    }
  };

  // Memoize the save handler to prevent unnecessary function recreation
  const handleSavePermissions = useCallback(async (pageId, updatedPermissions) => {
    try {
      // If no changes, don't bother updating
      if (updatedPermissions.length === 0) {
        toast.info("No changes to save");
        return;
      }
      
      // Use page ID directly instead of page name for the API call
      console.log(pageId, updatedPermissions);
      await pagePermissionsApi.updatePagePermissions(pageId, updatedPermissions);
      
      // Refresh permissions only, not full data
      const permissionsResponse = await pagePermissionsApi.getAllPermissions();
      setPermissions(permissionsResponse.data);
      
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permissions");
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 min-h-screen">
      <div className="shadow-md rounded-lg p-4">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h2 className="text-xl font-bold text-gray-800 mb-0">Page Permissions</h2>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SyncIcon />}
              onClick={handleSyncPages}
              disabled={syncingPages}
            >
              {syncingPages ? 'Syncing...' : 'Sync Pages'}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1 mb-0">Manage access rights for each page</p>
        </div>

        {/* Section filter dropdown */}
        <div className="mb-4">
          <label htmlFor="section-filter" className="block text-sm font-medium text-gray-700">Filter by section:</label>
          <select 
            id="section-filter"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="form-select w-25 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {sections.map(section => (
              <option key={section} value={section}>
                {section === 'all' ? 'All Sections' : section}
              </option>
            ))}
          </select>
        </div>

        <div className="row row-cols-2 g-4">
          {filteredPages.map((page) => (
            <div key={page.page_id} className="border rounded-lg p-3">
              <h3 className="fs-5 fw-semibold mb-2">
                {page.page_section} &gt; {page.page_name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              <p className="text-xs text-secondary mb-2">ID: {page.page_id}</p>
              <p className="text-xs text-secondary mb-2">Path: {page.page_path}</p>
              
              {/* Combined View/Edit Permissions in one table */}
              <PagesAccordionGroup
                title="User Permissions"
                options={formattedUserTypes}
                permissions={pageMap[page.page_id] || []}
                onSave={(updatedPermissions) => handleSavePermissions(page.page_id, updatedPermissions)}
              />
            </div>
          ))}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default PagePermissions; 