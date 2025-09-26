import React, { useState, useEffect } from "react";

function DateInput({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState("");
  const [error, setError] = useState("");

  // Convert ISO → DD/MM/YYYY when value comes from parent
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-");
      setDisplayValue(`${day}/${month}/${year}`);
      setError("");
    } else {
      setDisplayValue(value || "");
    }
  }, [value]);

  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // keep only digits

    // Auto-insert slashes live → DD/MM/YYYY
    if (input.length > 2 && input.length <= 4) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    } else if (input.length > 4) {
      input = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4, 8)}`;
    }

    setDisplayValue(input);
    setError("");

    // Validation
    const parts = input.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;

      if (day?.length === 2 && month?.length === 2 && year?.length === 4) {
        const d = new Date(`${year}-${month}-${day}`);

        if (
          d &&
          d.getFullYear() === parseInt(year) &&
          d.getMonth() + 1 === parseInt(month) &&
          d.getDate() === parseInt(day)
        ) {
          // ✅ pad values for ISO format
          const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}`;
          onChange(iso);
          setError("");
          return;
        } else {
          setError("The date field must be a valid date.");
        }
      }
    }

    // Still send raw input if not valid yet
    onChange(input);
  };

  return (
    <div>
      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        maxLength={10} // "DD/MM/YYYY" length
        className={`w-full border rounded px-2 py-1 ${className} ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default DateInput;
