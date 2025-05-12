import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const PagesAccordionGroup = ({ 
  title, 
  options, 
  permissions = [], 
  onSave 
}) => {
  // State to track both view and edit permissions
  const [permissionState, setPermissionState] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Get page ID from the first permission item (all have same page_id)
  const pageId = permissions.length > 0 ? permissions[0].page_id : 'unknown';

  // Update permissions when props change
  useEffect(() => {
    // Only update state if the permissions have actually changed
    // Compare props directly to prevent infinite loop
    if (JSON.stringify(permissions) !== JSON.stringify(permissionState)) {
      setPermissionState(permissions);
      setHasChanges(false);
    }
  }, [permissions]); // Remove permissionState from dependencies

  // Toggle view permission for a user type
  const handleToggleView = (typeId) => {
    const option = options.find(opt => opt.id === typeId);
    if (option?.disabled) return;

    setPermissionState(prev => {
      const newState = [...prev];
      // Find if this type already has permissions
      const existingPermIndex = newState.findIndex(p => p.type_id === typeId);
      
      if (existingPermIndex >= 0) {
        // Toggle existing permission - convert to number for consistency
        const currentValue = newState[existingPermIndex].can_view;
        newState[existingPermIndex] = {
          ...newState[existingPermIndex],
          can_view: currentValue === 1 || currentValue === true ? 0 : 1
        };
      } else {
        // Create new permission
        newState.push({
          page_id: pageId,
          type_id: typeId,
          can_view: 1,
          can_edit: 0
        });
      }
      return newState;
    });
    
    setHasChanges(true);
  };

  // Toggle edit permission for a user type
  const handleToggleEdit = (typeId) => {
    const option = options.find(opt => opt.id === typeId);
    if (option?.disabled) return;

    setPermissionState(prev => {
      const newState = [...prev];
      // Find if this type already has permissions
      const existingPermIndex = newState.findIndex(p => p.type_id === typeId);
      
      if (existingPermIndex >= 0) {
        // Toggle existing permission - convert to number for consistency
        const currentValue = newState[existingPermIndex].can_edit;
        newState[existingPermIndex] = {
          ...newState[existingPermIndex],
          can_edit: currentValue === 1 || currentValue === true ? 0 : 1
        };
      } else {
        // Create new permission
        newState.push({
          page_id: pageId,
          type_id: typeId,
          can_view: 0,
          can_edit: 1
        });
      }
      return newState;
    });
    
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(permissionState);
    setHasChanges(false);
  };

  // Helper to check if type has view permission
  const hasViewPermission = (typeId) => {
    const perm = permissionState.find(p => p.type_id === typeId);
    return perm ? perm.can_view === 1 || perm.can_view === true : false;
  };

  // Helper to check if type has edit permission
  const hasEditPermission = (typeId) => {
    const perm = permissionState.find(p => p.type_id === typeId);
    return perm ? perm.can_edit === 1 || perm.can_edit === true : false;
  };

  return (
    <Accordion className="accordion">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title}-content-${pageId}`}
        id={`${title}-header-${pageId}`}
        className="accordion-summary"
      >
        <Typography className="accordion-title">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails className="accordion-details">
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>User Type</TableCell>
                <TableCell align="center">View Access</TableCell>
                <TableCell align="center">Edit Access</TableCell>
                <TableCell align="center">Permission ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {options.map((option) => {
                const currentPerm = permissionState.find(p => p.type_id === option.id);
                return (
                  <TableRow key={`${pageId}-${option.id}`} sx={{ opacity: option.disabled ? 0.6 : 1 }}>
                    <TableCell component="th" scope="row">
                      {option.label}
                      {option.disabled && <span className="ml-2 text-gray-500">(Inactive)</span>}
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        id={`view-permission-${pageId}-${option.id}`}
                        name={`view-permission-${pageId}-${option.id}`}
                        checked={hasViewPermission(option.id)}
                        onChange={() => handleToggleView(option.id)}
                        disabled={option.disabled}
                        inputProps={{
                          'aria-label': `Toggle view access for ${option.label} on page ${pageId}`
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        id={`edit-permission-${pageId}-${option.id}`}
                        name={`edit-permission-${pageId}-${option.id}`}
                        checked={hasEditPermission(option.id)}
                        onChange={() => handleToggleEdit(option.id)}
                        disabled={option.disabled}
                        inputProps={{
                          'aria-label': `Toggle edit access for ${option.label} on page ${pageId}`
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {currentPerm?.permission_id ? 
                        <span className="text-xs text-gray-500">{currentPerm.permission_id}</span> : 
                        <span className="text-xs text-gray-500">-</span>
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {hasChanges && (
          <div className="save-button-container mt-3">
            <Button
              variant="contained"
              className="save-button"
              color="primary"
              onClick={handleSave}
            >
              Save Permissions
            </Button>
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

PagesAccordionGroup.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    status: PropTypes.string
  })).isRequired,
  permissions: PropTypes.arrayOf(PropTypes.shape({
    permission_id: PropTypes.number,
    page_id: PropTypes.number,
    type_id: PropTypes.number.isRequired,
    can_view: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
    can_edit: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired
  })),
  onSave: PropTypes.func.isRequired,
};

export default PagesAccordionGroup;
