import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMaintenance } from '@/pages/vehicles/hooks/useMaintenance';
import { maintenanceValidationSchema } from '@/validations/inputValidation';
import DynamicTable, { DefaultTableActions } from '@/components/DynamicTable';
import UserActions from '@/components/users/allusers/UserActions';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import FormComponent from '@/components/FormComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useVehicle } from '@/pages/vehicles/hooks/useVehicle';
import { useResource } from '@/hooks/useResource';
import { vehiclePartsApi, vehicleServicesApi } from '@/api/baseApi';

const MaintenanceSchedule = () => {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const { vehicles } = useVehicle();
  const { 
    maintenanceRecords, 
    createMaintenance, 
    updateMaintenance, 
    deleteMaintenance,
    refreshMaintenance 
  } = useMaintenance();

  // Add hooks for parts and services catalogs
  const { data: vehicleParts } = useResource(vehiclePartsApi);
  const { data: vehicleServices } = useResource(vehicleServicesApi);

  const defaultValues = {
    vehicle_id: '',
    mechanic: '',
    service_date: new Date().toISOString().split('T')[0],
    odometer: '',
    notes: '',
    services: [],
    parts: []
  };

  const addFormMethods = useForm({
    resolver: yupResolver(maintenanceValidationSchema),
    mode: 'onChange',
    defaultValues
  });

  const editFormMethods = useForm({
    resolver: yupResolver(maintenanceValidationSchema),
    mode: 'onChange'
  });

  const maintenanceFields = [
    // Vehicle Information
    {
      label: 'Vehicle',
      name: 'vehicle_id',
      type: 'select',
      options: vehicles?.map(v => ({ 
        label: `${v.make} ${v.model} (${v.mtx_unit})`, 
        value: v.vehicle_id 
      })) || [],
      required: true
    },
    { label: 'Mechanic', name: 'mechanic', type: 'text', required: true },
    { label: 'Service Date', name: 'service_date', type: 'date', required: true },
    { label: 'Odometer', name: 'odometer', type: 'number', required: true },
    { label: 'Notes', name: 'notes', type: 'textarea' },

    // Services Section
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

    // Parts Section
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

  const tableColumns = [
    { header: 'Date', accessor: 'service_date' },
    { 
      header: 'Vehicle', 
      accessor: 'vehicle',
      render: (vehicle) => vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.mtx_unit})` : 'N/A'
    },
    { header: 'Mechanic', accessor: 'mechanic' },
    { header: 'Odometer', accessor: 'odometer' },
    { 
      header: 'Services', 
      accessor: 'services',
      render: (services) => services?.map(s => 
        s.service?.service_name || 'Unknown Service'
      ).join(', ') || 'None'
    },
    { 
      header: 'Parts', 
      accessor: 'parts',
      render: (parts) => parts?.map(p => 
        p.part?.part_name || 'Unknown Part'
      ).join(', ') || 'None'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, record) => (
        <DefaultTableActions
          row={record}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
        />
      )
    }
  ];

  const handleEdit = (record) => {
    const formData = {
      ...record,
      vehicle_id: record.vehicle?.vehicle_id,
      services: record.services?.map(s => ({
        service_id: s.service?.service_id,
        actual_hours: s.actual_hours,
        actual_cost: s.actual_cost
      })) || [addFormMethods.defaultValues.services[0]],
      parts: record.parts?.map(p => ({
        part_id: p.part?.part_id,
        quantity: p.quantity,
        purchase_date: p.purchase_date,
        actual_price: p.actual_price,
        warranty_applied: p.warranty_applied
      })) || [addFormMethods.defaultValues.parts[0]]
    };
    editFormMethods.reset(formData);
    setEditingRecord(record);
    setShowPopup(true);
  };

  const handleAdd = () => {
    addFormMethods.reset(defaultValues);
    setEditingRecord(null);
    setShowPopup(true);
  };

  const handleDelete = async (record) => {
    if (window.confirm('Delete this maintenance record?')) {
      try {
        await deleteMaintenance(record.id);
        toast.success('Record deleted');
        refreshMaintenance();
      } catch (error) {
        toast.error('Delete failed: ' + error.message);
      }
    }
  };

  const handleAddSubmit = async (data) => {
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
      setShowPopup(false);
      refreshMaintenance();
    } catch (error) {
      toast.error('Error saving record: ' + error.message);
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateMaintenance(editingRecord.id, data);
      toast.success('Maintenance record updated');
      setShowPopup(false);
      refreshMaintenance();
    } catch (error) {
      toast.error('Error saving record: ' + error.message);
    }
  };

  const filteredRecords = maintenanceRecords.filter(record =>
    record.mechanic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.vehicle?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.vehicle?.mtx_unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <UserActions 
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        addButtonText="Add Maintenance"
      />

      <DynamicTable
        columns={tableColumns}
        data={filteredRecords}
      />

      {showPopup && (
        <RightSidebarPopup
          show={showPopup}
          title={editingRecord ? 'Edit Maintenance' : 'New Maintenance'}
          onClose={() => setShowPopup(false)}
        >
          <FormProvider {...(editingRecord ? editFormMethods : addFormMethods)}>
            <FormComponent
              fields={maintenanceFields}
              onSubmit={editingRecord ? 
                editFormMethods.handleSubmit(handleEditSubmit) : 
                addFormMethods.handleSubmit(handleAddSubmit)}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default MaintenanceSchedule;
