import React, { useState, useEffect } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { providerValidationSchema } from "@/validations/inputValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { providerApi, orgProgramApi } from "@/api/baseApi";
import { useResource } from "@/hooks/useResource";

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const { 
    data: providers, 
    loading: isLoading, 
    create, 
    update, 
    remove,
    refresh 
  } = useResource(providerApi);

  const { data: programs } = useResource(orgProgramApi);

  const filteredProviders = React.useMemo(() => {
    if (!searchQuery) return providers;
    return providers.filter(provider =>
      Object.values(provider).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [providers, searchQuery]);

  const addFormMethods = useForm({
    resolver: yupResolver(providerValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active"
    }
  });
  
  const editFormMethods = useForm({
    resolver: yupResolver(providerValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active"
    }
  });

  useEffect(() => {
    if (itemToEdit) {
      editFormMethods.reset(itemToEdit);
    }
  }, [itemToEdit, editFormMethods]);

  const columns = [
    { 
      header: "Program", 
      accessor: "Program",
      render: (value) => value?.program_name || '-'
    },
    { header: "Provider Name", accessor: "provider_name" },
    { header: "Short Name", accessor: "short_name", render: (value) => value || '-' },
    { header: "Phone", accessor: "phone", render: (value) => value || '-' },
    { header: "Email", accessor: "email", render: (value) => value || '-' },
    { 
      header: "Address", 
      accessor: "street_address",
      render: (value, row) => {
        const addressParts = [row.street_address, row.city, row.state, row.zip].filter(Boolean);
        const fullAddress = addressParts.join(', ');
        return fullAddress ? (
          <span title={fullAddress}>{fullAddress.slice(0, 30)}{fullAddress.length > 30 ? '...' : ''}</span>
        ) : '-';
      }
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span className={`status-badge ${value?.toLowerCase()}`}>
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

  const providerFields = [
    {
      label: "Program",
      name: "program_id",
      type: "select",
      options: programs
        ?.filter(prog => prog.status === 'Active')
        ?.map(prog => ({ 
          label: `${prog.program_name}${prog.Organisation ? ` (${prog.Organisation.common_name})` : ''}`, 
          value: prog.program_id 
        })) || [],
      validation: { required: true }
    },
    { label: "Provider Name", name: "provider_name", type: "text", validation: { required: true } },
    { label: "Short Name", name: "short_name", type: "text" },
    { 
      label: "Phone", 
      name: "phone", 
      type: "phone",
    },
    { 
      label: "Email", 
      name: "email", 
      type: "email",
      inputProps: {
        placeholder: "Enter email address"
      }
    },
    { 
      label: "Street Address", 
      name: "street_address", 
      type: "text",
      inputProps: {
        placeholder: "Enter street address"
      }
    },
    { 
      label: "City", 
      name: "city", 
      type: "text",
      inputProps: {
        placeholder: "Enter city"
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
      }
    },
    { 
      label: "ZIP Code", 
      name: "zip", 
      type: "text",
      inputProps: {
        placeholder: "e.g., 85001",
        maxLength: 10
      }
    },
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
    }
  ];

  const handleDelete = async (item) => {
    try {
      await remove(item.provider_id);
      await refresh();
      toast.success(`Provider "${item.provider_name}" deleted successfully!`);
    } catch (error) {
      toast.error("Failed to delete provider");
      console.error("Error deleting provider:", error);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      await update(itemToEdit.provider_id, data);
      await refresh();
      toast.success(`Provider "${data.provider_name}" updated successfully!`);
      setShowEditPopup(false);
    } catch (error) {
      toast.error("Failed to update provider");
      console.error("Error updating provider:", error);
    }
  };

  const handleAddProvider = async (data) => {
    try {
      await create(data);
      await refresh();
      addFormMethods.reset({ status: "Active" });
      toast.success(`Provider "${data.provider_name}" added successfully!`);
      setShowAddPopup(false);
    } catch (error) {
      toast.error("Failed to add provider");
      console.error("Error adding provider:", error);
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
        addButtonText="Add New Provider"
      />

      <DynamicTable
        columns={columns}
        data={filteredProviders}
        onDelete={handleDelete}
        onEdit={handleEdit}
        deleteConfirmMessage={(item) =>
          `Are you sure you want to delete "${item.provider_name}"?`
        }
      />

      {/* Add Provider Popup */}
      {showAddPopup && (
        <RightSidebarPopup
          show={showAddPopup}
          title="Add New Provider"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset({ status: "Active" });
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={providerFields}
              onSubmit={handleAddProvider}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit Provider Popup */}
      {showEditPopup && itemToEdit && (
        <RightSidebarPopup
          show={showEditPopup}
          title="Edit Provider"
          onClose={() => setShowEditPopup(false)}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={providerFields}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default Providers;
