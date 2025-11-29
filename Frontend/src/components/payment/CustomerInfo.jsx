import React, { useState, useEffect } from "react";
import DateInput from "../DateInput";
import api from "@/api";
// import axios from "axios";

function CustomerInfo({ onChange }) {
  const [formData, setFormData] = useState({
    date: "",
    refNum: "",
    fsNum: "",
    customerName: "",
    mobile: "",
    tin: "",
    vat: "",
  });

  // Fetch the next ref number from backend
  useEffect(() => {
    const fetchRefNum = async () => {
      try {
        const res = await api.get("/payments/latest-ref");
        setFormData((prev) => ({ ...prev, refNum: res.data.refNum }));
      } catch (err) {
        console.error("Error fetching ref number:", err);
        setFormData((prev) => ({ ...prev, refNum: "REF0001" }));
      }
    };
    fetchRefNum();
  }, []);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange && onChange(updated);
  };

  return (
    <div className="border rounded-xl shadow-md p-6 bg-white w-full">
      <h2 className="text-lg font-bold mb-6 text-gray-800">
        Customer Information
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Date */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <DateInput
            value={formData.date}
            onChange={(val) => handleChange("date", val)}
            className="w-full border rounded-lg px-3 py-2 text-sm 
                       focus:ring-2 focus:ring-green-500 focus:border-green-500 
                       focus:outline-none transition"
          />
        </div>

        {/* Ref Num */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Ref Num (Auto)
          </label>
          <input
            type="text"
            value={formData.refNum}
            readOnly
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-100"
          />
        </div>

        {/* Fs Num */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Fs Num
          </label>
          <input
            type="text"
            value={formData.fsNum}
            onChange={(e) => handleChange("fsNum", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Customer Name */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Customer Name
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {/* Mobile */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700 ">
            Mobile
          </label>
          <input
            type="number"
            value={formData.mobile}
            onChange={(e) => handleChange("mobile", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm no-spinner"
          />
        </div>

        {/* TIN */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700 ">
            TIN
          </label>
          <input
            type="number"
            value={formData.tin}
            onChange={(e) => handleChange("tin", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm no-spinner"
          />
        </div>

        {/* VAT */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            VAT NUMBER
          </label>
          <input
            type="text"
            value={formData.vat}
            onChange={(e) => handleChange("vat", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerInfo;
