import React, { useState, useMemo } from "react";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import UserActions from "@/components/users/allusers/UserActions";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import FormComponent from "@/components/FormComponent";
import { useForm, FormProvider } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Vehicles.css";
import { useVehicle } from '@/pages/vehicles/hooks/useVehicle';
import { useResource } from '@/hooks/useResource';
import { vehicleValidationSchema } from '@/validations/inputValidation';
import { yupResolver } from '@hookform/resolvers/yup';
import { userApi, driverApi, vehiclePartsApi, vehicleServicesApi, documentsApi } from '@/api/baseApi';
import { API_BASE_URL } from '@/api/baseApi';
import { useMaintenance } from '@/pages/vehicles/hooks/useMaintenance';
import { maintenanceValidationSchema } from '@/validations/inputValidation';


const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(false);
  const [showDocumentPopup, setShowDocumentPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDocuments, setVehicleDocuments] = useState([]);

  const { vehicles, loading, error, createVehicle, updateVehicle, deleteVehicle, refreshVehicles } = useVehicle();
  const { data: users } = useResource(driverApi);
  const { createMaintenance, refreshMaintenance } = useMaintenance();
  const { data: vehicleParts } = useResource(vehiclePartsApi);
  const { data: vehicleServices } = useResource(vehicleServicesApi);

  // Form configuration
  const addFormMethods = useForm({
    resolver: yupResolver(vehicleValidationSchema)
  });
  const editFormMethods = useForm({
    resolver: yupResolver(vehicleValidationSchema)
  });
  const maintenanceFormMethods = useForm({
    resolver: yupResolver(maintenanceValidationSchema),
    mode: 'onChange',
    defaultValues: {
      vehicle_id: '',
      mechanic: '',
      service_date: new Date().toISOString().split('T')[0],
      odometer: '',
      notes: '',
      services: [],
      parts: []
    }
  });

  // Vehicle form fields
  const vehicleFields = useMemo(() => [
    { 
      label: "Make", 
      name: "make", 
      type: "text",
      validation: { required: "Make is required" }
    },
    { 
      label: "Model", 
      name: "model", 
      type: "text",
      validation: { required: "Model is required" }
    },
    { 
      label: "Color", 
      name: "color", 
      type: "text",
      validation: { required: "Color is required" }
    },
    { 
      label: "Capacity", 
      name: "capacity", 
      type: "select",
      options: [
        { label: "Select Capacity", value: "" },
        { label: "2", value: "2" },
        { label: "4", value: "4" },
        { label: "6", value: "6" }
      ],
      validation: { required: "Capacity is required" }
    },
    { 
      label: "Type", 
      name: "type", 
      type: "select",
      options: [
        { label: "Select Type", value: "" },
        { label: "Ambulatory", value: "Ambulatory" },
        { label: "Wheelchair", value: "Wheelchair" }
      ],
      validation: { required: "Type is required" }
    },
    { 
      label: "Vehicle Type", 
      name: "vehicle_type", 
      type: "select",
      options: [
        { label: "Sedan", value: "Sedan" },
        { label: "Van", value: "Van" },
        { label: "SUV", value: "SUV" }
      ],
      validation: { required: "Vehicle type is required" }
    },
    { 
      label: "MTX Unit Number", 
      name: "mtx_unit", 
      type: "text",
      validation: { required: "MTX Unit Number is required" }
    },
    { 
      label: "Plate Number", 
      name: "plate_number", 
      type: "text",
      validation: { required: "Plate Number is required" }
    },
    { 
      label: "Tyre Size", 
      name: "tyre_size", 
      type: "text",
      validation: { required: "Tyre Size is required" }
    },
    { 
      label: "VIN Number", 
      name: "vin", 
      type: "text",
      validation: { 
        required: "VIN is required",
        pattern: {
          value: /^[A-HJ-NPR-Z0-9]{17}$/,
          message: "Invalid VIN format"
        }
      }
    },
    { 
      label: "Purchase Date", 
      name: "purchase_date", 
      type: "date",
      validation: { required: "Purchase Date is required" }
    },
    { 
      label: "Registration Due", 
      name: "registration_due", 
      type: "date",
      validation: { required: "Registration Due date is required" }
    },
    { 
      label: "Last Registered", 
      name: "last_registered", 
      type: "date",
      validation: { required: "Last Registered date is required" }
    },
    { 
      label: "Assigned TS", 
      name: "assigned_ts", 
      type: "autocomplete",
      options: [
        ...(users?.map(user => ({
          label: `${user.first_name} ${user.last_name} ( ${user.id})`,
          value: user.id
        })) || [])
      ],
      validation: { required: "Assigned TS is required" }
    },
    { 
      label: "Date Assigned", 
      name: "date_assigned", 
      type: "date",
      validation: { required: "Date Assigned is required" }
    },
    { 
      label: "Insured From", 
      name: "insured_from", 
      type: "date",
      validation: { required: "Insured From date is required" }
    },
    { 
      label: "Insured To", 
      name: "insured_to", 
      type: "date",
      validation: { required: "Insured To date is required" }
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
        { label: "Maintenance", value: "Maintenance" }
      ],
      validation: { required: "Status is required" },
      defaultValue: "Active"
    }
  ], [users]);

  // Add maintenance fields configuration matching MaintenanceSchedule
  const maintenanceFields = [
    { label: 'Mechanic', name: 'mechanic', type: 'text', required: true },
    { label: 'Service Date', name: 'service_date', type: 'date', required: true },
    { label: 'Odometer', name: 'odometer', type: 'number', required: true },
    { label: 'Notes', name: 'notes', type: 'textarea' },
    {
      label: 'Services',
      name: 'services',
      type: 'array-checkboxes',
      valueField: 'service_id',
      options: vehicleServices?.map(s => ({
        label: `${s.service_name} (${s.service_code})`,
        value: s.service_id
      })) || [],
      defaultItemValues: {
        actual_hours: '',
        actual_cost: ''
      },
      itemFields: [
        { label: 'Actual Hours', name: 'actual_hours', type: 'number' },
        { label: 'Actual Cost', name: 'actual_cost', type: 'number' }
      ]
    },
    {
      label: 'Parts',
      name: 'parts',
      type: 'array-checkboxes',
      valueField: 'part_id',
      options: vehicleParts?.map(p => ({
        label: `${p.part_name} (${p.part_number})`,
        value: p.part_id
      })) || [],
      defaultItemValues: {
        quantity: 1,
        purchase_date: new Date().toISOString().split('T')[0],
        actual_price: '',
        warranty_applied: false
      },
      itemFields: [
        { label: 'Quantity', name: 'quantity', type: 'number' },
        { label: 'Purchase Date', name: 'purchase_date', type: 'date' },
        { label: 'Actual Price', name: 'actual_price', type: 'number' },
        { label: 'Warranty Applied', name: 'warranty_applied', type: 'checkbox' }
      ]
    }
  ];

  // Table columns
  const columns = [
    { header: "Unit", accessor: "mtx_unit", width: "10%" },
    { header: "Year", accessor: "purchase_date", width: "10%" },
    { header: "Make", accessor: "make", width: "12%" },
    { header: "Model", accessor: "model", width: "12%" },
    { header: "Color", accessor: "color", width: "10%" },
    { header: "VIN", accessor: "vin", width: "18%" },
    { 
      header: "Assigned TS", 
      accessor: "assigned_ts",
      width: "15%",
      render: (value, row) => {
        const assignedUser = row.assigned_user;
        return assignedUser 
          ? `${assignedUser.first_name} ${assignedUser.last_name} (${assignedUser.id})`
          : 'Unassigned';
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "23%",
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions
            row={row}
            onEdit={onEdit}
            onDelete={onDelete}
            customActions={[
              {
                label: "Documents",
                className: "add-documents",
                title: "Add Documents",
                onClick: () => handleAddDocuments(row)
              },
              {
              label: "Show",
              className: "show-docs-btn",
              title: "View Documents",
              onClick: (vehicle) => handleViewDetails(vehicle)
              },
              {
                label: "Maintenance",
                className: "add-maintenance",
                title: "Add Maintenance",
                onClick: handleAddMaintenance
              }
            ]}
          />
        ),
      ],
    },
  ];

  // Handlers
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddDocuments = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDocumentPopup(true);
  };

  const handleAddMaintenance = (vehicle) => {
    setSelectedVehicle(vehicle);
    maintenanceFormMethods.reset({
      ...maintenanceFormMethods.formState.defaultValues,
      vehicle_id: vehicle.vehicle_id
    });
    setShowMaintenancePopup(true);
  };

  const handleMaintenanceSubmit = async (data) => {
    try {
      const processedData = {
        ...data,
        services: data.services.map(s => ({
          ...s,
          actual_hours: s.actual_hours || 0,
          actual_cost: s.actual_cost || 0
        })),
        parts: data.parts.map(p => ({
          ...p,
          quantity: p.quantity || 1,
          actual_price: p.actual_price || 0
        }))
      };

      await createMaintenance(processedData);
      toast.success('New maintenance record created');
      setShowMaintenancePopup(false);
      refreshMaintenance();
    } catch (error) {
      toast.error('Error saving record: ' + error.message);
    }
  };

  const handleEdit = (vehicle) => {
    // We no longer need to fix the assigned_ts since backend doesn't overwrite it
    setItemToEdit(vehicle);
    editFormMethods.reset(vehicle);
    setShowEditPopup(true);
  };

  const handleAddVehicle = async (data) => {
    try {
      await createVehicle(data);
      toast.success("Vehicle added successfully!");
      setShowAddPopup(false);
      addFormMethods.reset();
    } catch (error) {
      console.error('Create vehicle error:', error.response?.data);
      toast.error(`Failed to add vehicle: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateVehicle(itemToEdit.vehicle_id, data);
      toast.success("Vehicle updated successfully!");
      setShowEditPopup(false);
      refreshVehicles();
    } catch (error) {
      handleFormError(error, editFormMethods.setError);
    }
  };

  const handleDelete = async (vehicle) => {
    try {
      await deleteVehicle(vehicle.vehicle_id);
      toast.success("Vehicle deleted successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Error handling helper
  const handleFormError = (error, setError) => {
    if (error.errors) {
      error.errors.forEach(err => {
        setError(err.path, { type: 'manual', message: err.message });
      });
    } else {
      toast.error(error.message);
    }
  };

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchQuery.toLowerCase();
    
    // Check if any direct property of the vehicle matches
    const directMatch = Object.values(vehicle).some(value =>
      String(value).toLowerCase().includes(searchLower)
    );
    
    // Also check if assigned_user fields match
    const userMatch = vehicle.assigned_user && (
      vehicle.assigned_user.first_name?.toLowerCase().includes(searchLower) ||
      vehicle.assigned_user.last_name?.toLowerCase().includes(searchLower) ||
      String(vehicle.assigned_user.id).includes(searchLower)
    );
    
    return directMatch || userMatch;
  });

  const handleDocumentUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error('Please select a file');
      return;
    }

    const file = files[0];
    const formData = new FormData();
    
    try {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, and PDF files are allowed');
        return;
      }

      // Important: Add these BEFORE appending the file
      formData.append('documentable_type', 'Vehicle'); // Fixed string 'Vehicle'
      formData.append('documentable_id', selectedVehicle.vehicle_id.toString()); // Convert to string
      formData.append('document', file);

      // Log FormData contents for debugging
      for (let pair of formData.entries()) {
        // Removing console.log statement
      }

      const response = await documentsApi.upload(formData);
      
      if (response.data) {
        toast.success('Document uploaded successfully');
        setShowDocumentPopup(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Upload timed out. Please try again with a smaller file.');
      } else {
        toast.error(
          error.response?.data?.message || 
          error.message || 
          'Upload failed. Please try again.'
        );
      }
    }
  };

  const handleViewDetails = async (vehicle) => {
    try {
      const response = await documentsApi.getByEntity('Vehicle', vehicle.vehicle_id);
      if (response.data) {
        setVehicleDocuments(response.data);
        setSelectedVehicle(vehicle);
        setShowViewPopup(true);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Error fetching documents. Please try again later.');
    }
  };

  return (
    <div className="vehicles-page">
      <ToastContainer position="top-right" autoClose={3000} />



      <UserActions
        onSearch={handleSearch}
        onAdd={() => setShowAddPopup(true)}
        addButtonText="Add Vehicle"
      />

      <div className="vehicles-table-container">
        <DynamicTable
          columns={columns}
          data={filteredVehicles}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      {/* Add Vehicle Popup */}
      {showAddPopup && (
        <RightSidebarPopup
          show={showAddPopup}
          title="Add Vehicle"
          onClose={() => {
            setShowAddPopup(false);
            addFormMethods.reset();
          }}
        >
          <FormProvider {...addFormMethods}>
            <FormComponent
              fields={vehicleFields}
              onSubmit={handleAddVehicle}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Edit Vehicle Popup */}
      {showEditPopup && itemToEdit && (
        <RightSidebarPopup
          show={showEditPopup}
          title="Edit Vehicle"
          onClose={() => setShowEditPopup(false)}
        >
          <FormProvider {...editFormMethods}>
            <FormComponent
              fields={vehicleFields}
              onSubmit={handleEditSubmit}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {/* Update Maintenance Popup */}
      {showMaintenancePopup && selectedVehicle && (
        <RightSidebarPopup
          show={showMaintenancePopup}
          title={`Add Maintenance Record - MTX Unit #${selectedVehicle.mtx_unit}`}
          onClose={() => setShowMaintenancePopup(false)}
        >
          <p className="vehicle-info">{selectedVehicle.make} {selectedVehicle.model}</p>
          <FormProvider {...maintenanceFormMethods}>
            <FormComponent
              fields={maintenanceFields}
              onSubmit={maintenanceFormMethods.handleSubmit(handleMaintenanceSubmit)}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {showDocumentPopup && selectedVehicle && (
        <RightSidebarPopup
          show={showDocumentPopup}
          title={`Upload Documents - MTX Unit #${selectedVehicle.mtx_unit}`}
          onClose={() => setShowDocumentPopup(false)}
        >
          <div className="document-upload-container">
            <p className="vehicle-info">{selectedVehicle.make} {selectedVehicle.model}</p>
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleDocumentUpload}
              id="document-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="document-upload" className="upload-button">
              Choose File
            </label>
            <p className="file-types">Accepted formats: JPEG, PNG, PDF</p>
            <p className="file-size-limit">Maximum file size: 5MB</p>
          </div>
        </RightSidebarPopup>
      )}

      {showViewPopup && selectedVehicle && (
        <RightSidebarPopup
          show={showViewPopup}
          title={`Documents - MTX Unit #${selectedVehicle.mtx_unit}`}
          onClose={() => setShowViewPopup(false)}
        >
          <div className="document-view-container">
            <p className="vehicle-info">{selectedVehicle.make} {selectedVehicle.model}</p>
            
            {vehicleDocuments.length === 0 ? (
              <p className="no-documents">No documents found for this vehicle.</p>
            ) : (
              <div className="documents-list">
                {vehicleDocuments.map((doc) => (
                  <div key={doc.document_id} className="document-item">
                    <a 
                      href={`${API_BASE_URL}/uploads/${doc.path.split('uploads/')[1]}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="document-link"
                    >
                      {doc.original_name}
                    </a>
                    <span className="document-date">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </RightSidebarPopup>
      )}
    </div>
  );
};

export default Vehicles;
