import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TextField, CircularProgress, IconButton } from '@mui/material';
import { FaSearch, FaPencilAlt, FaPlus } from 'react-icons/fa';
import useMemberManagement from '../../../hooks/useMemberManagement';
import './MemberCard.css';

// Presenter component (pure UI)
export const MemberCardPresenter = ({ 
  selectedMember, 
  filteredMembers,
  showMembersList,
  searchQuery,
  isLoading,
  onMemberSelect,
  onSearchChange,
  onSearchFocus,
  onEditMember,
  onAddMember
}) => {
  return (
    <>
      <div className="trip-section-header">
        <h5 className="trip-section-title">Member</h5>
        <div className="d-flex">
          <div className="member-search-container me-2 position-relative">
            <TextField
              value={searchQuery}
              size="small"
              placeholder="Search members..."
              variant="outlined"
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              InputProps={{
                startAdornment: (
                  <FaSearch className="text-muted me-2" />
                ),
                endAdornment: isLoading && (
                  <CircularProgress size={20} color="inherit" />
                )
              }}
              style={{ width: '180px' }}
            />
            
            {/* Search results dropdown */}
            {showMembersList && (
              <div className="dropdown-menu-position position-absolute start-0 mt-1 shadow rounded">
                {filteredMembers.length > 0 ? (
                  <div className="bg-white rounded border overflow-hidden" style={{ width: '250px', maxHeight: '250px', overflowY: 'auto', zIndex: 1000 }}>
                    {filteredMembers.map((member) => (
                      <div
                        key={member.member_id}
                        className="dropdown-item p-2 cursor-pointer border-bottom"
                        onClick={() => onMemberSelect(member)}
                      >
                        <span className="fw-medium">{member.first_name} {member.last_name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded border p-3 text-center" style={{ width: '250px', zIndex: 1000 }}>
                    <p className="mb-0 text-muted">No members found</p>
                    <button 
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={onAddMember}
                    >
                      Add New Member
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="action-buttons">
            {selectedMember && (
              <IconButton 
                color="primary" 
                size="small" 
                onClick={() => onEditMember(selectedMember)}
                title="Edit Member"
                className="me-1"
              >
                <FaPencilAlt />
              </IconButton>
            )}
            <IconButton 
              color="primary" 
              size="small" 
              onClick={onAddMember}
              title="Add Member"
            >
              <FaPlus />
            </IconButton>
          </div>
        </div>
      </div>
      
      <div className="trip-section-body">
        {/* Member details */}
        {selectedMember ? (
          <div className="selected-location">
            <div className="member-info">
              <h6 className="mb-1">{selectedMember.first_name} {selectedMember.last_name}</h6>
              
              <div className="member-details">
                {selectedMember.birth_date && (
                  <p className="mb-1 small text-muted">
                    <strong>DOB:</strong> {selectedMember.birth_date}
                  </p>
                )}
                
                {selectedMember.ahcccs_id && (
                  <p className="mb-1 small text-muted">
                    <strong>AHCCCS ID:</strong> {selectedMember.ahcccs_id}
                  </p>
                )}
                
                {selectedMember.phone && (
                  <p className="mb-1 small text-muted">
                    <strong>Phone:</strong> {selectedMember.phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-3">
            <p className="text-muted">Search for a member or add a new one</p>
            <button 
              className="btn btn-outline-primary btn-sm mt-2"
              onClick={onAddMember}
            >
              Add New Member
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Container component (handles logic)
const MemberCard = ({ selectedMember, onMemberSelect }) => {
  // Get form control
  const { watch, setValue } = useForm({
    defaultValues: {
      searchQuery: '',
      showMembersList: false
    }
  });
  
  // Get values from form
  const searchQuery = watch('searchQuery');
  const showMembersList = watch('showMembersList');
  
  // Use the member management hook
  const {
    members,
    isLoading,
    handleAddMember,
    handleEditMember,
    handleSearchChange
  } = useMemberManagement();
  
  // Filter members based on search query
  const getFilteredMembers = () => {
    if (!members || !searchQuery) return [];
    
    return members.filter(member => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });
  };
  
  const filteredMembers = getFilteredMembers();
  
  // Handle search field changes
  const handleSearchInputChange = (value) => {
    setValue('searchQuery', value);
    handleSearchChange(value);
    
    if (value.length > 0) {
      setValue('showMembersList', true);
    } else {
      setValue('showMembersList', false);
    }
  };
  
  // Handle member selection
  const handleMemberSelect = (member) => {
    if (onMemberSelect) onMemberSelect(member);
    setValue('searchQuery', '');
    setValue('showMembersList', false);
  };
  
  // Handle focus on the search input
  const handleSearchFocus = () => {
    if (searchQuery.length > 0) {
      setValue('showMembersList', true);
    }
  };

  return (
    <MemberCardPresenter
      selectedMember={selectedMember}
      filteredMembers={filteredMembers}
      showMembersList={showMembersList}
      searchQuery={searchQuery}
      isLoading={isLoading}
      onMemberSelect={handleMemberSelect}
      onSearchChange={handleSearchInputChange}
      onSearchFocus={handleSearchFocus}
      onEditMember={handleEditMember}
      onAddMember={handleAddMember}
    />
  );
};

export default MemberCard; 