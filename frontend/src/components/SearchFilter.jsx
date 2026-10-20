import React from 'react';
import { Search } from 'lucide-react';

export const SearchFilter = ({
  search,
  onSearchChange,
  placeholder = 'Search...',
  children,
}) => {
  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="filter-group">{children}</div>
    </div>
  );
};

export default SearchFilter;
