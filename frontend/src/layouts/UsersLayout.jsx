import { useEffect, useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import useUserRoutes from "@/hooks/useUserRoutes";
import GroupedHeader from "@/components/GroupedHeader";
import { groupApi } from "@/api/baseApi";
import { useResource } from "@/hooks/useResource";

const UsersLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredRoutes, loading } = useUserRoutes();
  const [selectedOrganisationId, setSelectedOrganisationId] = useState("");
  const {
    data: organisations = [],
    loading: organisationsLoading,
    create: createOrganisation,
    update: updateOrganisation,
    remove: removeOrganisation
  } = useResource(groupApi, { idField: "group_id" });

  // Find manageUsers section in filteredRoutes
  const manageUsersSection = filteredRoutes.find(route => route.id === 'manage-users');
  const tabs = manageUsersSection?.tabs || [];
  const visibleTabs = useMemo(() => tabs.filter(tab => !tab.hidden), [tabs]);
  const sortedOrganisations = useMemo(() => (
    [...organisations].sort((left, right) => {
      const leftName = left.full_name || left.common_name || "";
      const rightName = right.full_name || right.common_name || "";
      return leftName.localeCompare(rightName);
    })
  ), [organisations]);

  useEffect(() => {
    if (sortedOrganisations.length === 0) {
      setSelectedOrganisationId("");
      return;
    }

    const hasSelectedOrganisation = sortedOrganisations.some(
      (organisation) => String(organisation.group_id) === String(selectedOrganisationId)
    );

    if (!selectedOrganisationId || !hasSelectedOrganisation) {
      setSelectedOrganisationId(String(sortedOrganisations[0].group_id));
    }
  }, [selectedOrganisationId, sortedOrganisations]);

  // Group tabs by their group property
  const tabGroups = useMemo(() => {
    const groupOrder = ["MTX", "Organisations", "Permissions", "Config"];
    const groups = {};
    
    visibleTabs.forEach(tab => {
      const groupName = tab.group || "Other";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(tab.displayName || tab.name);
    });

    // Return groups in the specified order, only including groups that have tabs
    return groupOrder
      .filter(groupName => groups[groupName]?.length > 0)
      .map(groupName => ({
        label: groupName,
        tabs: groups[groupName],
        ...(groupName === "Organisations" ? {
          items: sortedOrganisations.map((organisation) => ({
            label: organisation.full_name || organisation.common_name,
            value: organisation.group_id
          })),
          activeItemValue: selectedOrganisationId,
          onItemSelect: (item) => {
            setSelectedOrganisationId(String(item.value));
            navigate("/manage-users/user-groups");
          }
        } : {})
      }));
  }, [navigate, selectedOrganisationId, sortedOrganisations, visibleTabs]);

  // Determine active tab directly from location
  const currentActiveTab = (visibleTabs.find((tab) => location.pathname.startsWith(tab.path))?.displayName || visibleTabs.find((tab) => location.pathname.startsWith(tab.path))?.name) || (visibleTabs[0]?.displayName || visibleTabs[0]?.name);

  // Simplified useEffect - Redirect if base path hit or no match
  useEffect(() => {
    if (loading || visibleTabs.length === 0) return;

    const pathMatchesTab = visibleTabs.some((tab) => location.pathname.startsWith(tab.path));
    if ((!pathMatchesTab && location.pathname.startsWith('/manage-users')) || location.pathname === '/manage-users' || location.pathname === '/manage-users/') {
      if (visibleTabs.length > 0) {
        navigate(visibleTabs[0].path, { replace: true });
      }
    }
  }, [location.pathname, navigate, visibleTabs, loading]);

  // Handle tab switching
  const handleTabChange = useCallback((tabName) => {
    const selectedTab = visibleTabs.find((tab) => (tab.displayName || tab.name) === tabName);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  }, [navigate, visibleTabs]);

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        {loading ? (
          <div className="p-3">Loading...</div>
        ) : (
          <GroupedHeader
            tabGroups={tabGroups}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
          />
        )}
        <div className="users-container flex-grow-1 overflow-auto" style={{ 
          height: 'calc(100vh - 89px)'
        }}>
          <div className="content">
            <Outlet context={{
              organisations: sortedOrganisations,
              organisationsLoading,
              createOrganisation,
              updateOrganisation,
              removeOrganisation,
              selectedOrganisationId,
              setSelectedOrganisationId
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersLayout;
