import React, { useState, useEffect } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userTypeValidationSchema } from "@/validations/inputValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userTypeApi } from "@/api/baseApi";
import { formatDate } from "@/utils/dateUtils";
import { useResource } from "@/hooks/useResource";

const UserTypes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const { 
    data: userTypes, 
    loading: isLoading, 
    create, 
    update, 
    remove,
    refresh 
  } = useResource(userTypeApi);

  // Set initial load to false once data is first loaded
/*  useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading]);
*/
  // Compute filtered types based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return userTypes;
    return userTypes.filter(type =>
      Object.values(type).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userTypes, searchQuery]);

  // Form handlers
  const addFormMethods = useForm({
    resolver: yupResolver(userTypeValidationSchema),
    mode: "onChange",
  });
  const editFormMethods = useForm({
    resolver: yupResolver(userTypeValidationSchema),
    mode: "onChange",
  });

  // Reset edit form when itemToEdit changes
  useEffect(() => {
    if (itemToEdit) {
      editFormMethods.reset(itemToEdit);
    }
  }, [itemToEdit, editFormMethods]);

  // Table columns
  const columns = [
    { header: "ID", accessor: "type_id" },
    { header: "Name", accessor: "type_name" },
    { header: "Display Name", accessor: "display_name" },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={`status-badge ${value.toLowerCase()}`}>{value}</span>
      ),
    },
    {
      header: "Created At",
      accessor: "created_at",
      render: (value) => formatDate(value),
    },
    {
      header: "Updated At",
      accessor: "updated_at",
      render: (value) => formatDate(value),
    },
    {
      header: "Actions",
      accessor: "actions",
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions row={row} onEdit={onEdit} onDelete={onDelete} />
        ),
      ],
    },
  ];

  // Form fields configuration
  const userTypeFields = [
    {
      label: "Type Name",
      name: "type_name",
      type: "text",
      placeholder: "Enter type name (e.g., admin, driver)",
      validation: { 
        required: "Type name is required",
        pattern: {
          value: /^[a-zA-Z0-9-_ ]+$/,
          message: "Type name can only contain letters, numbers, spaces, hyphens and underscores"
        }
      },
    },
    {
      label: "Display Name",
      name: "display_name",
      type: "text",
      placeholder: "Enter display name (e.g., System Administrator)",
      validation: { required: "Display name is required" },
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
      validation: { required: "Status is required" },
    },
  ];

  // CRUD operations
  const handleDelete = async (item) => {
    try {
      await remove(item.type_id);
      await refresh();
      toast.success(`User Type "${item.type_name}" deleted successfully!`);
    } catch (error) {
      toast.error("Failed to delete user type");
      console.error("Error deleting user type:", error);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      await update(itemToEdit.type_id, data);
      await refresh();
      toast.success(`User Type "${data.type_name}" updated successfully!`);
      setShowEditPopup(false);
    } catch (error) {
      toast.error("Failed to update user type");
      console.error("Error updating user type:", error);
    }
  };

  const handleAddUserType = async (data) => {
    try {
      await create(data);
      await refresh();
      addFormMethods.reset();
      toast.success(`User Type "${data.type_name}" added successfully!`);
      setShowAddPopup(false);
    } catch (error) {
      toast.error("Failed to add user type");
      console.error("Error adding user type:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (initialLoad && isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="all-user-types-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <UserActions
        onSearch={handleSearch}
        onAdd={() => setShowAddPopup(true)}
        addButtonText="Add New Type"
      />

      <DynamicTable
        columns={columns}
        data={filteredData}
        onDelete={handleDelete}
        onEdit={handleEdit}
        deleteConfirmMessage={(item) =>
          `Are you sure you want to delete "${item.type_name}"?`
        }
      />

      {/* Add User Type Popup */}
      {showAddPopup && (
        <RightSidebarPopup
          show={showAddPopup}
          title="Add User Type"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset();
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={userTypeFields}
              onSubmit={handleAddUserType}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit User Type Popup */}
      {showEditPopup && itemToEdit && (
        <RightSidebarPopup
          show={showEditPopup}
          title="Edit User Type"
          onClose={() => setShowEditPopup(false)}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={userTypeFields}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default UserTypes;
