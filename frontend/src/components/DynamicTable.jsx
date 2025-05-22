// components/DynamicTable/DynamicTable.jsx
import React, { useMemo, memo } from "react";
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

// Memoized table row component to prevent unnecessary re-renders
const TableRow = memo(({ row, columns, onEdit, handleDeleteClick }) => {
  return (
    <tr>
      {columns.map((column, colIndex) => (
        <td key={`${row.id || row.location_id || row._id}-col-${colIndex}`} className="table-cell">
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
  );
});

// Memoized table body component
const TableBody = memo(({ 
  isLoading, 
  columns, 
  data, 
  displayData, 
  onEdit, 
  handleDeleteClick 
}) => {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={columns.length} className="text-center py-4 table-cell">
          Loading...
        </td>
      </tr>
    );
  }
  
  if (!Array.isArray(data) || displayData.length === 0) {
    return (
      <tr>
        <td colSpan={columns.length} className="text-center py-4 table-cell">
          No data available
        </td>
      </tr>
    );
  }
  
  return displayData.map((row) => (
    <TableRow
      key={row.id || row.location_id || row._id || JSON.stringify(row)}
      row={row}
      columns={columns}
      onEdit={onEdit}
      handleDeleteClick={handleDeleteClick}
    />
  ));
});

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

  // Memoize the data to display to prevent unnecessary calculations
  const displayData = useMemo(() => {
    if (serverSidePagination) {
      return data;
    }
    return Array.isArray(data) 
      ? data.slice((page - 1) * rowsPerPage, page * rowsPerPage) 
      : [];
  }, [data, page, rowsPerPage, serverSidePagination]);

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

  // Memoize pagination info to prevent unnecessary recalculations
  const paginationInfo = useMemo(() => {
    if (serverSidePagination) {
      return {
        showing: data.length ? (currentPage - 1) * pageSize + 1 : 0,
        to: Math.min(currentPage * pageSize, totalResults),
        total: totalResults,
        count: totalPages
      };
    } else {
      return {
        showing: data.length ? (page - 1) * rowsPerPage + 1 : 0,
        to: Math.min(page * rowsPerPage, data.length),
        total: data.length,
        count: Math.ceil((Array.isArray(data) ? data.length : 0) / rowsPerPage)
      };
    }
  }, [
    serverSidePagination, data.length, currentPage, pageSize, totalResults, 
    totalPages, page, rowsPerPage
  ]);

  const tableStyles = {
    borderCollapse: 'collapse',
    width: '100%'
  };

  return (
    <>
      <table className="table" style={tableStyles}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={`header-${index}`} className="table-header">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <TableBody
            isLoading={isLoading}
            columns={columns}
            data={data}
            displayData={displayData}
            onEdit={onEdit}
            handleDeleteClick={handleDeleteClick}
          />
        </tbody>
        <style jsx="true">{`
          .table {
            border-collapse: collapse;
            width: 100%;
          }
          .table th, .table td {
            border: 0.8px solid #ddd;
            padding: 8px;
          }
          .table-header {
            background-color: #f2f2f2;
            border: 1px solid #ddd;
          }
          .table-cell {
            border: 0.8px solid #ddd;
          }
        `}</style>
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
            {`Showing ${paginationInfo.showing} - ${paginationInfo.to} of ${paginationInfo.total}`}
          </Typography>
          <Pagination
            count={paginationInfo.count}
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

// Memoize the DefaultTableActions component
const DefaultTableActions = memo(({ row, onEdit, onDelete, customActions = [] }) => (
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
));

export { DefaultTableActions };
export default DynamicTable;
