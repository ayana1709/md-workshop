import React, { useEffect, useState } from "react";
import api from "@/api";
import DateInput from "@/components/DateInput";

function ProformaHeader({ formData, setFormData }) {
  const [errors, setErrors] = useState({});
  const [loadingRef, setLoadingRef] = useState(false);

  const ethiopianBanks = [
    "Commercial Bank of Ethiopia",
    "Dashen Bank",
    "Awash Bank",
    "Abay Bank",
    "Other",
  ];
  const fetchRefNum = async () => {
    try {
      setLoadingRef(true);
      const res = await api.get("/proforma/generate-ref");
      if (res?.data?.refNum) {
        setFormData((prev) => ({ ...prev, refNum: res.data.refNum }));
      }
    } catch (err) {
      console.error("Error fetching ref number:", err);
    } finally {
      setLoadingRef(false);
    }
  };

  // Run once on mount
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: prev.date || new Date().toISOString().split("T")[0],
      status: prev.status || "pending",
      paymenttype: prev.paymenttype || "cash",
    }));

    // Fetch only once (on mount)
    fetchRefNum();
  }, []); // <- no dependency on formData

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleJobIdBlur = async () => {
    if (!formData.jobId) return;
    try {
      const res = await api.get(`repairs/basic/${formData.jobId}`);
      const { customer_name } = res.data;
      setFormData((prev) => ({
        ...prev,
        customerName: customer_name,
      }));
    } catch (error) {
      console.error("Failed to fetch job info:", error);
    }
  };

  const renderInput = (label, amLabel, name, placeholder, type = "text") => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label} / <span className="text-blue-600">{amLabel}</span>
      </label>

      {type === "date" ? (
        <DateInput
          value={formData[name] || ""}
          onChange={(val) => handleChange({ target: { name, value: val } })}
          placeholder="MM/DD/YYYY"
          className="bg-white dark:bg-gray-800 border rounded-lg px-4 py-2"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          onBlur={(e) => name === "refNum" && handleJobIdBlur()}
          placeholder={placeholder}
          className="bg-white dark:bg-gray-800 border rounded-lg px-4 py-2"
        />
      )}
    </div>
  );

  const renderStatus = () => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Status / <span className="text-blue-600">ሁኔታ</span>
      </label>
      <select
        name="status"
        value={formData.status || "pending"}
        onChange={handleChange}
        className="bg-white dark:bg-gray-800 border rounded-lg px-4 py-2"
      >
        <option value="sold">Sold</option>
        <option value="pending">Pending</option>
        <option value="canceled">Canceled</option>
        <option value="returned">Returned</option>
        <option value="refund">Refund</option>
        <option value="others">Others</option>
      </select>

      {formData.status === "others" && (
        <input
          type="text"
          name="otherStatus"
          value={formData.otherStatus || ""}
          onChange={handleChange}
          placeholder="Specify other status"
          className="mt-2 bg-white dark:bg-gray-800 border rounded-lg px-4 py-2"
        />
      )}
    </div>
  );

  const renderPaymentType = () => (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Payment Type / <span className="text-blue-600">የክፍያ መንገድ</span>
      </label>
      <select
        name="paymenttype"
        value={formData.paymenttype || "cash"}
        onChange={handleChange}
        className="bg-white dark:bg-gray-800 border rounded-lg px-4 py-2"
      >
        <option value="">Select</option>
        <option value="cash">Cash</option>
        <option value="transfer">Transfer</option>
        <option value="card">Card</option>
        <option value="cheque">Cheque</option>
        <option value="credit">Credit</option>
      </select>

      {/* Transfer Fields */}
      {formData.paymenttype === "transfer" && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* From Bank */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                From Bank
              </label>
              <select
                name="fromBank"
                value={formData.fromBank || ""}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select Bank</option>
                {ethiopianBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {formData.fromBank === "Other" && (
                <input
                  name="otherFromBank"
                  value={formData.otherFromBank || ""}
                  onChange={handleChange}
                  placeholder="Specify bank name"
                  className="mt-2 w-full border rounded px-2 py-1"
                />
              )}
            </div>

            {/* To Bank */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                To Bank
              </label>
              <select
                name="toBank"
                value={formData.toBank || ""}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select Bank</option>
                {ethiopianBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
              {formData.toBank === "Other" && (
                <input
                  name="otherToBank"
                  value={formData.otherToBank || ""}
                  onChange={handleChange}
                  placeholder="Specify bank name"
                  className="mt-2 w-full border rounded px-2 py-1"
                />
              )}
            </div>
          </div>

          {/* Upload slip */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Upload Transfer Slip
            </label>
            <input
              type="file"
              name="transferSlip"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      )}

      {/* Cheque Fields */}
      {formData.paymenttype === "cheque" && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Cheque Number
            </label>
            <input
              type="text"
              name="chequeNumber"
              value={formData.chequeNumber || ""}
              onChange={handleChange}
              placeholder="Enter cheque number"
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">
              Upload Cheque Image
            </label>
            <input
              type="file"
              name="chequeImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderInput(
          "Reference Number",
          "ማጣቀሻ ቁጥር",
          "refNum",
          "Enter Reference Number"
        )}
        {renderInput("Date", "ቀን", "date", "", "date")}
        {renderInput(
          "Customer Name",
          "የደንበኛ ስም",
          "customerName",
          "Enter Customer Name"
        )}
        {renderInput(
          "Customer TIN",
          "የግብር መለያ ቁጥር",
          "customerTin",
          "Enter TIN"
        )}

        {renderPaymentType()}
        {renderStatus()}
      </div>
    </div>
  );
}

export default ProformaHeader;
