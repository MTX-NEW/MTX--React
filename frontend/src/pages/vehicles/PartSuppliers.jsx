import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useResource } from '@/hooks/useResource';
import { vehiclePartsApi } from '@/api/baseApi';
import { vehiclePartValidationSchema } from '@/validations/inputValidation';
import DynamicTable, { DefaultTableActions } from '@/components/DynamicTable';
import UserActions from '@/components/users/allusers/UserActions';
import RightSidebarPopup from '@/components/RightSidebarPopup';
import FormComponent from '@/components/FormComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { partsSupplierApi } from '@/api/baseApi';
import { supplierValidationSchema } from '@/validations/inputValidation';

const PartSuppliers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  
  const { 
    data: parts,
    loading,
    error,
    create,
    update,
    remove,
    refresh
  } = useResource(vehiclePartsApi, { idField: 'part_id' });

  const defaultValues = {
    part_number: '',
    part_name: '',
    type: 'OEM',
    brand: '',
    unit_price: 0,
    supplier: '',
    warranty: false,
    warranty_type: '',
    warranty_mileage: 0,
    warranty_time_unit: ''
  };

  const addFormMethods = useForm({
    resolver: yupResolver(vehiclePartValidationSchema),
    mode: 'onChange',
    defaultValues
  });

  const editFormMethods = useForm({
    resolver: yupResolver(vehiclePartValidationSchema),
    mode: 'onChange'
  });

  const supplierFormMethods = useForm({
    resolver: yupResolver(supplierValidationSchema),
    mode: 'onChange',
    defaultValues: {
      company_name: '',
      street_address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      fax: '',
      notes: ''
    }
  });


  const US_STATES = [
      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
      "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
      "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
      "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
      "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];

  const supplierFields = [
    { label: 'Company Name', name: 'company_name', type: 'text', required: true },
    { label: 'Street Address', name: 'street_address', type: 'text', required: true },
    { label: 'City', name: 'city', type: 'text', required: true },
    { 
      label: 'State', 
      name: 'state', 
      type: 'select',
      options: US_STATES.map(state => ({ label: state, value: state })),
      required: true
    },
    { label: 'ZIP Code', name: 'zip', type: 'text', required: true },
    { label: 'Phone', name: 'phone', type: 'tel', required: true },
    { label: 'Fax', name: 'fax', type: 'tel' },
    { label: 'Notes', name: 'notes', type: 'textarea' }
  ];


  const partFields = [
    { label: 'Part Number', name: 'part_number', type: 'text', required: true },
    { label: 'Part Name', name: 'part_name', type: 'text', required: true },
    {
      label: 'Type',
      name: 'type',
      type: 'select',
      options: [
        { label: 'OEM', value: 'OEM' },
        { label: 'Aftermarket', value: 'Aftermarket' },
        { label: 'Refurbished', value: 'Refurbished' }
      ],
      required: true
    },
    { label: 'Brand', name: 'brand', type: 'text', required: true },
    { label: 'Unit Price', name: 'unit_price', type: 'number', required: true },
    { label: 'Supplier', name: 'supplier', type: 'text', required: true },
    { label: 'Warranty', name: 'warranty', type: 'checkbox' },
    {
      label: 'Warranty Type',
      name: 'warranty_type',
      type: 'select',
      options: [
        { label: 'None', value: 'NULL' },
        { label: 'Time', value: 'Time' },
        { label: 'Mileage', value: 'Mileage' },
        { label: 'Both', value: 'Both' }
      ],
      showWhen: { field: 'warranty', value: true }
    },
    {
      label: 'Warranty Mileage',
      name: 'warranty_mileage',
      type: 'number',
      showWhen: { field: 'warranty', value: true }
    },
    {
      label: 'Warranty Time Unit',
      name: 'warranty_time_unit',
      type: 'select',
      options: [
        { label: 'Days', value: 'Days' },
        { label: 'Months', value: 'Months' },
        { label: 'Years', value: 'Years' },
        { label: 'Lifetime', value: 'Lifetime' }
      ],
      showWhen: { field: 'warranty', value: true }
    }
  ];

  const tableColumns = [
    { header: 'Part Number', accessor: 'part_number' },
    { header: 'Part Name', accessor: 'part_name' },
    { header: 'Type', accessor: 'type' },
    { header: 'Brand', accessor: 'brand' },
    { 
      header: 'Unit Price', 
      accessor: 'unit_price',
      render: (value) => `$${Number(value).toFixed(2)}`
    },
    { header: 'Supplier', accessor: 'supplier' },
    { 
      header: 'Warranty', 
      accessor: 'warranty',
      render: (value) => value ? 'Yes' : 'No'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_, part) => (
        <DefaultTableActions
          row={part}
          onEdit={() => handleEdit(part)}
          onDelete={() => handleDelete(part)}
        />
      )
    }
  ];

  const handleEdit = (part) => {
    editFormMethods.reset(part);
    setEditingPart(part);
    setShowPopup(true);
  };

  const handleAdd = () => {
    addFormMethods.reset(defaultValues);
    setEditingPart(null);
    setShowPopup(true);
  };

  const handleDelete = async (part) => {
    if (window.confirm('Delete this part?')) {
      try {
        await remove(part.part_id);
        toast.success('Part deleted');
        refresh();
      } catch (error) {
        toast.error('Delete failed: ' + error.message);
      }
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      await create(data);
      toast.success('Part created');
      setShowPopup(false);
      refresh();
    } catch (error) {
      toast.error('Error creating part: ' + error.message);
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await update(editingPart.part_id, data);
      toast.success('Part updated');
      setShowPopup(false);
      refresh();
    } catch (error) {
      toast.error('Error updating part: ' + error.message);
    }
  };

  const filteredParts = parts.filter(part =>
    part.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    part.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <UserActions 
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        addButtonText="Add New Part"
        secondaryButtonText="Add New Supplier"
        onSecondaryAdd={() => setShowSupplierPopup(true)}
      />

      <DynamicTable
        columns={tableColumns}
        data={filteredParts}
        loading={loading}
        error={error}
      />

      {showPopup && (
        <RightSidebarPopup
          show={showPopup}
          title={editingPart ? 'Edit Part' : 'New Part'}
          onClose={() => setShowPopup(false)}
        >
          <FormProvider {...(editingPart ? editFormMethods : addFormMethods)}>
            <FormComponent
              fields={partFields}
              onSubmit={editingPart ? 
                editFormMethods.handleSubmit(handleEditSubmit) : 
                addFormMethods.handleSubmit(handleAddSubmit)}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      {showSupplierPopup && (
        <RightSidebarPopup
          show={showSupplierPopup}
          title="New Supplier"
          onClose={() => setShowSupplierPopup(false)}
        >
          <FormProvider {...supplierFormMethods}>
            <FormComponent
              fields={supplierFields}
              onSubmit={supplierFormMethods.handleSubmit(async (data) => {
                try {
                  await partsSupplierApi.create(data);
                  toast.success('Supplier created');
                  setShowSupplierPopup(false);
                  refresh();
                } catch (error) {
                  toast.error('Error creating supplier: ' + error.message);
                }
              })}
            />
          </FormProvider>
        </RightSidebarPopup>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default PartSuppliers;
