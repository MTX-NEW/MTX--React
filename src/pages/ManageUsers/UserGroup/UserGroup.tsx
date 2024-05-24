import { useState } from "react";
import Accordion from "../../../components/shared/Accordion";
import DataTable from "../../../components/shared/DataTable";
import Header from "../../../components/shared/Header";
import SideModal from "../../../components/shared/SideModal";
import { cells, radioBoxes, textBoxes } from "./inputs";
import { PaginatedReq } from "../../../interfaces/apiTypes";
import { Chip, TableCell, TableRow } from "@mui/material";
import ActionRow from "../../../components/shared/ActionRow";
import {
  UserGroupRadio,
  UserGroupText,
  initialUserGroupRadio,
  initialUserGroupText,
} from "../../../interfaces/types";
import DeleteDialog from "../../../components/shared/DeleteDialog";

const UserGroup = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

  const [textBoxValuesAdd, setTextBoxValuesAdd] =
    useState<UserGroupText>(initialUserGroupText);
  const [radioValuesAdd, setRadioValuesAdd] = useState<UserGroupRadio>(
    initialUserGroupRadio
  );
  const [textBoxValuesEdit, setTextBoxValuesEdit] =
    useState<UserGroupText>(initialUserGroupText);
  const [radioValuesEdit, setRadioValuesEdit] = useState<UserGroupRadio>(
    initialUserGroupRadio
  );

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
        title="User Groups"
        addBtnText="Add new group"
        onClickBtn={() => setIsOpen(true)}
      />
      <Accordion title="Group 1">
        <DataTable
          cells={cells}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          pagination={pagination}
          rowsLength={5}
        >
          <TableRow>
            <TableCell>100</TableCell>
            <TableCell>Jackson Jeffery</TableCell>
            <TableCell>Jackson Jeffery</TableCell>
            <TableCell>CE</TableCell>
            <TableCell>Jeffery@gmail.com</TableCell>
            <TableCell>480-370-8545</TableCell>
            <TableCell>235235</TableCell>
            <TableCell>
              <div className="flex flex-col gap-y-1">
                <div className="flex gap-x-1">
                  <img src="/svgs/greenCircle.svg" />
                  <label>Yes</label>
                </div>
                <div className="flex gap-x-1">
                  <img src="/svgs/redCircle.svg" />
                  <label>No</label>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Chip label="Active" color="success" />
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
          title="Add new group"
          onChangeTextBox={handleChangeTextBoxAdd}
          onClickBtn={() => setIsOpen(false)}
          textBoxValues={textBoxValuesAdd}
          onChangeRadioBox={handleChangeRadioAdd}
          onClickClose={() => setIsOpen(false)}
          textBoxes={textBoxes}
          radioBoxes={radioBoxes}
          addBtnText="Create group"
        />
        <SideModal
          isOpen={isOpenEdit}
          onChangeTextBox={handleChangeTextBoxEdit}
          onClickBtn={() => setIsOpenEdit(false)}
          textBoxValues={textBoxValuesEdit}
          onChangeRadioBox={handleChangeRadioEdit}
          title="Edit group"
          onClickClose={() => setIsOpenEdit(false)}
          textBoxes={textBoxes}
          radioBoxes={radioBoxes}
          addBtnText="Save edit"
        />
        <DeleteDialog
          open={isOpenDelete}
          description="Are you sure you want to delete this user group?"
          onClose={() => setIsOpenDelete(false)}
          onConfirm={() => setIsOpenDelete(false)}
          title="Delete Confirmation"
        />
      </Accordion>
    </div>
  );
};
export default UserGroup;
