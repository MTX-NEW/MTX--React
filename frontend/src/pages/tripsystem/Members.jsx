import React from 'react';
import { FormProvider } from 'react-hook-form';
import { format, isValid } from 'date-fns';
import DynamicTable, { DefaultTableActions } from '@/components/DynamicTable';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import FormComponent from '@/components/FormComponent';
import UserActions from '@/components/users/allusers/UserActions';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaMapMarkerAlt, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import useMemberManagement from '@/hooks/useMemberManagement';

const Members = () => {
  const {
    // State
    filteredMembers,
    selectedMember,
    isLoading,
    showAddModal,
    showEditModal,
    showViewModal,
    showPickupModal,
    showDropoffModal,
    
    // Methods
    setShowAddModal,
    setShowEditModal,
    setShowViewModal,
    setShowPickupModal,
    setShowDropoffModal,
    
    // Form methods
    addFormMethods,
    editFormMethods,
    pickupFormMethods,
    dropoffFormMethods,
    
    // Event handlers
    handleSearchChange,
    handleAddMember,
    handleViewMember,
    handleEditMember,
    handlePickupLocation,
    handleDropoffLocation,
    handleDeleteMember,
    handleAddSubmit,
    handleEditSubmit,
    handlePickupSubmit,
    handleDropoffSubmit,
    
    // Form field generators
    getMemberFields,
    getLocationFields
  } = useMemberManagement();

  // Custom table actions - kept in component since it's UI related
  const MemberTableActions = ({ row, onDelete, onEdit }) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleViewMember(row)}
        className="add-user-btn secondary-btn"
        title="View Details"
      >
        <FaEye />
      </button>
      <button
        onClick={() => onEdit(row)}
        className="p-1 text-yellow-500 hover:text-yellow-700"
        title="Edit Member"
      >
        <FaEdit />
      </button>
      <button
        onClick={() => handlePickupLocation(row)}
        className="p-1 text-green-500 hover:text-green-700"
        title="Set Pickup Location"
      >
        <FaMapMarkerAlt />
      </button>
      <button
        onClick={() => handleDropoffLocation(row)}
        className="p-1 text-purple-500 hover:text-purple-700"
        title="Set Dropoff Location"
      >
        <FaMapMarkerAlt />
      </button>
      <button
        onClick={() => onDelete(row)}
        className="p-1 text-red-500 hover:text-red-700"
        title="Delete Member"
      >
        <FaTrashAlt />
      </button>
    </div>
  );

  const memberColumns = [
    {
      header: 'First Name',
      accessor: 'first_name',
      cell: (value) => value || 'N/A',
    },
    {
      header: 'Last Name',
      accessor: 'last_name',
      cell: (value) => value || 'N/A',
    },
    {
      header: 'Program',
      accessor: 'Program',
      cell: (value) => value ? value.program_name : 'N/A',
    },
    {
      header: 'Pickup',
      accessor: 'memberPickupLocation',
      cell: (value) => value ? value.street_address : 'N/A',
    },
    {
      header: 'Dropoff',
      accessor: 'memberDropoffLocation',
      cell: (value) => value ? value.street_address : 'N/A',
    },
    {
      header: 'Actions',
      accessor: 'actions',
      width: "28%",
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
            customActions={[
              {
                label: "View",
                className: "view-details-btn",
                title: "View Member Details",
                onClick: (member) => handleViewMember(member)
              },
              {
                label: "Pickup",
                className: "set-pickup-btn",
                title: "Set Pickup Location",
                onClick: (member) => handlePickupLocation(member)
              },
              {
                label: "Dropoff",
                className: "set-dropoff-btn",
                title: "Set Dropoff Location",
                onClick: (member) => handleDropoffLocation(member)
              }
            ]}
          />
        ),
      ],
    }
  ];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <UserActions
        onSearch={handleSearchChange}
        onAdd={handleAddMember}
        addButtonText="New Member"
      />

      <div className="bg-white rounded-lg shadow p-6">
        <DynamicTable
          columns={memberColumns}
          data={filteredMembers}
          isLoading={isLoading}
          onDelete={handleDeleteMember}
          onEdit={handleEditMember}
          deleteConfirmMessage={(item) => `Are you sure you want to delete this member?`}
        />
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <RightSidebarPopup
          show={showAddModal}
          title="New Member"
          onClose={() => {
            setShowAddModal(false);
            addFormMethods.reset();
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={getMemberFields(addFormMethods)}
              onSubmit={handleAddSubmit}
              submitText="Create Member"
              isSubmitting={isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
      
      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <RightSidebarPopup
          show={showEditModal}
          title="Edit Member"
          onClose={() => {
            setShowEditModal(false);
            editFormMethods.reset();
          }}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={getMemberFields(editFormMethods)}
              onSubmit={handleEditSubmit}
              submitText="Update Member"
              isSubmitting={isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
      
      {/* Pickup Location Modal */}
      {showPickupModal && selectedMember && (
        <RightSidebarPopup
          show={showPickupModal}
          title={`Set Pickup Location - ${selectedMember.first_name} ${selectedMember.last_name}`}
          onClose={() => {
            setShowPickupModal(false);
            pickupFormMethods.reset();
          }}
        >
          <p className="mb-4 font-medium text-gray-700">
            {selectedMember.Program?.program_name ? `Program: ${selectedMember.Program.program_name}` : ''}
          </p>
          <FormProvider {...pickupFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handlePickupSubmit}
              submitText="Save Pickup Location"
              isSubmitting={isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
      
      {/* Dropoff Location Modal */}
      {showDropoffModal && selectedMember && (
        <RightSidebarPopup
          show={showDropoffModal}
          title={`Set Dropoff Location - ${selectedMember.first_name} ${selectedMember.last_name}`}
          onClose={() => {
            setShowDropoffModal(false);
            dropoffFormMethods.reset();
          }}
        >
          <p className="mb-4 font-medium text-gray-700">
            {selectedMember.Program?.program_name ? `Program: ${selectedMember.Program.program_name}` : ''}
          </p>
          <FormProvider {...dropoffFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handleDropoffSubmit}
              submitText="Save Dropoff Location"
              isSubmitting={isLoading}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* View Member Modal */}
      {showViewModal && selectedMember && (
        <RightSidebarPopup
          show={showViewModal}
          title="Member Details"
          onClose={() => setShowViewModal(false)}
        >
          <div className="member-details-container">
            <p className="vehicle-info">
              {selectedMember.first_name} {selectedMember.last_name}
              {selectedMember.Program?.program_name && ` - ${selectedMember.Program.program_name}`}
            </p>
            
            <div className="details-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">AHCCCS ID:</span>
                  <span className="detail-value">{selectedMember.ahcccs_id || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Birth Date:</span>
                  <span className="detail-value">
                    {selectedMember.birth_date && isValid(new Date(selectedMember.birth_date))
                      ? format(new Date(selectedMember.birth_date), 'MM/dd/yyyy') 
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Insurance Expiry:</span>
                  <span className="detail-value">
                    {selectedMember.insurance_expiry && isValid(new Date(selectedMember.insurance_expiry))
                      ? format(new Date(selectedMember.insurance_expiry), 'MM/dd/yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedMember.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender:</span>
                  <span className="detail-value">{selectedMember.gender || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            {selectedMember.notes && (
              <div className="details-section">
                <h3 className="section-title">Notes</h3>
                <p className="detail-notes">{selectedMember.notes}</p>
              </div>
            )}
            
            {selectedMember.memberPickupLocation && (
              <div className="details-section">
                <h3 className="section-title">Pickup Location</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Street Address:</span>
                    <span className="detail-value">{selectedMember.memberPickupLocation.street_address}</span>
                  </div>
                  {selectedMember.memberPickupLocation.building && (
                    <div className="detail-item">
                      <span className="detail-label">Building/Apt:</span>
                      <span className="detail-value">{selectedMember.memberPickupLocation.building}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Building Type:</span>
                    <span className="detail-value">{selectedMember.memberPickupLocation.building_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City:</span>
                    <span className="detail-value">{selectedMember.memberPickupLocation.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">State:</span>
                    <span className="detail-value">{selectedMember.memberPickupLocation.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">ZIP:</span>
                    <span className="detail-value">{selectedMember.memberPickupLocation.zip}</span>
                  </div>
                  {selectedMember.memberPickupLocation.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedMember.memberPickupLocation.phone}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Latitude:</span>
                    <span className="detail-value">
                      {selectedMember.memberPickupLocation.latitude !== null && 
                       selectedMember.memberPickupLocation.latitude !== undefined ? 
                        String(selectedMember.memberPickupLocation.latitude) : 'Not available'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Longitude:</span>
                    <span className="detail-value">
                      {selectedMember.memberPickupLocation.longitude !== null && 
                       selectedMember.memberPickupLocation.longitude !== undefined ? 
                        String(selectedMember.memberPickupLocation.longitude) : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {selectedMember.memberDropoffLocation && (
              <div className="details-section">
                <h3 className="section-title">Dropoff Location</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Street Address:</span>
                    <span className="detail-value">{selectedMember.memberDropoffLocation.street_address}</span>
                  </div>
                  {selectedMember.memberDropoffLocation.building && (
                    <div className="detail-item">
                      <span className="detail-label">Building/Apt:</span>
                      <span className="detail-value">{selectedMember.memberDropoffLocation.building}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Building Type:</span>
                    <span className="detail-value">{selectedMember.memberDropoffLocation.building_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">City:</span>
                    <span className="detail-value">{selectedMember.memberDropoffLocation.city}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">State:</span>
                    <span className="detail-value">{selectedMember.memberDropoffLocation.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">ZIP:</span>
                    <span className="detail-value">{selectedMember.memberDropoffLocation.zip}</span>
                  </div>
                  {selectedMember.memberDropoffLocation.phone && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{selectedMember.memberDropoffLocation.phone}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Latitude:</span>
                    <span className="detail-value">
                      {selectedMember.memberDropoffLocation.latitude !== null && 
                       selectedMember.memberDropoffLocation.latitude !== undefined ? 
                        String(selectedMember.memberDropoffLocation.latitude) : 'Not available'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Longitude:</span>
                    <span className="detail-value">
                      {selectedMember.memberDropoffLocation.longitude !== null && 
                       selectedMember.memberDropoffLocation.longitude !== undefined ? 
                        String(selectedMember.memberDropoffLocation.longitude) : 'Not available'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                className="add-user-btn secondary-btn p-2" 
                onClick={() => {
                  setShowViewModal(false);
                  handleEditMember(selectedMember);
                }}
              >
                Edit Member
              </button>
              <button
                type="button"
                className="m-2 add-user-btn secondary-btn p-2"
                onClick={() => {
                  setShowViewModal(false);
                  handlePickupLocation(selectedMember);
                }}
              >
                {selectedMember.memberPickupLocation ? 'Update Pickup' : 'Set Pickup'}
              </button>
              <button
                type="button"
                className=" mt-2 add-user-btn secondary-btn p-2"
                onClick={() => {
                  setShowViewModal(false);
                  handleDropoffLocation(selectedMember);
                }}
              >
                {selectedMember.memberDropoffLocation ? 'Update Dropoff' : 'Set Dropoff'}
              </button>
            </div>
          </div>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default Members; 