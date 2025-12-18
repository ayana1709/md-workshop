import React, { useState, useEffect, useRef } from 'react';
import api from '@/api';

const PartNumberSearch = ({ value, onSelect, placeholder = "Search part number..." }) => {
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
        params: { q: query, limit: 10 }
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
    setSearchTerm(item.part_number);
    setShowDropdown(false);
    setResults([]);
    onSelect(item);
  };

  const handleFocus = () => {
    if (searchTerm.length >= 2) {
      setShowDropdown(true);
      if (results.length === 0) {
        searchItems(searchTerm);
      }
    }
  };

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!inputRef.current) return {};
    
    const rect = inputRef.current.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY + 5,
      minWidth: rect.width
    };
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
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
          {loading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dropdown with fixed positioning */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="fixed z-[99999] bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto"
          style={{
            ...getDropdownPosition(),
            zIndex: 99999
          }}
        >
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-1">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchTerm.length < 2 ? 'Type at least 2 characters' : 'No matching part numbers found'}
            </div>
          ) : (
            <div className="py-1 min-w-[300px]">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-medium text-gray-600">
                  Select a part number:
                </p>
              </div>
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm flex items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded mr-2">
                          Part
                        </span>
                        {item.part_number || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{item.item_name}</div>
                    </div>
                    <div className="text-right text-xs ml-2">
                      <div className="text-gray-900 font-medium">${parseFloat(item.selling_price || 0).toFixed(2)}</div>
                      <div className={`text-xs ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Stock: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex space-x-3">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {item.brand || 'No brand'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {item.unit || 'No unit'}
                    </span>
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

export default PartNumberSearch;