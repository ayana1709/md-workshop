// src/components/StoreIssue/TextArea.js

import React from 'react';

const TextArea = ({ label, name, value, onChange, error, rows = 3, placeholder = "" }) => {
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      {/* Textarea */}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''}`}
      ></textarea>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error[0]}
        </p>
      )}
    </div>
  );
};

export default TextArea;
