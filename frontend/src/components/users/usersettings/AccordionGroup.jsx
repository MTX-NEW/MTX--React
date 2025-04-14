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

const AccordionGroup = ({ 
  title, 
  options, 
  selectedOptions = [], 
  onSave 
}) => {
  const [selected, setSelected] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Update selected options when props change
  useEffect(() => {
    const validSelectedOptions = selectedOptions.filter(id => {
      const option = options.find(opt => opt.id === id);
      return option && !option.disabled;
    });
    setSelected(validSelectedOptions);
    setHasChanges(false);
  }, [selectedOptions, options]);

  const handleSelectOption = (optionId) => {
    const option = options.find(opt => opt.id === optionId);
    if (option?.disabled) return;

    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    
    setSelected(newSelected);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(selected);
    setHasChanges(false);
  };

  const activeOptions = options.filter(opt => !opt.disabled);
  const isAllSelected = activeOptions.length > 0 && 
    activeOptions.every(opt => selected.includes(opt.id));
  const isIndeterminate = selected.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(activeOptions.map(option => option.id));
    }
    setHasChanges(true);
  };

  return (
    <Accordion className="accordion">
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title}-content`}
        id={`${title}-header`}
        className="accordion-summary"
      >
        <Typography className="accordion-title">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails className="accordion-details">
        <div className="select-all">
          <FormControlLabel
            control={
              <Checkbox
                checked={isAllSelected}
                onChange={handleSelectAll}
                indeterminate={isIndeterminate}
                className="checkbox"
              />
            }
            label="Select All"
          />
        </div>

        <div className="options-grid">
          {options.map((option) => (
            <FormControlLabel
              key={option.id}
              control={
                <Checkbox
                  checked={selected.includes(option.id)}
                  onChange={() => handleSelectOption(option.id)}
                  disabled={option.disabled}
                  className={`checkbox ${option.disabled ? 'checkbox-disabled' : ''}`}
                />
              }
              label={
                <span className={option.disabled ? 'text-disabled' : ''}>
                  {option.label}
                  {option.disabled && <span className="accordion-status-badge status-badge inactive ml-2">(Inactive)</span>}
                </span>
              }
            />
          ))}
        </div>

        {hasChanges && (
          <div className="save-button-container">
            <Button
              variant="contained"
              className="save-button"
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

AccordionGroup.propTypes = {
  title: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    status: PropTypes.string
  })).isRequired,
  selectedOptions: PropTypes.arrayOf(PropTypes.number),
  onSave: PropTypes.func.isRequired,
};

export default AccordionGroup;
