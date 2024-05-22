import { useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import ActionRow from "./ActionRow";

interface DataTableProps {
  cells: any[];
  onClickEdit: () => void;
  onClickDelete: () => void;
}

const DataTable: React.FC<DataTableProps> = ({
  cells,
  onClickEdit,
  onClickDelete,
}) => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  let rows = [
    {
      name: "Name",
      age: 0,
      action: (
        <ActionRow onClickDelete={onClickDelete} onClickEdit={onClickEdit} />
      ),
    },
  ];
  const style = {
    "&.MuiTableCell-root": {
      backgroundColor: "#005399",
      color: "white",
    },
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table sx={{ maxWidth: "100%" }}>
          <TableHead>
            <TableRow>
              {cells.map((cell, index) => (
                <TableCell sx={style} key={index}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row.action}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default DataTable;
