import DataTable from "../../components/shared/DataTable";

const AllUsers = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <h1>All Users</h1>
      <DataTable
        cells={[
          "Full name",
          "Last name",
          "Username",
          "Email",
          "Phone",
          "EMP code",
          "User type",
          "User group",
          "Status",
          "Action",
        ]}
      />
    </div>
  );
};
export default AllUsers;
