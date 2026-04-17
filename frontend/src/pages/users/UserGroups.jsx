import React, { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DynamicTable, { DefaultTableActions } from "@/components/DynamicTable";
import FormComponent from "@/components/FormComponent";
import RightSidebarPopup from "@/components/RightSidebarPopup";
import { groupValidationSchema, orgProgramValidationSchema, providerValidationSchema } from "@/validations/inputValidation";
import { orgProgramApi, providerApi, userApi } from "@/api/baseApi";
import { useResource } from "@/hooks/useResource";

const renderStatusBadge = (value) => (
  <span className={`status-badge ${(value || "inactive").toLowerCase()}`}>
    {value || "Unknown"}
  </span>
);

const normalizeOrganisationPayload = (data) => ({
  ...data,
  send_pdf: Number(data.send_pdf),
  auto_routing: Number(data.auto_routing),
  parent_group_id: data.parent_group_id || null
});

const UserGroups = () => {
  const {
    organisations = [],
    organisationsLoading = false,
    createOrganisation,
    updateOrganisation,
    removeOrganisation,
    selectedOrganisationId,
    setSelectedOrganisationId
  } = useOutletContext();
  const {
    data: insurancePlans = [],
    loading: plansLoading,
    create: createProgram,
    update: updateProgram,
    remove: removeProgram,
    refresh: refreshPrograms
  } = useResource(orgProgramApi, { idField: "program_id" });
  const {
    data: serviceProviders = [],
    loading: providersLoading,
    create: createProvider,
    update: updateProvider,
    remove: removeProvider,
    refresh: refreshProviders
  } = useResource(providerApi, { idField: "provider_id" });
  const { data: users = [], loading: usersLoading } = useResource(userApi);

  const [activeEntityTab, setActiveEntityTab] = useState("programs");
  const [showAddOrganisationPopup, setShowAddOrganisationPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAddProgramPopup, setShowAddProgramPopup] = useState(false);
  const [showAddProviderPopup, setShowAddProviderPopup] = useState(false);
  const [showEditProgramPopup, setShowEditProgramPopup] = useState(false);
  const [showEditProviderPopup, setShowEditProviderPopup] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const addOrganisationFormMethods = useForm({
    resolver: yupResolver(groupValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active",
      send_pdf: "0",
      auto_routing: "0",
      parent_group_id: null
    }
  });

  const editFormMethods = useForm({
    resolver: yupResolver(groupValidationSchema),
    mode: "onChange",
    defaultValues: {
      status: "Active",
      send_pdf: "0",
      auto_routing: "0",
      parent_group_id: null
    }
  });

  const addProgramFormMethods = useForm({
    resolver: yupResolver(orgProgramValidationSchema),
    mode: "onChange",
    defaultValues: {
      group_id: "",
      status: "Active"
    }
  });

  const addProviderFormMethods = useForm({
    resolver: yupResolver(providerValidationSchema),
    mode: "onChange",
    defaultValues: {
      program_id: "",
      status: "Active"
    }
  });

  const editProgramFormMethods = useForm({
    resolver: yupResolver(orgProgramValidationSchema),
    mode: "onChange",
    defaultValues: {
      group_id: "",
      status: "Active"
    }
  });

  const editProviderFormMethods = useForm({
    resolver: yupResolver(providerValidationSchema),
    mode: "onChange",
    defaultValues: {
      program_id: "",
      status: "Active"
    }
  });

  const isLoading = organisationsLoading || plansLoading || providersLoading || usersLoading;

  const sortedOrganisations = useMemo(() => {
    return [...organisations].sort((left, right) => {
      const leftName = left.full_name || left.common_name || "";
      const rightName = right.full_name || right.common_name || "";
      return leftName.localeCompare(rightName);
    });
  }, [organisations]);

  const selectedOrganisation = useMemo(() => {
    return sortedOrganisations.find(
      (organisation) => String(organisation.group_id) === String(selectedOrganisationId)
    ) || null;
  }, [sortedOrganisations, selectedOrganisationId]);

  useEffect(() => {
    if (!selectedOrganisation) return;

    editFormMethods.reset({
      ...selectedOrganisation,
      send_pdf: selectedOrganisation.send_pdf ? "1" : "0",
      auto_routing: selectedOrganisation.auto_routing ? "1" : "0",
      parent_group_id: selectedOrganisation.parent_group_id || null
    });
  }, [selectedOrganisation, editFormMethods]);

  useEffect(() => {
    addProgramFormMethods.reset({
      group_id: selectedOrganisationId ? Number(selectedOrganisationId) : "",
      status: "Active",
      program_name: "",
      short_name: "",
      phone: ""
    });
  }, [selectedOrganisationId, addProgramFormMethods]);

  useEffect(() => {
    if (!selectedProgram) return;

    editProgramFormMethods.reset({
      ...selectedProgram,
      group_id: selectedProgram.group_id ?? selectedOrganisationId
    });
  }, [editProgramFormMethods, selectedOrganisationId, selectedProgram]);

  useEffect(() => {
    if (!selectedProvider) return;

    editProviderFormMethods.reset({
      ...selectedProvider,
      program_id: selectedProvider.program_id ?? selectedProvider?.Program?.program_id ?? ""
    });
  }, [editProviderFormMethods, selectedProvider]);

  const organisationPlans = useMemo(() => {
    return insurancePlans.filter(
      (plan) => String(plan.group_id) === String(selectedOrganisationId)
    );
  }, [insurancePlans, selectedOrganisationId]);

  const organisationProviders = useMemo(() => {
    return serviceProviders.filter((provider) => {
      const providerOrganisationId = provider?.Program?.Organisation?.group_id ?? provider?.Program?.group_id;
      return String(providerOrganisationId) === String(selectedOrganisationId);
    });
  }, [serviceProviders, selectedOrganisationId]);

  const organisationUsers = useMemo(() => {
    return users.filter((user) => {
      const userOrganisationId = user?.UserGroup?.group_id ?? user?.user_group;
      return String(userOrganisationId) === String(selectedOrganisationId);
    });
  }, [users, selectedOrganisationId]);

  const planColumns = useMemo(() => ([
    { header: "Insurance Program", accessor: "program_name" },
    { header: "Short Name", accessor: "short_name", render: (value) => value || "-" },
    { header: "Phone", accessor: "phone", render: (value) => value || "-" },
    {
      header: "Status",
      accessor: "status",
      render: renderStatusBadge
    },
    {
      header: "Action",
      accessor: "actions",
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions row={row} onEdit={onEdit} onDelete={onDelete} />
        )
      ]
    }
  ]), []);

  const providerColumns = useMemo(() => ([
    {
      header: "Insurance Program",
      accessor: "Program",
      render: (value) => value?.program_name || "-"
    },
    { header: "Service Provider", accessor: "provider_name" },
    { header: "Short Name", accessor: "short_name", render: (value) => value || "-" },
    { header: "Phone", accessor: "phone", render: (value) => value || "-" },
    { header: "Email", accessor: "email", render: (value) => value || "-" },
    {
      header: "Status",
      accessor: "status",
      render: renderStatusBadge
    },
    {
      header: "Action",
      accessor: "actions",
      actions: [
        ({ row, onEdit, onDelete }) => (
          <DefaultTableActions row={row} onEdit={onEdit} onDelete={onDelete} />
        )
      ]
    }
  ]), []);

  const availableProgramOptions = useMemo(() => (
    organisationPlans
      .filter((program) => program.status === "Active")
      .map((program) => ({
        label: program.program_name,
        value: program.program_id
      }))
  ), [organisationPlans]);

  const groupFields = [
    { label: "Full Name", name: "full_name", type: "text" },
    { label: "Common Name", name: "common_name", type: "text" },
    { label: "Phone", name: "phone", type: "phone" },
    {
      label: "Website",
      name: "website",
      type: "url",
      inputProps: { placeholder: "https://example.com" }
    },
    { label: "Street Address", name: "street_address", type: "text" },
    { label: "City", name: "city", type: "text" },
    {
      label: "State",
      name: "state",
      type: "text",
      inputProps: {
        placeholder: "AZ",
        maxLength: 2,
        style: { textTransform: "uppercase" }
      }
    },
    {
      label: "ZIP Code",
      name: "zip",
      type: "text",
      inputProps: { placeholder: "85001", maxLength: 10 }
    },
    {
      label: "Status",
      name: "status",
      type: "radio",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" }
      ]
    },
    {
      label: "Send PDF",
      name: "send_pdf",
      type: "radio",
      options: [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" }
      ]
    },
    {
      label: "Auto Routing",
      name: "auto_routing",
      type: "radio",
      options: [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" }
      ]
    }
  ];

  const programFields = [
    {
      label: "Organisation",
      name: "group_id",
      type: "select",
      options: selectedOrganisation ? [
        {
          label: selectedOrganisation.full_name,
          value: selectedOrganisation.group_id
        }
      ] : [],
      disabled: true
    },
    { label: "Program Name", name: "program_name", type: "text" },
    { label: "Short Name", name: "short_name", type: "text" },
    { label: "Phone", name: "phone", type: "phone" },
    {
      label: "Status",
      name: "status",
      type: "radio",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" }
      ]
    }
  ];

  const providerFields = [
    {
      label: "Program",
      name: "program_id",
      type: "select",
      options: availableProgramOptions
    },
    { label: "Provider Name", name: "provider_name", type: "text" },
    { label: "Short Name", name: "short_name", type: "text" },
    { label: "Phone", name: "phone", type: "phone" },
    { label: "Email", name: "email", type: "email" },
    { label: "Street Address", name: "street_address", type: "text" },
    { label: "City", name: "city", type: "text" },
    {
      label: "State",
      name: "state",
      type: "text",
      inputProps: {
        placeholder: "AZ",
        maxLength: 2,
        style: { textTransform: "uppercase" }
      }
    },
    {
      label: "ZIP Code",
      name: "zip",
      type: "text",
      inputProps: {
        placeholder: "85001",
        maxLength: 10
      }
    },
    {
      label: "Status",
      name: "status",
      type: "radio",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" }
      ]
    }
  ];

  const handleAddOrganisation = async (data) => {
    try {
      const createdOrganisation = await createOrganisation(normalizeOrganisationPayload(data));
      toast.success(`Organisation "${data.full_name}" added successfully`);
      addOrganisationFormMethods.reset({
        status: "Active",
        send_pdf: "0",
        auto_routing: "0",
        parent_group_id: null
      });
      setSelectedOrganisationId(String(createdOrganisation.group_id));
      setShowAddOrganisationPopup(false);
    } catch (error) {
      console.error("Error adding organisation:", error);
      toast.error(error.response?.data?.message || "Failed to add organisation");
    }
  };

  const handleEditSubmit = async (data) => {
    if (!selectedOrganisation) return;

    try {
      await updateOrganisation(selectedOrganisation.group_id, normalizeOrganisationPayload(data));
      toast.success(`Organisation "${data.full_name}" updated successfully`);
      setShowEditPopup(false);
    } catch (error) {
      console.error("Error updating organisation:", error);
      toast.error(error.response?.data?.message || "Failed to update organisation");
    }
  };

  const handleDeleteOrganisation = async () => {
    if (!selectedOrganisation) return;

    try {
      await removeOrganisation(selectedOrganisation.group_id);
      toast.success(`Organisation "${selectedOrganisation.full_name}" deleted successfully`);
      setDeleteDialogOpen(false);

      const remainingOrganisations = sortedOrganisations.filter(
        (organisation) => organisation.group_id !== selectedOrganisation.group_id
      );
      setSelectedOrganisationId(remainingOrganisations[0] ? String(remainingOrganisations[0].group_id) : "");
    } catch (error) {
      console.error("Error deleting organisation:", error);
      toast.error(error.response?.data?.message || "Failed to delete organisation");
    }
  };

  const handleAddProgram = async (data) => {
    try {
      await createProgram({
        ...data,
        group_id: Number(selectedOrganisationId)
      });
      await refreshPrograms();
      addProgramFormMethods.reset({
        group_id: selectedOrganisationId ? Number(selectedOrganisationId) : "",
        status: "Active",
        program_name: "",
        short_name: "",
        phone: ""
      });
      toast.success(`Insurance "${data.program_name}" added successfully`);
      setShowAddProgramPopup(false);
    } catch (error) {
      console.error("Error adding program:", error);
      toast.error(error.response?.data?.message || "Failed to add insurance");
    }
  };

  const handleAddProvider = async (data) => {
    try {
      await createProvider(data);
      await refreshProviders();
      addProviderFormMethods.reset({
        program_id: "",
        status: "Active",
        provider_name: "",
        short_name: "",
        phone: "",
        email: "",
        street_address: "",
        city: "",
        state: "",
        zip: ""
      });
      toast.success(`Provider "${data.provider_name}" added successfully`);
      setShowAddProviderPopup(false);
    } catch (error) {
      console.error("Error adding provider:", error);
      toast.error(error.response?.data?.message || "Failed to add provider");
    }
  };

  const handleEditProgram = (program) => {
    setSelectedProgram(program);
    setShowEditProgramPopup(true);
  };

  const handleUpdateProgram = async (data) => {
    if (!selectedProgram) return;

    try {
      await updateProgram(selectedProgram.program_id, {
        ...data,
        group_id: Number(selectedOrganisationId)
      });
      await refreshPrograms();
      toast.success(`Insurance "${data.program_name}" updated successfully`);
      setShowEditProgramPopup(false);
      setSelectedProgram(null);
    } catch (error) {
      console.error("Error updating program:", error);
      toast.error(error.response?.data?.message || "Failed to update insurance");
    }
  };

  const handleDeleteProgram = async (program) => {
    try {
      await removeProgram(program.program_id);
      await refreshPrograms();
      toast.success(`Insurance "${program.program_name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting program:", error);
      const message = error.response?.data?.message || "Failed to delete insurance";
      const detail = error.response?.data?.detail;
      toast.error(detail ? `${message} ${detail}` : message);
    }
  };

  const handleEditProvider = (provider) => {
    setSelectedProvider(provider);
    setShowEditProviderPopup(true);
  };

  const handleUpdateProvider = async (data) => {
    if (!selectedProvider) return;

    try {
      await updateProvider(selectedProvider.provider_id, data);
      await refreshProviders();
      toast.success(`Provider "${data.provider_name}" updated successfully`);
      setShowEditProviderPopup(false);
      setSelectedProvider(null);
    } catch (error) {
      console.error("Error updating provider:", error);
      toast.error(error.response?.data?.message || "Failed to update provider");
    }
  };

  const handleDeleteProvider = async (provider) => {
    try {
      await removeProvider(provider.provider_id);
      await refreshProviders();
      toast.success(`Provider "${provider.provider_name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error(error.response?.data?.message || "Failed to delete provider");
    }
  };

  if (isLoading) {
    return (
      <div className="organisations-loading">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="user-groups-container organisations-hub">
      <ToastContainer position="top-right" autoClose={3000} />

      {!selectedOrganisation ? (
        <section className="organisations-empty-state">
          {sortedOrganisations.length === 0 ? (
            <>
              <h2>No organisations yet</h2>
              <p>Add an organisation to start managing its overview, insurance programs, and service providers.</p>
              <button
                type="button"
                className="add-user-btn"
                onClick={() => setShowAddOrganisationPopup(true)}
              >
                Add Organisation
              </button>
            </>
          ) : (
            <>
              <h2>Select an organisation</h2>
              <p>Choose an organisation from the Organisations menu to open its overview and related records.</p>
            </>
          )}
        </section>
      ) : (
        <>
          <section className="organisations-panel">
            <div className="organisations-panel-header">
              <div>
                <h3 className="organisations-panel-title">{selectedOrganisation.full_name}</h3>
              </div>
              <div className="organisations-actions">
                <button
                  type="button"
                  className="add-user-btn"
                  onClick={() => setShowAddOrganisationPopup(true)}
                >
                  Add Organisation
                </button>
                <button
                  type="button"
                  className="table-action-btn"
                  onClick={() => setShowEditPopup(true)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="table-action-btn organisations-delete-btn"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="organisations-detail-grid">
              <div>
                <span className="organisations-detail-label">Common Name</span>
                <p>{selectedOrganisation.common_name || "-"}</p>
              </div>
              <div>
                <span className="organisations-detail-label">Phone</span>
                <p>{selectedOrganisation.phone || "-"}</p>
              </div>
              <div>
                <span className="organisations-detail-label">Website</span>
                <p>{selectedOrganisation.website || "-"}</p>
              </div>
              <div>
                <span className="organisations-detail-label">Status</span>
                <div>{renderStatusBadge(selectedOrganisation.status)}</div>
              </div>
              <div className="organisations-detail-span">
                <span className="organisations-detail-label">Address</span>
                <p>
                  {[selectedOrganisation.street_address, selectedOrganisation.city, selectedOrganisation.state, selectedOrganisation.zip]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </p>
              </div>
              <div>
                <span className="organisations-detail-label">Send PDF</span>
                <p>{selectedOrganisation.send_pdf ? "Yes" : "No"}</p>
              </div>
              <div>
                <span className="organisations-detail-label">Auto Routing</span>
                <p>{selectedOrganisation.auto_routing ? "Yes" : "No"}</p>
              </div>
            </div>
          </section>

          <section className="organisations-panel">
            <div className="organisations-entity-header">
              <div className="users-list-subnav organisations-entity-tabs">
                <button
                  type="button"
                  className={`users-list-subnav-tab ${activeEntityTab === "programs" ? "active" : ""}`}
                  onClick={() => setActiveEntityTab("programs")}
                >
                  {`Insurance Programs (${organisationPlans.length})`}
                </button>
                <button
                  type="button"
                  className={`users-list-subnav-tab ${activeEntityTab === "providers" ? "active" : ""}`}
                  onClick={() => setActiveEntityTab("providers")}
                >
                  {`Service Providers (${organisationProviders.length})`}
                </button>
              </div>
              <div className="organisations-entity-actions">
                {activeEntityTab === "programs" ? (
                  <button
                    type="button"
                    className="add-user-btn"
                    onClick={() => setShowAddProgramPopup(true)}
                  >
                    Add Insurance
                  </button>
                ) : (
                  <button
                    type="button"
                    className="add-user-btn"
                    onClick={() => setShowAddProviderPopup(true)}
                    disabled={organisationPlans.length === 0}
                  >
                    Add Provider
                  </button>
                )}
              </div>
            </div>
            {activeEntityTab === "programs" ? (
              <DynamicTable
                columns={planColumns}
                data={organisationPlans}
                onEdit={handleEditProgram}
                onDelete={handleDeleteProgram}
                deleteConfirmMessage={(item) => `Are you sure you want to delete "${item.program_name}"?`}
              />
            ) : (
              <DynamicTable
                columns={providerColumns}
                data={organisationProviders}
                onEdit={handleEditProvider}
                onDelete={handleDeleteProvider}
                deleteConfirmMessage={(item) => `Are you sure you want to delete "${item.provider_name}"?`}
              />
            )}
            {activeEntityTab === "providers" && organisationPlans.length === 0 && (
              <p className="organisations-provider-note">
                Add an insurance program to this organisation before creating service providers.
              </p>
            )}
          </section>
        </>
      )}

      <RightSidebarPopup
        show={showAddOrganisationPopup}
        title="Add Organisation"
        onClose={() => setShowAddOrganisationPopup(false)}
      >
        <FormProvider {...addOrganisationFormMethods}>
          <FormComponent
            fields={groupFields}
            onSubmit={handleAddOrganisation}
            submitText="Add Organisation"
          />
        </FormProvider>
      </RightSidebarPopup>

      <RightSidebarPopup
        show={showEditPopup}
        title={selectedOrganisation ? `Edit ${selectedOrganisation.common_name || selectedOrganisation.full_name}` : "Edit Organisation"}
        onClose={() => setShowEditPopup(false)}
      >
        <FormProvider {...editFormMethods}>
          <FormComponent
            fields={groupFields}
            onSubmit={handleEditSubmit}
            submitText="Update Organisation"
          />
        </FormProvider>
      </RightSidebarPopup>

      <RightSidebarPopup
        show={showAddProgramPopup}
        title="Add Insurance"
        onClose={() => {
          setShowAddProgramPopup(false);
          addProgramFormMethods.reset({
            group_id: selectedOrganisationId ? Number(selectedOrganisationId) : "",
            status: "Active",
            program_name: "",
            short_name: "",
            phone: ""
          });
        }}
      >
        <FormProvider {...addProgramFormMethods}>
          <FormComponent
            fields={programFields}
            onSubmit={handleAddProgram}
            submitText="Add Insurance"
          />
        </FormProvider>
      </RightSidebarPopup>

      <RightSidebarPopup
        show={showEditProgramPopup}
        title={selectedProgram ? `Edit ${selectedProgram.program_name}` : "Edit Insurance"}
        onClose={() => {
          setShowEditProgramPopup(false);
          setSelectedProgram(null);
        }}
      >
        <FormProvider {...editProgramFormMethods}>
          <FormComponent
            fields={programFields}
            onSubmit={handleUpdateProgram}
            submitText="Update Insurance"
          />
        </FormProvider>
      </RightSidebarPopup>

      <RightSidebarPopup
        show={showAddProviderPopup}
        title="Add Provider"
        onClose={() => {
          setShowAddProviderPopup(false);
          addProviderFormMethods.reset({
            program_id: "",
            status: "Active",
            provider_name: "",
            short_name: "",
            phone: "",
            email: "",
            street_address: "",
            city: "",
            state: "",
            zip: ""
          });
        }}
      >
        <FormProvider {...addProviderFormMethods}>
          <FormComponent
            fields={providerFields}
            onSubmit={handleAddProvider}
            submitText="Add Provider"
          />
        </FormProvider>
      </RightSidebarPopup>

      <RightSidebarPopup
        show={showEditProviderPopup}
        title={selectedProvider ? `Edit ${selectedProvider.provider_name}` : "Edit Provider"}
        onClose={() => {
          setShowEditProviderPopup(false);
          setSelectedProvider(null);
        }}
      >
        <FormProvider {...editProviderFormMethods}>
          <FormComponent
            fields={providerFields}
            onSubmit={handleUpdateProvider}
            submitText="Update Provider"
          />
        </FormProvider>
      </RightSidebarPopup>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Organisation</DialogTitle>
        <DialogContent>
          <p className="organisations-delete-dialog-text">
            Please confirm that you want to delete{" "}
            <span className="organisations-delete-dialog-name">
              {selectedOrganisation?.full_name || "this organisation"}
            </span>.
          </p>
          <p className="organisations-delete-dialog-text">
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteOrganisation}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserGroups;
