import React, { useState, useEffect } from "react";

const UserActions = ({ 
  onSearch, 
  onAdd, 
  addButtonText = "Add New User",
  secondaryButtonText,
  onSecondaryAdd,
  secondaryButtonDisabled = false,
  searchQuery = ""
}) => {
  const [query, setQuery] = useState(searchQuery);

  // Sync with external searchQuery when it changes
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="actions">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={query}
          onChange={handleSearchChange}
        />
      </div>
      <div className="action-buttons">
        <button className="add-user-btn" onClick={onAdd}>
          {addButtonText}
        </button>
        {secondaryButtonText && (
          <button 
            className={`add-user-btn ${secondaryButtonDisabled ? 'disabled' : 'secondary-btn'}`} 
            onClick={onSecondaryAdd}
            disabled={secondaryButtonDisabled}
            style={{ 
              marginLeft: '8px',
              opacity: secondaryButtonDisabled ? 0.6 : 1,
              cursor: secondaryButtonDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            {secondaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserActions;
