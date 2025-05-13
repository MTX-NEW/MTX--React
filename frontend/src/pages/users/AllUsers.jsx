import React, { useState, useEffect } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userValidationSchema } from "@/validations/inputValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import { userApi, userTypeApi, groupApi, groupPermissionsApi } from "@/api/baseApi";
//import { useResource } from "@/hooks/useResource";
import { useUserData } from '@/pages/users/hooks/useUserData';
import useUserLocation from '@/hooks/useUserLocation';
import { FaMapMarkerAlt } from "react-icons/fa";


const AllUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Get all user-related data and operations from the hook
  const {
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
    initialLoad,
    setInitialLoad
  } = useUserData();

  // Get user location functionality
  const {
    showLocationModal,
    setShowLocationModal,
    locationFormMethods,
    handleUserLocation,
    handleLocationSubmit,
    getLocationFields
  } = useUserLocation();

  // Compute filtered users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(user =>
      Object.values(user).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Handler for opening the location modal with refresh callback
  const handleOpenLocationModal = (user) => {
    handleUserLocation(user, refresh);
  };

  // Watch for group changes in add form
  const addFormMethods = useForm({
    resolver: yupResolver(userValidationSchema),
    context: { isEditing: false },
    mode: "onChange",
  });

  const editFormMethods = useForm({
    resolver: yupResolver(userValidationSchema),
    context: { isEditing: true },
    mode: "onChange",
  });

  // Watch group changes in both forms
  React.useEffect(() => {
    const addSubscription = addFormMethods.watch((value, { name }) => {
      if (name === 'user_group') {
        fetchAllowedTypes(value.user_group);
        // Reset user type when group changes
        addFormMethods.setValue('user_type', '');
      }
    });

    const editSubscription = editFormMethods.watch((value, { name }) => {
      if (name === 'user_group' && value.user_group !== itemToEdit?.user_group) {
        fetchAllowedTypes(value.user_group);
        // Only reset user type if the group has changed
        editFormMethods.setValue('user_type', '');
      }
    });

    return () => {
      addSubscription.unsubscribe();
      editSubscription.unsubscribe();
    };
  }, [addFormMethods, editFormMethods, itemToEdit]);

  // Reset edit form when itemToEdit changes
  React.useEffect(() => {
    if (itemToEdit) {
      // First fetch allowed types for the group
      fetchAllowedTypes(itemToEdit.user_group).then(() => {
        // Then set the form data after we have the allowed types
        const formData = {
          ...itemToEdit,
          user_type: itemToEdit.user_type,
          user_group: itemToEdit.user_group,
          // Add other fields that need to be explicitly set
          first_name: itemToEdit.first_name,
          last_name: itemToEdit.last_name,
          username: itemToEdit.username,
          email: itemToEdit.email,
          phone: itemToEdit.phone,
          emp_code: itemToEdit.emp_code,
          status: itemToEdit.status,
          hiringDate: itemToEdit.hiringDate,
          lastEmploymentDate: itemToEdit.lastEmploymentDate,
          sex: itemToEdit.sex,
          spanishSpeaking: itemToEdit.spanishSpeaking,
          paymentStructure: itemToEdit.paymentStructure,
          profile_image: itemToEdit.profile_image,
          // Leave password blank to avoid overwriting
          password: '', // Ensure password is blank
          confirm_password: '' // Ensure confirm password is blank
        };
        editFormMethods.reset(formData);
      });
    }
  }, [itemToEdit, editFormMethods]);

  // Get available user types based on selected group
  const getAvailableUserTypes = (selectedGroupId) => {
    if (!selectedGroupId || !allowedTypes.length) return [];
    
    return allowedTypes
      .filter(type => type.status === 'Active')
      .map(type => ({
        label: type.display_name,
        value: type.type_id
      }));
  };

  // Form fields configuration
  const getUserFields = (formMethods) => {
    const selectedGroupId = formMethods.watch('user_group');
    const isEditMode = !!itemToEdit;
    
    const fields = [
      { label: "First Name", name: "first_name", type: "text" },
      { label: "Last Name", name: "last_name", type: "text" },
      { label: "Username", name: "username", type: "text" },
      { label: "Email", name: "email", type: "email" },
      { label: "Phone", name: "phone", type: "text" },
      {
        label: "Profile Image",
        name: "profile_image",
        type: "custom",
        render: ({ field }) => (
          <div className="profile-image-input">
            {field.value && (
              <div className="image-preview mb-2">
                <img 
                  src={field.value} 
                  alt="Profile preview" 
                  className="profile-preview"
                  style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Compress and resize image before uploading
                  const compressImage = (file) => {
                    return new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          // Create canvas for resizing
                          const canvas = document.createElement('canvas');
                          // Calculate new dimensions (max 400px width/height while maintaining aspect ratio)
                          let width = img.width;
                          let height = img.height;
                          const maxSize = 400;
                          
                          if (width > height && width > maxSize) {
                            height = Math.round((height * maxSize) / width);
                            width = maxSize;
                          } else if (height > maxSize) {
                            width = Math.round((width * maxSize) / height);
                            height = maxSize;
                          }
                          
                          canvas.width = width;
                          canvas.height = height;
                          
                          // Draw resized image to canvas
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, width, height);
                          
                          // Convert to base64 with reduced quality
                          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
                          resolve(dataUrl);
                        };
                        img.src = event.target.result;
                      };
                      reader.readAsDataURL(file);
                    });
                  };
                  
                  if (file.size > 5 * 1024 * 1024) { // 5MB
                    toast.error("Image too large. Maximum size is 5MB");
                    return;
                  }
                  
                  if (file.type.match(/image.*/)) {
                    compressImage(file).then(compressedImage => {
                      field.onChange(compressedImage);
                    });
                  } else {
                    toast.error("Please select an image file");
                  }
                }
              }}
              className="form-control"
            />
            <small className="form-text text-muted">
              Upload a profile picture (max 5MB, will be compressed)
            </small>
          </div>
        )
      },
      {
        label: "User Group",
        name: "user_group",
        type: "select",
        options: userGroups
          .filter(group => group.status === 'Active')
          .map(group => ({
            label: group.common_name,
            value: group.group_id
          }))
      },
      {
        label: "User Type",
        name: "user_type",
        type: "select",
        options: getAvailableUserTypes(selectedGroupId),
        disabled: !selectedGroupId
      },
      // Password fields
      {
        label: "Password",
        name: "password",
        type: "password",
        helperText: isEditMode ? "Leave blank to keep current password" : "Password must be at least 5 characters",
        required: !isEditMode
      },
      {
        label: "Confirm Password",
        name: "confirm_password",
        type: "password",
        helperText: "Re-enter your password to confirm",
        required: !isEditMode
      },
      { label: "Hiring Date", name: "hiringDate", type: "date" },
      { label: "Last Employment Date", name: "lastEmploymentDate", type: "date" },
      {
        label: "Gender",
        name: "sex",
        type: "radio",
        options: [
          { label: "Male", value: "Male" },
          { label: "Female", value: "Female" },
        ],
      },
      {
        label: "Spanish Speaking",
        name: "spanishSpeaking",
        type: "radio",
        options: [
          { label: "Yes", value: "Yes" },
          { label: "No", value: "No" },
        ],
      },
      {
        label: "Status",
        name: "status",
        type: "radio",
        options: [
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "Inactive" },
          { label: "Suspended", value: "Suspended" },
        ],
      },
      {
        label: "Payment Structure",
        name: "paymentStructure",
        type: "radio",
        options: [
          { label: "Pay per Hour", value: "Pay per Hour" },
          { label: "Pay per Mile", value: "Pay per Mile" },
          { label: "Pay per Trip", value: "Pay per Trip" },
        ],
      },
      {
        label: "Hourly Rate ($)",
        name: "hourly_rate",
        type: "number",
        step: "0.01",
        min: "0",
        helperText: "Hourly pay rate in dollars",
        defaultValue: 15.00,
      },
    ];

    // Add emp_code field only in edit mode
    if (isEditMode) {
      fields.splice(5, 0, {
        label: "Employee Code",
        name: "emp_code",
        type: "text",
        disabled: true,
        readOnly: true,
        helperText: "Auto-generated code cannot be modified"
      });
    }

    return fields;
  };

  // Table columns
  const columns = [
    { header: "First Name", accessor: "first_name" },
    { header: "Last Name", accessor: "last_name" },
    { 
      header: "Profile",
      accessor: "profile_image",
      render: (value, row) => (
        <div className="user-profile-thumbnail">
          {value ? (
            <img 
              src={value} 
              alt={`${row.first_name}'s profile`}
              className="profile-img-small" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="profile-placeholder" 
                 style={{ 
                   width: '40px', 
                   height: '40px', 
                   borderRadius: '50%', 
                   backgroundColor: '#e0e0e0',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: '#666'
                 }}>
              {row.first_name?.charAt(0)}{row.last_name?.charAt(0)}
            </div>
          )}
        </div>
      ),
    },
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "EMP Code", accessor: "emp_code" },
    { 
      header: "User Type", 
      accessor: "UserType",
      render: (value) => value?.display_name || 'N/A'
    },
    {
      header: "Hourly Rate",
      accessor: "hourly_rate",
      render: (value) => value ? `$${parseFloat(value).toFixed(2)}` : 'N/A'
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={`status-badge ${value.toLowerCase()}`}>
          {value}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "actions",
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions 
            row={row} 
            onEdit={onEdit} 
            onDelete={onDelete}
            customActions={[
              {
                label: "Address",
                className: "home-address-btn",
                title: "Set Home Address",
                onClick: (user) => handleOpenLocationModal(user)
              }
            ]} 
          />
        ),
      ],
    },
  ];

  // CRUD operations
  const handleDelete = async (item) => {
    try {
      await remove(item.id);
      await refresh();
      toast.success(`User ${item.first_name} deleted!`);
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      // Remove the confirm_password field before sending to the API
      const { confirm_password, ...userDataToUpdate } = data;
      
      // If password is empty, don't send it to the API to avoid overwriting with empty string
      if (!userDataToUpdate.password) {
        delete userDataToUpdate.password; // Ensure password is not included if blank
      }
      
      await update(itemToEdit.id, userDataToUpdate);
      await refresh();
      toast.success(`User ${data.first_name} updated!`);
      setShowEditPopup(false);
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error updating user:", error);
    }
  };

  const handleAddUser = async (data) => {
    try {
      // Remove the confirm_password field before sending to the API
      const { confirm_password, ...userData } = data;
      
      await create(userData);
      await refresh();
      addFormMethods.reset();
      toast.success(`User ${data.first_name} added!`);
      setShowAddPopup(false);
    } catch (error) {
      toast.error("Failed to add user");
      console.error("Error adding user:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="">
      <ToastContainer position="top-right" autoClose={3000} />

      <UserActions
        onSearch={handleSearch}
        onAdd={() => setShowAddPopup(true)}
      />

      <div className="bg-white rounded-lg shadow p-6">
        {initialLoad && loading ? (
          <p>Loading users...</p>
        ) : (
          <DynamicTable
            columns={columns}
            data={filteredUsers}
            onDelete={handleDelete}
            onEdit={handleEdit}
            deleteConfirmMessage={(item) =>
              `Delete user ${item.first_name} ${item.last_name}?`
            }
          />
        )}
      </div>

      {/* Add User Popup */}
      {showAddPopup && (
        <RightSidebarPopup
          show={showAddPopup}
          title="Add User"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset();
            fetchAllowedTypes(null);
          }}
        >
          <FormProvider {...addFormMethods} isEditing={false}>
            <FormComponent
              fields={getUserFields(addFormMethods)}
              onSubmit={handleAddUser}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit User Popup */}
      {showEditPopup && itemToEdit && (
        <RightSidebarPopup
          show={showEditPopup}
          title="Edit User"
          onClose={() => {
            setShowEditPopup(false);
            fetchAllowedTypes(null);
            editFormMethods.reset();
          }}
        >
          <FormProvider {...editFormMethods} isEditing={true}>
            <FormComponent
              fields={getUserFields(editFormMethods)}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* User Location Popup */}
      {showLocationModal && (
        <RightSidebarPopup
          show={showLocationModal}
          title="User Home Address"
          onClose={() => {
            setShowLocationModal(false);
            locationFormMethods.reset();
          }}
        >
          <FormProvider {...locationFormMethods}>
            <FormComponent
              fields={getLocationFields()}
              onSubmit={handleLocationSubmit}
              submitText="Save Address"
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default AllUsers;