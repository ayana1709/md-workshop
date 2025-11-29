import React, { useEffect, useState } from "react";
import api from "@/api";
import DateInput from "@/components/DateInput"; // import reusable date input
import { useStores } from "@/contexts/storeContext";

function ProformaFooter({ formData, setFormData }) {
  const [errors, setErrors] = useState({});
  const { companyData } = useStores();

  // Auto-set today's date + ref number on mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: prev.date || new Date().toISOString().split("T")[0],
      refNum:
        prev.refNum || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // const validateField = (name, value) => {
  //   if (
  //     ["validityDate", "deliveryDate", "preparedBy"].includes(name) &&
  //     !value
  //   ) {
  //     setErrors((prev) => ({ ...prev, [name]: "This field is required" }));
  //   }
  // };

  const renderInput = (label, amLabel, name, placeholder, type = "text") => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} / <span className="text-blue-600">{amLabel}</span>
      </label>

      {/* Swap only the date fields with DateInput */}
      {type === "date" ? (
        <DateInput
          value={formData[name] || ""}
          onChange={(val) => handleChange({ target: { name, value: val } })}
          placeholder={companyData?.date_format || "DD/MM/YYYY"} // ✅ match format
          format={companyData?.date_format || "DD/MM/YYYY"} // ✅ set format
          className={`bg-white dark:bg-gray-800 border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:outline-none transition-all duration-200
    ${
      errors[name]
        ? "border-red-500 focus:ring-red-400"
        : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
    }
  `}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          onBlur={(e) => validateField(name, e.target.value)}
          placeholder={placeholder}
          className={`bg-white dark:bg-gray-800 border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:outline-none transition-all duration-200
            ${
              errors[name]
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
            }
          `}
        />
      )}

      {errors[name] && (
        <span className="text-xs text-red-500">{errors[name]}</span>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderInput(
          "Validity Date",
          "የሚሰራበት ቀን",
          "validityDate",
          "e.g. 30 days"
        )}
        {renderInput("Delivery Date", "የመስጠት ቀን", "deliveryDate", "", "date")}
        {renderInput(
          "Prepared By",
          "የአዘጋጀው",
          "preparedBy",
          "Enter Preparer Name"
        )}
        {renderInput("Payment Before", "ቅድመ ክፍያ", "paymentBefore", "0:00")}
        {renderInput("Notes", "ማስታወሻ", "notes", "Any notes")}
        {/* {renderInput("Signature", "ፊርማ", "signature", "Enter Signature")} */}
      </div>
    </div>
  );
}

export default ProformaFooter;
