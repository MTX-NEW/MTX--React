import { useState } from "react";
import Accordion from "../../../components/shared/Accordion";
import DataTable from "../../../components/shared/DataTable";
import Header from "../../../components/shared/Header";
import SideModal from "../../../components/shared/SideModal";
import { cells, textBoxes } from "./inputs";
import { PaginatedReq } from "../../../interfaces/apiTypes";
import { TableCell, TableRow } from "@mui/material";
import ActionRow from "../../../components/shared/ActionRow";
import {
  UserProgramText,
  initialUserProgramText,
} from "../../../interfaces/types";
import DeleteDialog from "../../../components/shared/DeleteDialog";

const ManagePrograms = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenEdit, setIsOpenEdit] = useState<boolean>(false);
  const [isOpenDelete, setIsOpenDelete] = useState<boolean>(false);

  const [pagination, setPagination] = useState<PaginatedReq>({
    page: 1,
    rowsPerPage: 2,
  });

  const [textBoxValuesAdd, setTextBoxValuesAdd] = useState<UserProgramText>(
    initialUserProgramText
  );

  const [textBoxValuesEdit, setTextBoxValuesEdit] = useState<UserProgramText>(
    initialUserProgramText
  );

  const handleChangeTextBoxAdd = (name: string, value: any) => {
    setTextBoxValuesAdd((prevValues: any) => ({
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
        title="Manage programs"
        addBtnText="Add Program"
        onClickBtn={() => setIsOpen(true)}
      />
      <Accordion title="User Type">
        <DataTable
          cells={cells}
          rowsLength={5}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          pagination={pagination}
        >
          <TableRow>
            <TableCell>1</TableCell>
            <TableCell>Macias Lorenzo </TableCell>
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
          title="Add Program"
          onChangeTextBox={handleChangeTextBoxAdd}
          textBoxValues={textBoxValuesAdd}
          onClickBtn={() => setIsOpen(false)}
          onClickClose={() => setIsOpen(false)}
          textBoxes={textBoxes}
          addBtnText="Create Program"
        />
        <SideModal
          isOpen={isOpenEdit}
          onChangeTextBox={handleChangeTextBoxEdit}
          textBoxValues={textBoxValuesEdit}
          title="Edit Program"
          onClickBtn={() => setIsOpenEdit(false)}
          onClickClose={() => setIsOpenEdit(false)}
          textBoxes={textBoxes}
          addBtnText="Save edit"
        />
        <DeleteDialog
          open={isOpenDelete}
          description="Are you sure you want to delete this program?"
          onClose={() => setIsOpenDelete(false)}
          onConfirm={() => setIsOpenDelete(false)}
          title="Delete Confirmation"
        />
      </Accordion>
    </div>
  );
};
export default ManagePrograms;
