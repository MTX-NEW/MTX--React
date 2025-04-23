// components/DynamicTable/DynamicTable.jsx
import React from "react";
import { FaEdit, FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Pagination,
} from "@mui/material";

const DynamicTable = ({
  columns,
  data = [],
  onDelete,
  onEdit,
  customActions,
  deleteConfirmMessage = (item) => `Are you sure you want to delete ${item.name}?`,
  isLoading = false,
}) => {

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  
 
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10; 

  const paginatedData = Array.isArray(data) ? data.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(selectedItem);
    setOpenDialog(false);
    setSelectedItem(null);
  };

  return (
    <>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                Loading...
              </td>
            </tr>
          ) : !Array.isArray(data) || paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                No data available
              </td>
            </tr>
          ) : (
            paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render ? (
                      column.render(row[column.accessor], row)
                    ) : column.cell ? (
                      column.cell(row[column.accessor], row)
                    ) : column.actions ? (
                      <div className="actions-cell">
                        {column.actions.map((Action, actionIndex) => (
                          <Action
                            key={actionIndex}
                            row={row}
                            onEdit={onEdit}
                            onDelete={handleDeleteClick}
                          />
                        ))}
                      </div>
                    ) : (
                      String(row[column.accessor] || "")
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/*   */}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil((Array.isArray(data) ? data.length : 0) / rowsPerPage)}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/*   */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="dialog-title">
          <div className="dialog-header">
            <FaExclamationTriangle className="dialog-icon" />
            <div className="dialog-title-text">Confirm Delete</div>
          </div>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedItem && deleteConfirmMessage(selectedItem)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};


const DefaultTableActions = ({ row, onEdit, onDelete, customActions = [] }) => (
  <div className="actions-cell">
    {customActions.map((action, index) => (
      <button
        key={index}
        className={`table-action-btn ${action.className}`}
        title={action.title}
        onClick={() => action.onClick(row)}
      >
        {action.label}
      </button>
    ))}
    <button
      className="action-btn edit-icon "
      title="Edit"
      onClick={() => onEdit(row)}
    >
      <FaEdit size={16} />
    </button>
    <button
      className="action-btn delete-icon"
      title="Delete"
      onClick={() => onDelete(row)}
    >
      <FaTrashAlt size={16} />
    </button>
  </div>
);

export { DefaultTableActions };
export default DynamicTable;
