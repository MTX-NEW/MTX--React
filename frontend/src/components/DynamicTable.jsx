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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";

const DynamicTable = ({
  columns,
  data = [],
  onDelete,
  onEdit,
  customActions,
  deleteConfirmMessage = (item) => `Are you sure you want to delete ${item.name}?`,
  isLoading = false,
  // Server-side pagination props
  serverSidePagination = false,
  currentPage = 1,
  totalPages = 1,
  totalResults = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange
}) => {

  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);
  
  // Client-side pagination state (only used if serverSidePagination is false)
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Determine which data to display
  const displayData = serverSidePagination 
    ? data 
    : Array.isArray(data) ? data.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(selectedItem);
    setOpenDialog(false);
    setSelectedItem(null);
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    if (serverSidePagination) {
      if (onPageChange) onPageChange(value);
    } else {
      setPage(value);
    }
  };

  // Handle rows per page change
  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (serverSidePagination) {
      if (onPageSizeChange) onPageSizeChange(newPageSize);
    } else {
      setRowsPerPage(newPageSize);
      setPage(1); // Reset to first page when changing page size
    }
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
          ) : !Array.isArray(data) || displayData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                No data available
              </td>
            </tr>
          ) : (
            displayData.map((row, rowIndex) => (
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

      {/* Pagination controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        {/* Page size selector */}
        <FormControl variant="outlined" size="small" style={{ minWidth: 120 }}>
          <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
          <Select
            labelId="rows-per-page-label"
            value={serverSidePagination ? pageSize : rowsPerPage}
            onChange={handlePageSizeChange}
            label="Rows per page"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        
        {/* Pagination */}
        <Box display="flex" alignItems="center">
          <Typography variant="body2" color="textSecondary" mr={2}>
            {serverSidePagination 
              ? `Showing ${data.length ? (currentPage - 1) * pageSize + 1 : 0} - ${Math.min(currentPage * pageSize, totalResults)} of ${totalResults}`
              : `Showing ${data.length ? (page - 1) * rowsPerPage + 1 : 0} - ${Math.min(page * rowsPerPage, data.length)} of ${data.length}`
            }
          </Typography>
          <Pagination
            count={serverSidePagination 
              ? totalPages 
              : Math.ceil((Array.isArray(data) ? data.length : 0) / rowsPerPage)}
            page={serverSidePagination ? currentPage : page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      </Box>

      {/* Delete confirmation dialog */}
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
