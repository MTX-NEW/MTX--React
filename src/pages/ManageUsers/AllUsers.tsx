import { useEffect, useState } from "react";
import Accordion from "../../components/shared/Accordion";
import DataTable from "../../components/shared/DataTable";
import Header from "../../components/shared/Header";
import SideModal from "../../components/shared/SideModal";
import DeleteDialog from "../../components/shared/DeleteDialog";
import { useGetUsers } from "../../queryClient/hooks/user.hook";
import { Chip, TableCell, TableRow } from "@mui/material";
import ActionRow from "../../components/shared/ActionRow";

const AllUsers = () => {
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginatedReq>({
    page: 1,
    rowsPerPage: 2,
  });
  const handlePageChange = (newPage: number) => {
    let updatedPagination = { ...pagination };
    updatedPagination.page = newPage;
    setPagination(updatedPagination);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let updatedPagination = { ...pagination };
    updatedPagination.rowsPerPage = parseInt(event.target.value, 10);
    setPagination(updatedPagination);
  };
  const {
    data: allUsersData,
    isLoading: isLoadingAllUsers,
    isError: isErrorAllUsers,
    refetch: refetchUsers,
  } = useGetUsers(pagination);

  const allUsers = allUsersData?.users || [];
  const totalCount = allUsersData?.totalCount || 0;

  let cells = [
    "ID",
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
  ];
  useEffect(() => {
    refetchUsers();
  }, [pagination, refetchUsers]);
  return (
    <div className="flex flex-col gap-y-4">
      <Header
        title="All Users"
        addBtnText="Add new user"
        onClickBtn={() => setIsOpenAdd(true)}
      />
      <Accordion title="Users" loading={isLoadingAllUsers}>
        <DataTable
          cells={cells}
          rowsLength={totalCount}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          pagination={pagination}
        >
          {allUsers?.map((user, index) => (
            <TableRow key={index}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.firstName + user.lastName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.empCode}</TableCell>
              <TableCell>User type</TableCell>
              <TableCell>User group</TableCell>
              <TableCell>
                {user.active ? (
                  <Chip label="Active" color="success" />
                ) : (
                  <Chip label="In-Active" color="error" />
                )}
              </TableCell>
              <TableCell>
                <ActionRow
                  onClickDelete={() => setIsOpenDelete(true)}
                  onClickEdit={() => setIsOpenEdit(true)}
                />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
        <SideModal
          isOpen={isOpenAdd}
          title="Add User"
          onClickClose={() => setIsOpenAdd(false)}
          textBoxes={[
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Password",
            "EMP Code",
            "Hiring Date",
            "Last Employment Date",
          ]}
          radioBoxes={[
            {
              title: "Sex",
              items: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ],
            },
            {
              title: "Spnaish Speaking",
              items: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
            {
              title: "Stauts",
              items: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ],
            },
            {
              title: "Payment Structure",
              items: [
                { label: "Pay per hour", value: "hour" },
                { label: "Pay per mile", value: "mile" },
                { label: "Pay per trip", value: "trip" },
              ],
            },
          ]}
          dropdowns={[
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User group",
            },
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User type",
            },
          ]}
          addBtnText="Add user"
        />
        <SideModal
          isOpen={isOpenEdit}
          title="Edit User"
          onClickClose={() => setIsOpenEdit(false)}
          textBoxes={[
            "First Name",
            "Last Name",
            "Email",
            "Phone",
            "Password",
            "EMP Code",
            "Hiring Date",
            "Last Employment Date",
          ]}
          radioBoxes={[
            {
              title: "Sex",
              items: [
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ],
            },
            {
              title: "Spnaish Speaking",
              items: [
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" },
              ],
            },
            {
              title: "Stauts",
              items: [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Suspended", value: "suspended" },
              ],
            },
            {
              title: "Payment Structure",
              items: [
                { label: "Pay per hour", value: "hour" },
                { label: "Pay per mile", value: "mile" },
                { label: "Pay per trip", value: "trip" },
              ],
            },
          ]}
          dropdowns={[
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User group",
            },
            {
              items: [
                { label: "1", value: "one" },
                { label: "2", value: "two" },
              ],
              title: "User type",
            },
          ]}
          addBtnText="Save edit"
        />
        <DeleteDialog
          open={isOpenDelete}
          description="Are you sure you want to delete this user?"
          onClose={() => setIsOpenDelete(false)}
          onConfirm={() => setIsOpenDelete(false)}
          title="Delete Confirmation"
        />
      </Accordion>
    </div>
  );
};
export default AllUsers;
