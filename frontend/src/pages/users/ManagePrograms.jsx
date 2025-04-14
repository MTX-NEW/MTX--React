import React, { useState, useEffect } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { programValidationSchema } from "@/validations/inputValidation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { programApi } from "@/api/baseApi";
import { formatDate } from "@/utils/dateUtils";
import { useResource } from "@/hooks/useResource";

const ManagePrograms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [companies, setCompanies] = useState([]);

  const { 
    data: programs, 
    loading: isLoading, 
    create, 
    update, 
    remove,
    refresh 
  } = useResource(programApi);

  // Set initial load to false once data is first loaded
  useEffect(() => {
    if (!isLoading && initialLoad) {
      setInitialLoad(false);
    }
  }, [isLoading]);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await programApi.getCompanies();
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  // Compute filtered programs based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return programs;
    return programs.filter(program =>
      Object.values(program).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [programs, searchQuery]);

  // Form handlers
  const addFormMethods = useForm({
    resolver: yupResolver(programValidationSchema),
    mode: "onChange",
  });
  const editFormMethods = useForm({
    resolver: yupResolver(programValidationSchema),
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
    { header: "ID", accessor: "program_id" },
    { header: "Program Name", accessor: "program_name" },
    { header: "Company Name", accessor: "company_name" },
    { header: "Address", accessor: "address" },
    { header: "City", accessor: "city" },
    { header: "State", accessor: "state" },
    { header: "zip", accessor: "postal_code" },
    { header: "Phone", accessor: "phone" },
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
  const programFields = [
    {
      label: "Program Name",
      name: "program_name",
      type: "text",
      placeholder: "Enter program name",
      validation: { 
        required: "Program Name is required",
        maxLength: {
          value: 100,
          message: "Program Name cannot exceed 100 characters"
        }
      },
    },
    {
      label: "Company",
      name: "company_name",
      type: "autocomplete",
      placeholder: "Select or add company",
      options: companies,
      valueKey: "company_name",
      labelKey: "company_name",
      autocompleteProps: {
        freeSolo: true,
        getOptionLabel: (option) => option.company_name || option,
      },
      validation: { 
        maxLength: {
          value: 100,
          message: "Company Name cannot exceed 100 characters"
        }
      },
    },
    {
      label: "Address",
      name: "address",
      type: "textarea",
      placeholder: "Enter complete street address (optional)",
      inputProps: {
        rows: 3,
      },
      validation: {
        maxLength: {
          value: 500,
          message: "Address cannot exceed 500 characters"
        }
      },
    },
    {
      label: "City",
      name: "city",
      type: "text",
      placeholder: "Enter city (optional)",
      validation: { 
        maxLength: {
          value: 50,
          message: "City cannot exceed 50 characters"
        }
      },
    },
    {
      label: "State",
      name: "state",
      type: "text",
      placeholder: "Enter state code (e.g., NY) (optional)",
      validation: { 
        pattern: {
          value: /^[A-Z]{2}$/,
          message: "State must be a 2-letter code (e.g., NY, CA)"
        }
      },
    },
    {
      label: "Postal Code",
      name: "postal_code",
      type: "text",
      placeholder: "Enter postal code (e.g., 12345) (optional)",
      validation: { 
        pattern: {
          value: /^\d{5}(-\d{4})?$/,
          message: "Invalid postal code format (e.g., 12345 or 12345-6789)"
        }
      },
    },
    {
      label: "Phone Number",
      name: "phone",
      type: "tel",
      placeholder: "Enter 10-digit phone number (optional)",
      inputProps: {
        pattern: "[0-9]{10}",
        inputMode: "numeric",
        title: "Please enter exactly 10 digits"
      },
      validation: { 
        pattern: {
          value: /^\d{10}$/,
          message: "Phone number must be exactly 10 digits"
        }
      },
    },
  ];

  // CRUD operations
  const handleDelete = async (item) => {
    try {
      await remove(item.program_id);
      await refresh();
      toast.success(`Program "${item.program_name}" deleted successfully!`);
    } catch (error) {
      toast.error("Failed to delete program");
      console.error("Error deleting program:", error);
    }
  };

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowEditPopup(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      // Find matching company to get ID
      const selectedCompany = companies.find(c => c.company_name === data.company_name);
      
      const payload = {
        ...data,
        company_id: selectedCompany?.company_id || itemToEdit.company_id
      };

      await update(itemToEdit.program_id, payload);
      await refresh();
      toast.success(`Program "${data.program_name}" updated successfully!`);
      setShowEditPopup(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update program");
      console.error("Error updating program:", error);
    }
  };

  const handleAddProgram = async (data) => {
    try {
      // Find matching company to get ID
      const selectedCompany = companies.find(c => c.company_name === data.company_name);
      
      const payload = {
        ...data,
        company_id: selectedCompany?.company_id || null
      };

      await create(payload);
      await refresh();
      addFormMethods.reset();
      toast.success(`Program "${data.program_name}" added successfully!`);
      setShowAddPopup(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add program");
      console.error("Error adding program:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (initialLoad && isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="manage-programs-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <UserActions
        onSearch={handleSearch}
        onAdd={() => setShowAddPopup(true)}
        addButtonText="Add New Program"
      />

      <DynamicTable
        columns={columns}
        data={filteredData}
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
          title="Add Program"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset();
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

export default ManagePrograms;