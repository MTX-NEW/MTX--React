import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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

  return (
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
          {rows.map((row) => (
            <TableRow
              key={row.name}
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
  );
};

export default DataTable;
