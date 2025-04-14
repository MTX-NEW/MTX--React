import React, { useState } from "react";

const UserActions = ({ 
  onSearch, 
  onAdd, 
  addButtonText = "Add New User",
  secondaryButtonText,
  onSecondaryAdd 
}) => {
  const [query, setQuery] = useState("");

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
            className="add-user-btn secondary-btn" 
            onClick={onSecondaryAdd}
            style={{ marginLeft: '8px' }}
          >
            {secondaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserActions;
