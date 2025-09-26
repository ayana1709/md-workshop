import React, { useState } from "react";

function CustomerInfo({ onChange }) {
  const [customer, setCustomer] = useState({
    jobId: "",
    name: "",
    mobile: "",

    model: "",
    priority: "",
    receivedDate: "",
    dateOut: "",
  });

  const handleChange = (field, value) => {
    const updated = { ...customer, [field]: value };
    setCustomer(updated);
    onChange && onChange(updated); // notify parent
  };

  // Helper for nicer labels
  const formatLabel = (key) => {
    switch (key) {
      case "jobId":
        return "Job ID";
      case "receivedDate":
        return "Received Date";
      case "dateOut":
        return "Date Out";
      default:
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
  };

  // Determine input type
  const getInputType = (key) => {
    if (key === "mobile") return "number"; // only numeric
    if (key.toLowerCase().includes("date")) return "date";
    return "text";
  };

  return (
    <div className="border rounded-md shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        {Object.keys(customer).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="block font-medium mb-1">
              {formatLabel(key)}
              {key === "jobId" && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={getInputType(key)}
              value={customer[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${
                getInputType(key) === "number" ? "appearance-none" : ""
              }`}
              required={key === "jobId"} // Job ID required
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerInfo;
