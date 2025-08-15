import React, { useEffect, useState } from "react";
import api from "@/api";

function ProformaHeader({ formData, setFormData }) {
  const [errors, setErrors] = useState({});

  // Auto-set today's date on mount
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

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleJobIdBlur = async () => {
    if (!formData.jobId) return;

    try {
      const res = await api.get(`repairs/basic/${formData.jobId}`);
      const { customer_name, product_name, types_of_jobs } = res.data;

      setFormData((prev) => ({
        ...prev,
        customerName: customer_name,
        product_name: product_name,
        types_of_jobs: types_of_jobs,
      }));
    } catch (error) {
      console.error("Failed to fetch job info:", error);
      alert("Job ID not found. Please try again.");
    }
  };

  const validateField = (name, value) => {
    if (["jobId", "date", "customerName"].includes(name) && !value) {
      setErrors((prev) => ({ ...prev, [name]: "This field is required" }));
    }
  };

  const renderInput = (label, amLabel, name, placeholder, type = "text") => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} / <span className="text-blue-600">{amLabel}</span>
      </label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        onBlur={(e) => {
          if (name === "jobId") handleJobIdBlur();
          validateField(name, e.target.value);
        }}
        placeholder={placeholder}
        className={`bg-white dark:bg-gray-800 border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:outline-none transition-all duration-200
          ${
            errors[name]
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
          }
        `}
      />
      {errors[name] && (
        <span className="text-xs text-red-500">{errors[name]}</span>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderInput("Job ID", "የስራ መለያ", "jobId", "Enter Job ID")}
        {renderInput("Date", "ቀን", "date", "", "date")}
        {renderInput(
          "Customer Name",
          "የደንበኛ ስም",
          "customerName",
          "Enter Customer Name"
        )}
        {renderInput(
          "Product Name",
          "የምርቱ ስም",
          "product_name",
          "Enter Product Name"
        )}
        {renderInput(
          "Type of Job",
          "የስራው አይነት",
          "types_of_jobs",
          "Enter Job Type"
        )}
        {renderInput(
          "Customer TIN",
          "የግብር መለያ ቁጥር",
          "customerTin",
          "Enter TIN"
        )}
        {renderInput(
          "Reference Number",
          "ማጣቀሻ ቁጥር",
          "refNum",
          "Enter Reference Number"
        )}
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
        {renderInput("Payment Before", "ክፍያ በፊት", "paymentBefore", "")}
        {renderInput("Notes", "ማስታወሻ", "notes", "Any notes")}
        {/* {renderInput("Signature", "ፊርማ", "signature", "Enter Signature")} */}
      </div>
    </div>
  );
}

export default ProformaHeader;
