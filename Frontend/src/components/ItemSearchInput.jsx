import React, { useState, useEffect, useRef } from 'react';
import api from '@/api';

const ItemSearchInput = ({ value, onChange, onItemSelect, disabled }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce timer
  const debounceTimer = useRef(null);

  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  const searchItems = async (query) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/items/autocomplete', {
        params: { q: query, limit: 8 }
      });
      
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onChange(value);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (value.length >= 2) {
      setShowDropdown(true);
      // Set new debounce timer
      debounceTimer.current = setTimeout(() => {
        searchItems(value);
      }, 300);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    setSearchTerm(item.item_name);
    setShowDropdown(false);
    setResults([]);
    onItemSelect(item);
  };

  const handleFocus = () => {
    if (searchTerm.length >= 2) {
      setShowDropdown(true);
      if (results.length === 0) {
        searchItems(searchTerm);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="w-full" ref={inputRef}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search item name..."
          disabled={disabled}
          className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        />
      </div>
      
      {/* Dropdown positioned absolutely */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed z-[9999] min-w-[350px] bg-white border border-gray-300 rounded-md shadow-lg max-h-72 overflow-y-auto"
          style={{
            // Position near the input field
            left: inputRef.current?.getBoundingClientRect().left || 0,
            top: (inputRef.current?.getBoundingClientRect().bottom || 0) + 5,
          }}
        >
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Searching items...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchTerm.length < 2 ? 'Type at least 2 characters' : 'No items found'}
            </div>
          ) : (
            <div className="py-1">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600">
                  Found {results.length} item{results.length !== 1 ? 's' : ''}
                </p>
              </div>
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="px-3 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 text-sm">
                    {item.item_name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Part: {item.part_number} | Brand: {item.brand}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>Unit: {item.unit}</span>
                    <span>Stock: {item.quantity}</span>
                    <span className="font-medium">${parseFloat(item.selling_price || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ItemSearchInput;