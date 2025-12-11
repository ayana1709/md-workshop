// src/components/FormElements/Input.jsx

import React from "react";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder = "",
  className = "",
  readOnly = false, // Added readOnly support
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white ${
        readOnly ? "bg-gray-100 dark:bg-gray-700 cursor-default" : ""
      } ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error[0]}</p>}
  </div>
);

export default Input;