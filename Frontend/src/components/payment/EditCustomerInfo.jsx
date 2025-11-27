import React, { useState, useEffect } from "react";
import DateInput from "../DateInput";

function EditCustomerInfo({ value = {}, onChange }) {
  const [formData, setFormData] = useState({
    date: "",
    reference: "",
    fs: "",
    name: "",
    mobile: "",
    tin: "",
    vat: "",
  });

  // 🔄 Sync with parent (EditPaymentForm)
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setFormData({
        date: value.date ? value.date.slice(0, 10) : "", // ensure YYYY-MM-DD
        reference: value.reference || "",
        fs: value.fs || "",
        name: value.name || "",
        mobile: value.mobile || "",
        tin: value.tin || "",
        vat: value.vat || "",
      });
    }
  }, [value]);

  // 🔁 Handle change
  const handleChange = (field, val) => {
    const updated = { ...formData, [field]: val };
    setFormData(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="border rounded-xl shadow-md p-6 bg-white w-full">
      <h2 className="text-lg font-bold mb-6 text-gray-800">
        Edit Customer Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* ===== Date ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <DateInput
            value={formData.date || ""}
            onChange={(val) => handleChange("date", val)}
            className="w-full border rounded-lg px-3 py-2 text-sm
             focus:ring-2 focus:ring-green-500 focus:border-green-500
             focus:outline-none transition"
          />
        </div>

        {/* ===== Reference Number ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Reference Number
          </label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => handleChange("reference", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       focus:outline-none transition"
          />
        </div>

        {/* ===== Fs Number ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            FS Number
          </label>
          <input
            type="text"
            value={formData.fs}
            onChange={(e) => handleChange("fs", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       focus:outline-none transition"
          />
        </div>

        {/* ===== Customer Name ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       focus:outline-none transition"
          />
        </div>

        {/* ===== Mobile ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Mobile
          </label>
          <input
            type="number"
            value={formData.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       focus:outline-none transition appearance-none"
          />
        </div>

        {/* ===== TIN ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            TIN
          </label>
          <input
            type="text"
            value={formData.tin}
            onChange={(e) => handleChange("tin", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       focus:outline-none transition"
          />
        </div>

        {/* ===== VAT Number ===== */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            VAT Number
          </label>
          <input
            type="text"
            value={formData.vat}
            onChange={(e) => handleChange("vat", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  );
}

export default EditCustomerInfo;
