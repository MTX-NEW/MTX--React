import React, { useState, useEffect } from 'react';
import { programApi } from '@/api/baseApi';
import { FormControl, Select, MenuItem, InputLabel, CircularProgress, Paper } from '@mui/material';

// Presenter component
export const ProgramPresenter = ({ 
  programs, 
  selectedProgram, 
  isLoading, 
  selectedMember, 
  onProgramChange 
}) => {
  return (
    <>
      <div className="trip-section-header">
        <h5 className="trip-section-title">Program</h5>
      </div>
      
      <div className="trip-section-body">
        {isLoading ? (
          <div className="text-center py-2">
            <CircularProgress size={20} />
          </div>
        ) : (
          <div className="d-flex flex-column justify-content-center h-100">
            {/* Program dropdown - always visible and selectable */}
            <FormControl size="small" variant="outlined" className="mb-2">
              <InputLabel id="program-select-label">Select Program</InputLabel>
              <Select
                labelId="program-select-label"
                id="program-select"
                value={selectedProgram ? selectedProgram.program_id : ''}
                label="Select Program"
                onChange={onProgramChange}
              >
                {programs.map(program => (
                  <MenuItem 
                    key={program.program_id} 
                    value={program.program_id}
                  >
                    {program.program_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Display selected program details if available - in a more compact way */}
            {selectedProgram && (
              <Paper elevation={0} className="p-2 border rounded bg-light">
                <div className="fw-bold text-primary small">{selectedProgram.program_name}</div>
                {selectedProgram.company_name && (
                  <div className="text-muted small">Company: {selectedProgram.company_name}</div>
                )}
              </Paper>
            )}
            
            {!selectedProgram && (
              <div className="text-center text-muted small">
                Select a program
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Container component
const ProgramCard = ({ selectedMember, selectedProgram, onProgramSelect }) => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const response = await programApi.getAll();
        setPrograms(response.data || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);
  
  // Auto-select member's program if available
  useEffect(() => {
    if (selectedMember && !selectedProgram && programs.length > 0) {
      // If member has a program_id, find it
      if (selectedMember.program_id) {
        const memberProgram = programs.find(
          program => program.program_id === selectedMember.program_id
        );
        
        if (memberProgram) {
          onProgramSelect(memberProgram);
        }
      }
    }
  }, [selectedMember, selectedProgram, programs, onProgramSelect]);
  
  const handleProgramChange = (event) => {
    const selectedId = event.target.value;
    const program = programs.find(p => p.program_id === selectedId);
    if (program) {
      onProgramSelect(program);
    }
  };
  
  return (
    <ProgramPresenter
      programs={programs}
      selectedProgram={selectedProgram}
      isLoading={isLoading}
      selectedMember={selectedMember}
      onProgramChange={handleProgramChange}
    />
  );
};

export default ProgramCard; 