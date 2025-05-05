import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import TextField from '@mui/material/TextField';
import './SpecialInstructionsCard.css';

const SpecialInstructionsCard = ({
  mobilityType = 'Ambulatory',
  clientRequirements = [],
  vehicleType = [],
  onMobilityTypeChange,
  onClientRequirementsChange,
  onVehicleTypeChange,
  notes = '',
  onNotesChange
}) => {
  // Initialize form with react-hook-form
  const { control, watch, setValue } = useForm({
    defaultValues: {
      mobilityType,
      clientRequirements,
      vehicleType,
      notes
    }
  });

  // Watch values for UI updates
  const watchedMobilityType = watch('mobilityType');
  const watchedClientRequirements = watch('clientRequirements');
  const watchedVehicleType = watch('vehicleType');
  
  // Helper function to handle checkbox toggles
  const handleRequirementToggle = (requirementValue) => {
    const current = [...watchedClientRequirements];
    const exists = current.some(req => 
      req.value === requirementValue || req === requirementValue
    );
    
    let updated;
    if (exists) {
      updated = current.filter(req => 
        req.value !== requirementValue && req !== requirementValue
      );
    } else {
      updated = [...current, { value: requirementValue }];
    }
    
    setValue('clientRequirements', updated);
    if (onClientRequirementsChange) onClientRequirementsChange(updated);
  };
  
  // Helper function for vehicle type toggles
  const handleVehicleToggle = (typeValue) => {
    const current = [...watchedVehicleType];
    const exists = current.some(type => 
      type.value === typeValue || type === typeValue
    );
    
    let updated;
    if (exists) {
      updated = current.filter(type => 
        type.value !== typeValue && type !== typeValue
      );
    } else {
      updated = [...current, { value: typeValue }];
    }
    
    setValue('vehicleType', updated);
    if (onVehicleTypeChange) onVehicleTypeChange(updated);
  };
  
  // Check if requirement is selected
  const isRequirementSelected = (value) => {
    return watchedClientRequirements.some(req => 
      req.value === value || req === value
    );
  };
  
  // Check if vehicle type is selected
  const isVehicleSelected = (value) => {
    return watchedVehicleType.some(type => 
      type.value === value || type === value
    );
  };

  return (
    <>
      <div className="trip-section-header">
        <h5 className="trip-section-title">Special Instructions</h5>
      </div>
      
      <div className="trip-section-body">
        {/* Mobility Type */}
        <div className="mb-2">
          <FormControl component="fieldset" size="small">
            <FormLabel component="legend" className="fw-medium">Mobility Type</FormLabel>
            <Controller
              name="mobilityType"
              control={control}
              render={({ field }) => (
                <RadioGroup 
                  {...field}
                  row
                  onChange={(e) => {
                    field.onChange(e);
                    if (onMobilityTypeChange) onMobilityTypeChange(e.target.value);
                  }}
                >
                  <FormControlLabel value="Ambulatory" control={<Radio size="small" />} label="Ambulatory" />
                  <FormControlLabel value="Wheelchair" control={<Radio size="small" />} label="Wheelchair" />
                </RadioGroup>
              )}
            />
          </FormControl>
        </div>
        
        {/* Client Requirements */}
        <div className="mb-2">
          <FormControl component="fieldset" size="small" fullWidth>
            <FormLabel component="legend" className="fw-medium">Client Requirements</FormLabel>
            <div className="requirements-grid">
              {[
                { value: 'rides_alone', label: 'Rides Alone' },
                { value: 'spanish_speaking', label: 'Spanish Speaking' },
                { value: 'males_only', label: 'Males Only' },
                { value: 'females_only', label: 'Females Only' },
                { value: 'special_assist', label: 'Special Assistance' },
                { value: 'pickup_time_exact', label: 'Exact Pickup Time' },
                { value: 'stay_with_client', label: 'Stay With Client' },
                { value: 'car_seat', label: 'Car Seat' },
                { value: 'extra_person', label: 'Extra Person' },
                { value: 'call_first', label: 'Call First' },
                { value: 'knock', label: 'Knock' }
              ].map((option) => (
                <FormControlLabel
                  key={option.value}
                  className="requirement-item"
                  control={
                    <Checkbox 
                      size="small"
                      checked={isRequirementSelected(option.value)}
                      onChange={() => handleRequirementToggle(option.value)}
                      name={option.value}
                    />
                  }
                  label={option.label}
                />
              ))}
            </div>
          </FormControl>
        </div>
        
        {/* Vehicle Type */}
        <div className="mb-2">
          <FormControl component="fieldset" size="small">
            <FormLabel component="legend" className="fw-medium">Vehicle Type</FormLabel>
            <FormGroup row>
              {[
                { value: 'van', label: 'Van' },
                { value: 'sedan', label: 'Sedan' }
              ].map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox 
                      size="small"
                      checked={isVehicleSelected(option.value)}
                      onChange={() => handleVehicleToggle(option.value)}
                      name={option.value}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </div>
        
        {/* Additional Notes */}
        <div>
          <TextField
            label="Additional Information"
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            size="small"
            value={watch('notes')}
            onChange={(e) => {
              setValue('notes', e.target.value);
              if (onNotesChange) onNotesChange(e.target.value);
            }}
            placeholder="Enter any special instructions or additional information for this trip..."
          />
        </div>
      </div>
    </>
  );
};

export default SpecialInstructionsCard; 