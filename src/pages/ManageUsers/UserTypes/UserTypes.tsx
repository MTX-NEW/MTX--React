import { useState } from "react";
import Accordion from "../../../components/shared/Accordion";
import DataTable from "../../../components/shared/DataTable";
import Header from "../../../components/shared/Header";
import SideModal from "../../../components/shared/SideModal";
import { cells, radioBoxes, textBoxes } from "./inputs";
import { PaginatedReq } from "../../../interfaces/apiTypes";
import { Chip, TableCell, TableRow } from "@mui/material";
import ActionRow from "../../../components/shared/ActionRow";
import DeleteDialog from "../../../components/shared/DeleteDialog";
import {
  UserTypeRadio,
  UserTypeText,
  initialUserTypeRadio,
  initialUserTypeText,
} from "../../../interfaces/types";

const UserTypes = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

  const [textBoxValuesAdd, setTextBoxValuesAdd] =
    useState<UserTypeText>(initialUserTypeText);
  const [radioValuesAdd, setRadioValuesAdd] =
    useState<UserTypeRadio>(initialUserTypeRadio);

  const [textBoxValuesEdit, setTextBoxValuesEdit] =
    useState<UserTypeText>(initialUserTypeText);
  const [radioValuesEdit, setRadioValuesEdit] =
    useState<UserTypeRadio>(initialUserTypeRadio);

  const handleChangeTextBoxAdd = (name: string, value: any) => {
    setTextBoxValuesAdd((prevValues: any) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleChangeRadioAdd = (name: string, value: string) => {
    console.log(name, value);
    setRadioValuesAdd((prevValues) => ({
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
  return (
    <div className="flex flex-col gap-y-4">
      <Header
        title="User Types"
        addBtnText="Add user type"
        onClickBtn={() => setIsOpen(true)}
      />
      <Accordion title="User type">
        <DataTable
          pagination={pagination}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          rowsLength={5}
          cells={cells}
        >
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>Jackson Lorenzo</TableCell>
            <TableCell>Jeffrey</TableCell>
            <TableCell>
              <Chip label="Inactive" color="error" />
            </TableCell>
            <TableCell>
              <ActionRow
                onClickDelete={() => setIsOpenDelete(true)}
                onClickEdit={() => setIsOpenEdit(true)}
              />
            </TableCell>
          </TableRow>
        </DataTable>
        <SideModal
          isOpen={isOpen}
          onChangeTextBox={handleChangeTextBoxAdd}
          onChangeRadioBox={handleChangeRadioAdd}
          textBoxValues={textBoxValuesAdd}
          onClickBtn={() => setIsOpen(false)}
          title="Add new user type"
          onClickClose={() => setIsOpen(false)}
          textBoxes={textBoxes}
          radioBoxes={radioBoxes}
          addBtnText="Create user type"
        />
        <SideModal
          isOpen={isOpenEdit}
          onChangeTextBox={handleChangeTextBoxEdit}
          onClickBtn={() => setIsOpenEdit(false)}
          textBoxValues={textBoxValuesEdit}
          onChangeRadioBox={handleChangeRadioEdit}
          title="Edit user type"
          onClickClose={() => setIsOpenEdit(false)}
          textBoxes={textBoxes}
          radioBoxes={radioBoxes}
          addBtnText="Save edit"
        />
        <DeleteDialog
          open={isOpenDelete}
          description="Are you sure you want to delete this user type?"
          onClose={() => setIsOpenDelete(false)}
          onConfirm={() => setIsOpenDelete(false)}
          title="Delete Confirmation"
        />
      </Accordion>
    </div>
  );
};
export default UserTypes;
