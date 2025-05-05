import React from 'react';
import { FormProvider } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

import DynamicTable, { DefaultTableActions } from '@/components/DynamicTable';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import FormComponent from '@/components/FormComponent';
import UserActions from '@/components/users/allusers/UserActions';
import useLocationManagement from '@/hooks/useLocationManagement';

const Locations = () => {
  const {
    // State
    filteredLocations,
    selectedLocation,
    isLoading,
    showAddModal,
    showEditModal,
    
    // Methods
    setShowAddModal,
    setShowEditModal,
    
    // Form methods
    addFormMethods,
    editFormMethods,
    
    // Event handlers
    handleSearchChange,
    handleAddLocation,
    handleEditLocation,
    handleDeleteLocation,
    handleAddSubmit,
    handleEditSubmit,
    
    // Form fields generator
    getLocationFields
  } = useLocationManagement();

  // Table columns for locations
  const locationColumns = [
    {
      header: 'Address',
      accessor: 'street_address',
      cell: (value, row) => {
        const building = row.building ? `, ${row.building}` : '';
        return `${value}${building}`;
      }
    },
    {
      header: 'City',
      accessor: 'city'
    },
    {
      header: 'State',
      accessor: 'state'
    },
    {
      header: 'ZIP',
      accessor: 'zip'
    },
    {
      header: 'Building Type',
      accessor: 'building_type',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Location Type',
      accessor: 'location_type',
      cell: (value) => value || 'N/A'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
            customActions={[
              {
                label: <FaMapMarkerAlt />,
                className: "view-location-btn",
                title: "View on Map",
                onClick: (location) => {
                  if (location.latitude && location.longitude) {
                    window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank');
                  } else {
                    toast.info('Location coordinates not available');
                  }
                }
              }
            ]}
          />
        )
      ]
    }
  ];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <UserActions
        onSearch={handleSearchChange}
        onAdd={handleAddLocation}
        addButtonText="New Location"
      />

      <div className="bg-white rounded-lg shadow p-6">
        <DynamicTable
          columns={locationColumns}
          data={filteredLocations}
          isLoading={isLoading}
          onDelete={handleDeleteLocation}
          onEdit={handleEditLocation}
          deleteConfirmMessage={(item) => `Are you sure you want to delete this location?`}
        />
      </div>

      {/* Add Location Modal */}
      {showAddModal && (
        <RightSidebarPopup
          show={showAddModal}
          title="Add Location"
          onClose={() => {
            setShowAddModal(false);
            addFormMethods.reset();
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handleAddSubmit}
              submitText="Add Location"
              isSubmitting={isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit Location Modal */}
      {showEditModal && selectedLocation && (
        <RightSidebarPopup
          show={showEditModal}
          title="Edit Location"
          onClose={() => {
            setShowEditModal(false);
            editFormMethods.reset();
          }}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handleEditSubmit}
              submitText="Update Location"
              isSubmitting={isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default Locations; 