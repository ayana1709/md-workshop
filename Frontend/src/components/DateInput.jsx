import React, { useState, useEffect } from "react";

function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className = "",
  format = "DD/MM/YYYY", // new prop for format
}) {
  const [displayValue, setDisplayValue] = useState("");
  const [error, setError] = useState("");

  // Normalize incoming value → display according to format
  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      return;
    }

    // Matches full ISO timestamp: YYYY-MM-DDTHH:mm:ss.000Z
    const timestampMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (timestampMatch) {
      const [, year, month, day] = timestampMatch;
      if (format === "DD/MM/YYYY") {
        setDisplayValue(`${day}/${month}/${year}`);
      } else {
        setDisplayValue(`${month}/${day}/${year}`);
      }
      setError("");
    } else {
      setDisplayValue(value);
    }
  }, [value, format]);

  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // digits only

    // Auto-format depending on format
    if (input.length > 2 && input.length <= 4) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    } else if (input.length > 4) {
      input = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4, 8)}`;
    }

    setDisplayValue(input);
    setError("");
    onChange(input);

    if (input.length === 10) {
      let d, m, y;
      const parts = input.split("/").map(Number);

      if (format === "DD/MM/YYYY") {
        [d, m, y] = parts;
      } else {
        [m, d, y] = parts;
      }

      // Validate numbers
      if (isNaN(d) || isNaN(m) || isNaN(y)) {
        setError("Please enter valid numbers.");
        return;
      }

      if (y < 1000 || y > 9999) {
        setError("Year must be 4 digits.");
        return;
      }

      if (m < 1 || m > 12) {
        setError("Invalid month.");
        return;
      }

      const lastDay = new Date(y, m, 0).getDate();
      if (d < 1 || d > lastDay) {
        setError("Invalid day for that month.");
        return;
      }

      // Return clean ISO format YYYY-MM-DD
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
        className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className} ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={displayValue}
        onChange={handleInputChange}
        maxLength={10}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default DateInput;
