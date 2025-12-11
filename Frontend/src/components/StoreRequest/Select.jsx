// src/components/FormElements/Select.jsx

import React from "react";

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  className = "",
  disabled = false, // Added disabled support
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${
        disabled ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""
      } ${error ? "border-red-500" : "border-gray-300"}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
  </div>
);

export default Select;