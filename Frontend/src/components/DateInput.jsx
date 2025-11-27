import React, { useState, useEffect } from "react";

function DateInput({
  value,
  onChange,
  placeholder = "MM/DD/YYYY",
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState("");
  const [error, setError] = useState("");

  // Convert ISO (YYYY-MM-DD) → MM/DD/YYYY for display
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      setDisplayValue(`${month}/${day}/${year}`);
      setError("");
    } else {
      setDisplayValue(value || "");
    }
  }, [value]);

  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // Keep digits only

    // Auto-format as MM/DD/YYYY
    if (input.length > 2 && input.length <= 4) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    } else if (input.length > 4) {
      input = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4, 8)}`;
    }

    setDisplayValue(input);
    setError(""); // Clear error while typing
    onChange(input); // Update parent even during typing

    // Only validate when full format (10 chars) is entered
    if (input.length === 10) {
      const [m, d, y] = input.split("/").map((p) => parseInt(p, 10));

      // --- Step 1: Basic format checks ---
      if (isNaN(m) || isNaN(d) || isNaN(y)) {
        setError("Please enter numbers only.");
        return;
      }

      if (y < 1000 || y > 9999) {
        setError("Year must be 4 digits (e.g., 2025).");
        return;
      }

      if (m < 1 || m > 12) {
        setError("Month must be between 1 and 12.");
        return;
      }

      if (d < 1 || d > 31) {
        setError("Day must be between 1 and 31.");
        return;
      }

      // --- Step 2: Cross-browser valid date check ---
      const date = new Date(y, m - 1, d);
      if (
        date.getFullYear() !== y ||
        date.getMonth() + 1 !== m ||
        date.getDate() !== d
      ) {
        setError("That date doesn't exist (e.g., February 30).");
        return;
      }

      // --- Step 3: If valid, send ISO date ---
      const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`;
      onChange(iso);
      setError("");
    }
  };

  return (
    <div className="flex flex-col">
      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        maxLength={10} // MM/DD/YYYY
        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className} ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default DateInput;
