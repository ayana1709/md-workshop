import React, { useState, useEffect } from "react";
import api from "@/api";

function DateInput({
  value,
  onChange,
  className = "",
}) {
  const [displayValue, setDisplayValue] = useState("");
  const [error, setError] = useState("");
  const [format, setFormat] = useState("DD/MM/YYYY"); // fallback

  // 🔹 Load date format from settings
  useEffect(() => {
    api.get("/settings").then(res => {
      if (res.data?.date_format) {
        setFormat(res.data.date_format);
      }
    }).catch(() => {});
  }, []);

  // 🔹 Normalize ISO → display format
  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      return;
    }

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const [, y, m, d] = match;

    setDisplayValue(
      format === "DD/MM/YYYY"
        ? `${d}/${m}/${y}`
        : `${m}/${d}/${y}`
    );
    setError("");
  }, [value, format]);

  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");

    if (input.length > 2 && input.length <= 4) {
      input = `${input.slice(0, 2)}/${input.slice(2)}`;
    } else if (input.length > 4) {
      input = `${input.slice(0, 2)}/${input.slice(2, 4)}/${input.slice(4, 8)}`;
    }

    setDisplayValue(input);
    setError("");
    onChange(input);

    if (input.length === 10) {
      const parts = input.split("/").map(Number);
      let d, m, y;

      format === "DD/MM/YYYY"
        ? ([d, m, y] = parts)
        : ([m, d, y] = parts);

      if (!y || y < 1000 || y > 9999)
        return setError("Invalid year");

      if (m < 1 || m > 12)
        return setError("Invalid month");

      const lastDay = new Date(y, m, 0).getDate();
      if (d < 1 || d > lastDay)
        return setError("Invalid day");

      onChange(
        `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      );
      setError("");
    }
  };

  return (
    <div className="flex flex-col">
      <input
        type="text"
        placeholder={format}
        value={displayValue}
        onChange={handleInputChange}
        maxLength={10}
        className={`w-full border rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default DateInput;
