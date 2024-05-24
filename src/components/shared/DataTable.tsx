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
import { PaginatedReq } from "../../interfaces/apiTypes";

interface DataTableProps {
  cells: any[];
  rowsLength: number;
  children: React.ReactNode;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pagination: PaginatedReq;
}

const DataTable: React.FC<DataTableProps> = ({
  cells,
  rowsLength,
  children,
  pagination,
  onChangePage,
  onChangeRowsPerPage,
}) => {
  const style = {
    "&.MuiTableCell-root": {
      backgroundColor: "#005399",
      color: "white",
    },
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    onChangePage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChangeRowsPerPage(event);
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
          <TableBody>{children}</TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[2, 4, 6]}
        component="div"
        count={rowsLength}
        rowsPerPage={pagination.rowsPerPage}
        page={pagination.page}
        onPageChange={handleChangePage}
        backIconButtonProps={{
          disabled: pagination.page === 1,
        }}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default DataTable;
