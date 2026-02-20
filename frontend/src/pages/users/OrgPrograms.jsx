import React, { useState, useEffect } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { orgProgramValidationSchema } from "@/validations/inputValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { orgProgramApi, groupApi } from "@/api/baseApi";
import { useResource } from "@/hooks/useResource";

const OrgPrograms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const { 
    data: programs, 
    loading: isLoading, 
    create, 
    update, 
    remove,
    refresh 
  } = useResource(orgProgramApi);

  const { data: organisations } = useResource(groupApi);

  const filteredPrograms = React.useMemo(() => {
    if (!searchQuery) return programs;
    return programs.filter(program =>
      Object.values(program).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);

  const addFormMethods = useForm({
    resolver: yupResolver(orgProgramValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active"
    }
  });
  
  const editFormMethods = useForm({
    resolver: yupResolver(orgProgramValidationSchema),
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
      header: "Organisation", 
      accessor: "Organisation",
      render: (value) => value?.common_name || value?.full_name || '-'
    },
    { header: "Program Name", accessor: "program_name" },
    { header: "Short Name", accessor: "short_name", render: (value) => value || '-' },
    { header: "Phone", accessor: "phone", render: (value) => value || '-' },
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

  const programFields = [
    {
      label: "Organisation",
      name: "group_id",
      type: "select",
      options: organisations
        ?.filter(org => org.status === 'Active')
        ?.map(org => ({ label: org.full_name, value: org.group_id })) || [],
      validation: { required: true }
    },
    { label: "Program Name", name: "program_name", type: "text", validation: { required: true } },
    { label: "Short Name", name: "short_name", type: "text" },
    { 
      label: "Phone", 
      name: "phone", 
      type: "tel",
      inputProps: {
        placeholder: "Enter phone number (optional)",
        maxLength: 15
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
      await remove(item.program_id);
      await refresh();
      toast.success(`Program "${item.program_name}" deleted successfully!`);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete program";
      const detail = error.response?.data?.detail;
      toast.error(detail ? `${msg} ${detail}` : msg);
      console.error("Error deleting program:", error);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      await update(itemToEdit.program_id, data);
      await refresh();
      toast.success(`Program "${data.program_name}" updated successfully!`);
      setShowEditPopup(false);
    } catch (error) {
      toast.error("Failed to update program");
      console.error("Error updating program:", error);
    }
  };

  const handleAddProgram = async (data) => {
    try {
      await create(data);
      await refresh();
      addFormMethods.reset({ status: "Active" });
      toast.success(`Program "${data.program_name}" added successfully!`);
      setShowAddPopup(false);
    } catch (error) {
      toast.error("Failed to add program");
      console.error("Error adding program:", error);
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
        addButtonText="Add New Program"
      />

      <DynamicTable
        columns={columns}
        data={filteredPrograms}
        onDelete={handleDelete}
        onEdit={handleEdit}
        deleteConfirmMessage={(item) =>
          `Are you sure you want to delete "${item.program_name}"?`
        }
      />

      {/* Add Program Popup */}
      {showAddPopup && (
        <RightSidebarPopup
          show={showAddPopup}
          title="Add New Program"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset({ status: "Active" });
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={programFields}
              onSubmit={handleAddProgram}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit Program Popup */}
      {showEditPopup && itemToEdit && (
        <RightSidebarPopup
          show={showEditPopup}
          title="Edit Program"
          onClose={() => setShowEditPopup(false)}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={programFields}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default OrgPrograms;
