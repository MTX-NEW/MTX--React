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
import { userApi, userTypeApi, groupApi, groupPermissionsApi } from "@/api/baseApi";
import { useResource } from "@/hooks/useResource";
import { useUserData } from '@/pages/users/hooks/useUserData';


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

  // Compute filtered users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(user =>
      Object.values(user).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Watch for group changes in add form
  const addFormMethods = useForm({
    resolver: yupResolver(userValidationSchema),
    mode: "onChange",
  });

  const editFormMethods = useForm({
    resolver: yupResolver(userValidationSchema),
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
          paymentStructure: itemToEdit.paymentStructure
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
    { header: "Username", accessor: "username" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "EMP Code", accessor: "emp_code" },
    { 
      header: "User Group", 
      accessor: "UserGroup",
      render: (value) => value?.common_name || 'N/A'
    },
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
          <DefaultTableActions row={row} onEdit={onEdit} onDelete={onDelete} />
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
      await update(itemToEdit.id, data);
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
      await create(data);
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
          <FormProvider {...addFormMethods}>
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
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={getUserFields(editFormMethods)}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default AllUsers;