import React from "react";
import api from "@/api"; // Your axios wrapper

function ProformaHeader({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const renderInput = (label, amLabel, name, placeholder, type = "text") => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} / <span className="text-blue-600">{amLabel}</span>
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        onBlur={name === "jobId" ? handleJobIdBlur : undefined}
        placeholder={placeholder}
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
      />
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transition-all">
      {renderInput("Job ID (Optional)", "የስራ መለያ ኮድ", "jobId", "የስራ መለያ ኮድ")}
      {renderInput("Date", "ቀን", "date", "", "date")}
      {renderInput("Customer Name", "የደንበኛው ስም", "customerName", "የደንበኛው ስም")}
      {renderInput("Product Name", "የምርቱ ስም", "product_name", "የምርቱ ስም")}
      {renderInput("Type of Job", "የስራው አይነት", "types_of_jobs", "የስራው አይነት")}
    </div>
  );
}

export default ProformaHeader;
