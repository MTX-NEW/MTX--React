import { useEffect, useState } from "react";
import Accordion from "../../../components/shared/Accordion";
import DataTable from "../../../components/shared/DataTable";
import Header from "../../../components/shared/Header";
import SideModal from "../../../components/shared/SideModal";
import DeleteDialog from "../../../components/shared/DeleteDialog";
import { useGetUsers } from "../../../queryClient/hooks/user.hook";
import { Chip, TableCell, TableRow } from "@mui/material";
import ActionRow from "../../../components/shared/ActionRow";
import ErrorState from "../../../components/shared/ErrorState";
import EmptyState from "../../../components/shared/EmptyState";
import { PaginatedReq } from "../../../interfaces/apiTypes";
import {
  UserTableDrop,
  UserTableRadio,
  UserTableText,
  iniitalUserTableDrop,
  initialUserTableRadio,
  initialUserTableText,
} from "../../../interfaces/types";
import { cells, dropdowns, radioBoxes, textBoxes } from "./inputs";

const AllUsers = () => {
  const [isOpenAdd, setIsOpenAdd] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

  const [pagination, setPagination] = useState<PaginatedReq>({
    page: 1,
    rowsPerPage: 2,
  });

  const [textBoxValuesAdd, setTextBoxValuesAdd] =
    useState<UserTableText>(initialUserTableText);
  const [radioValuesAdd, setRadioValuesAdd] = useState<UserTableRadio>(
    initialUserTableRadio
  );
  const [dropValuesAdd, setDropValuesAdd] =
    useState<UserTableDrop>(iniitalUserTableDrop);

  const [textBoxValuesEdit, setTextBoxValuesEdit] =
    useState<UserTableText>(initialUserTableText);
  const [radioValuesEdit, setRadioValuesEdit] = useState<UserTableRadio>(
    initialUserTableRadio
  );
  const [dropValuesEdit, setDropValuesEdit] =
    useState<UserTableDrop>(iniitalUserTableDrop);

  const handleChangeTextBoxAdd = (name: string, value: any) => {
    setTextBoxValuesAdd((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleChangeRadioAdd = (name: string, value: string) => {
    setRadioValuesAdd((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleChangeDropboxAdd = (name: string, value: string) => {
    setDropValuesAdd((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleChangeTextBoxEdit = (name: string, value: any) => {
    setTextBoxValuesEdit((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleChangeRadioEdit = (name: string, value: string) => {
    setRadioValuesEdit((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleChangeDropboxEdit = (name: string, value: string) => {
    setDropValuesEdit((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

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
        {isErrorAllUsers || !allUsers ? (
          <ErrorState
            title="Error occured"
            subTitle="An unknown error occured while fetching users"
            loading={isLoadingAllUsers}
            onClick={refetchUsers}
          />
        ) : allUsers.length === 0 ? (
          <EmptyState
            title="No users were found"
            subTitle="You can add users by clicking the button below"
            btnTitle="Add user"
            loading={isLoadingAllUsers}
            onClick={() => setIsOpenAdd(true)}
          />
        ) : (
          <div>
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
                      <Chip label="In-Active" color="warning" />
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
              isOpen={isOpenEdit}
              onChangeTextBox={handleChangeTextBoxEdit}
              onChangeDropbox={handleChangeDropboxEdit}
              onClickBtn={() => console.log(dropValuesEdit)}
              textBoxValues={textBoxValuesEdit}
              onChangeRadioBox={handleChangeRadioEdit}
              title="Edit User"
              onClickClose={() => setIsOpenEdit(false)}
              textBoxes={textBoxes}
              radioBoxes={radioBoxes}
              dropdowns={dropdowns}
              addBtnText="Save edit"
            />
            <DeleteDialog
              open={isOpenDelete}
              description="Are you sure you want to delete this user?"
              onClose={() => setIsOpenDelete(false)}
              onConfirm={() => setIsOpenDelete(false)}
              title="Delete Confirmation"
            />
          </div>
        )}
      </Accordion>
      <SideModal
        isOpen={isOpenAdd}
        onChangeTextBox={handleChangeTextBoxAdd}
        textBoxValues={textBoxValuesAdd}
        onChangeDropbox={handleChangeDropboxAdd}
        onChangeRadioBox={handleChangeRadioAdd}
        title="Add User"
        onClickBtn={() => console.log(radioValuesAdd)}
        onClickClose={() => setIsOpenAdd(false)}
        textBoxes={textBoxes}
        radioBoxes={radioBoxes}
        dropdowns={dropdowns}
        addBtnText="Add user"
      />
    </div>
  );
};
export default AllUsers;
