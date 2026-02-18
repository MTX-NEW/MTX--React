export const userTableColumns = [
  { header: "First Name", accessor: "first_name" },
  { header: "Last Name", accessor: "last_name" },
  { header: "Username", accessor: "username" },
  { header: "Email", accessor: "email" },
  { header: "Phone", accessor: "phone" },
  { header: "EMP Code", accessor: "emp_code" },
  { 
    header: "Organisation", 
    accessor: "UserGroup",
    render: (value) => value?.common_name || 'N/A'
  },
  { 
    header: "User Type", 
    accessor: "UserType",
    render: (value) => value?.display_name || 'N/A'
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

export const getFormFields = (isEditMode, userGroups, allowedTypes, selectedGroupId) => {
  const baseFields = [
    { label: "First Name", name: "first_name", type: "text" },
    { label: "Last Name", name: "last_name", type: "text" },
    { label: "Username", name: "username", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone", name: "phone", type: "text" },
    {
      label: "Organisation",
      name: "user_group",
      type: "select",
      options: userGroups
        .filter(group => group.status === 'Active')
        .map(group => ({ label: group.common_name, value: group.group_id }))
    },
    {
      label: "User Type",
      name: "user_type",
      type: "select",
      options: allowedTypes
        .filter(type => type.status === 'Active')
        .map(type => ({ label: type.display_name, value: type.type_id })),
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
  ];

  if (isEditMode) {
    baseFields.splice(5, 0, {
      label: "Employee Code",
      name: "emp_code",
      type: "text",
      disabled: true,
      readOnly: true,
      helperText: "Auto-generated code cannot be modified"
    });
  }

  return baseFields;
}; 