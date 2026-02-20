import React, { useState, useEffect } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { groupValidationSchema } from "@/validations/inputValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { groupApi } from "@/api/baseApi";
import { useResource } from "@/hooks/useResource";

const UserGroups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const { 
    data: userGroups, 
    loading: isLoading, 
    create, 
    update, 
    remove,
    refresh 
  } = useResource(groupApi);

  // Set initial load to false once data is first loaded
 /* useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading]);
*/
  // Compute filtered groups based on search query
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery) return userGroups;
    return userGroups.filter(group =>
      Object.values(group).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userGroups, searchQuery]);

  // Form handlers with default values
  const addFormMethods = useForm({
    resolver: yupResolver(groupValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active",
      send_pdf: 0,
      auto_routing: 0,
      parent_group_id: null
    }
  });
  
  const editFormMethods = useForm({
    resolver: yupResolver(groupValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active",
      send_pdf: 0,
      auto_routing: 0,
      parent_group_id: null
    }
  });

  // Reset edit form when itemToEdit changes
  useEffect(() => {
    if (itemToEdit) {
      const formattedItem = {
        ...itemToEdit,
        send_pdf: itemToEdit.send_pdf ? "1" : "0",
        auto_routing: itemToEdit.auto_routing ? "1" : "0",
        parent_group_id: itemToEdit.parent_group_id || null
      };
      editFormMethods.reset(formattedItem);
    }
  }, [itemToEdit, editFormMethods]);

  // Table columns - Updated to match database column names
  const columns = [
    { header: "Full Name", accessor: "full_name" },
    { header: "Common", accessor: "common_name" },
    { header: "Phone", accessor: "phone" },
    { 
      header: "Website", 
      accessor: "website",
      render: (value) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value.replace(/^https?:\/\//, '').slice(0, 25)}{value.length > 25 ? '...' : ''}
        </a>
      ) : '-'
    },
    { 
      header: "Address", 
      accessor: "street_address",
      render: (value, row) => {
        const addressParts = [row.street_address, row.city, row.state, row.zip].filter(Boolean);
        const fullAddress = addressParts.join(', ');
        return fullAddress ? (
          <span title={fullAddress}>{fullAddress.slice(0, 35)}{fullAddress.length > 35 ? '...' : ''}</span>
        ) : '-';
      }
    },
    // Parent Organisation - not used; organisations are top-level
    // { 
    //   header: "Parent Organisation",
    //   accessor: "parent_group_id",
    //   render: (value, row) => {
    //     if (!value) return '-';
    //     const parentGroup = userGroups.find(g => g.group_id === value);
    //     return parentGroup ? parentGroup.common_name : value;
    //   }
    // },
    {
      header: "Auto Routing",
      accessor: "auto_routing",
      render: (value) => (
        <div className="d-flex align-items-center">
          <span className={`circle ${value ? "bg-success" : "bg-danger"} me-2`} />
          {value ? "Yes" : "No"}
        </div>
      ),
    },
    {
      header: "Send PDF",
      accessor: "send_pdf",
      render: (value) => (
        <div className="d-flex align-items-center">
          <span className={`circle ${value ? "bg-success" : "bg-danger"} me-2`} />
          {value ? "Yes" : "No"}
        </div>
      ),
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

  // Form fields configuration - Updated with proper types and defaults
  const groupFields = [
    { label: "Full Name", name: "full_name", type: "text", validation: { required: true } },
    { label: "Common Name", name: "common_name", type: "text", validation: { required: true } },
    { 
      label: "Phone", 
      name: "phone", 
      type: "tel",
      inputProps: {
        placeholder: "Enter 10-digit phone number",
        maxLength: 15,
        pattern: "[0-9]*"
      },
      validation: { 
        required: true,
        pattern: { value: /^[0-9]{10,15}$/, message: "Invalid phone format" }
      }
    },
    { 
      label: "Website", 
      name: "website", 
      type: "url",
      inputProps: {
        placeholder: "https://example.com"
      },
      validation: { 
        required: false
      }
    },
    { 
      label: "Street Address", 
      name: "street_address", 
      type: "text",
      inputProps: {
        placeholder: "Enter street address"
      },
      validation: { 
        required: false
      }
    },
    { 
      label: "City", 
      name: "city", 
      type: "text",
      inputProps: {
        placeholder: "Enter city"
      },
      validation: { 
        required: false
      }
    },
    { 
      label: "State", 
      name: "state", 
      type: "text",
      inputProps: {
        placeholder: "e.g., AZ",
        maxLength: 2,
        style: { textTransform: 'uppercase' }
      },
      validation: { 
        required: false
      }
    },
    { 
      label: "ZIP Code", 
      name: "zip", 
      type: "text",
      inputProps: {
        placeholder: "e.g., 85001",
        maxLength: 10
      },
      validation: { 
        required: false
      }
    },
    // Parent Organisation - not used; organisations are top-level
    // { 
    //   label: "Parent Organisation", 
    //   name: "parent_group_id", 
    //   type: "select",
    //   options: userGroups
    //     ?.filter(group => group.status === 'Active')
    //     ?.map(group => ({ label: group.full_name, value: group.group_id })) || [],
    //   inputProps: {
    //     placeholder: "Select parent organisation (optional)"
    //   }
    // },
    {
      label: "Status",
      name: "status",
      type: "radio",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
      validation: { required: true },
      layout: "horizontal"
    },
    {
      label: "Send PDF",
      name: "send_pdf",
      type: "radio",
      options: [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" },
      ],
      validation: { required: true },
      layout: "horizontal",
      transform: (value) => Number(value)
    },
    {
      label: "Auto Routing",
      name: "auto_routing",
      type: "radio",
      options: [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" },
      ],
      validation: { required: true },
      layout: "horizontal",
      transform: (value) => Number(value)
    }
  ];

  const handleDelete = async (item) => {
    try {
      await remove(item.group_id);
      await refresh();
      toast.success(`Organisation "${item.full_name}" deleted successfully!`);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete organisation";
      const detail = error.response?.data?.detail;
      toast.error(detail ? `${msg} ${detail}` : msg);
      console.error("Error deleting organisation:", error);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        send_pdf: Number(data.send_pdf),
        auto_routing: Number(data.auto_routing),
        parent_group_id: data.parent_group_id || null
      };
      
      await update(itemToEdit.group_id, formattedData);
      await refresh();
      toast.success(`Organisation "${formattedData.full_name}" updated successfully!`);
      setShowEditPopup(false);
    } catch (error) {
      toast.error("Failed to update organisation");
      console.error("Error updating organisation:", error);
    }
  };

  const handleAddGroup = async (data) => {
    try {
      const formattedData = {
        ...data,
        send_pdf: Number(data.send_pdf),
        auto_routing: Number(data.auto_routing),
        parent_group_id: data.parent_group_id || null
      };
      
      await create(formattedData);
      await refresh();
      addFormMethods.reset({
        status: "Active",
        send_pdf: "0",
        auto_routing: "0",
        parent_group_id: null
      });
      toast.success(`Organisation "${formattedData.full_name}" added successfully!`);
      setShowAddPopup(false);
    } catch (error) {
      toast.error("Failed to add organisation");
      console.error("Error adding organisation:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Update the loading check to only show during initial load
 /* if (initialLoad && isLoading) {
    return <div className="loading">Loading...</div>;
  }
*/
  return (
    <div className="">
      <ToastContainer position="top-right" autoClose={3000} />

      <UserActions
        onSearch={handleSearch}
        onAdd={() => setShowAddPopup(true)}
        addButtonText="Add New Organisation"
      />

      <DynamicTable
        columns={columns}
        data={filteredGroups}
        onDelete={handleDelete}
        onEdit={handleEdit}
        deleteConfirmMessage={(item) =>
          `Are you sure you want to delete "${item.full_name}"?`
        }
      />

      {/* Add Organisation Popup */}
      {showAddPopup && (
        <RightSidebarPopup
          show={showAddPopup}
          title="Add New Organisation"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset({
              status: "Active",
              send_pdf: 0,
              auto_routing: 0,
              parent_group_id: null
            });
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={groupFields}
              onSubmit={handleAddGroup}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit Organisation Popup */}
      {showEditPopup && itemToEdit && (
        <RightSidebarPopup
          show={showEditPopup}
          title="Edit Organisation"
          onClose={() => setShowEditPopup(false)}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={groupFields}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default UserGroups;