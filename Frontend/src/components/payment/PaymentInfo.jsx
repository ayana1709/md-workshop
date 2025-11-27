import React, { useState, useEffect } from "react";
import DateInput from "../DateInput";

function PaymentInfo({ onChange, totalAmount = 0 }) {
  const [payment, setPayment] = useState({
    method: "cash",
    status: "full",
    paidAmount: totalAmount,
    remainingAmount: 0,
    reference: "",
    date: "",
    paidBy: "",
    approvedBy: "",
    reason: "",
    remarks: "",
    fromBank: "",
    toBank: "",
    otherFromBank: "",
    otherToBank: "",
    chequeNumber: "",
    image: null,
  });

  const bankOptions = [
    "Commercial Bank of Ethiopia",
    "Awash Bank",
    "Dashen Bank",
    "Bank of Abyssinia",
    "Other",
  ];

  // Auto-update remaining amount
  useEffect(() => {
    const paid = parseFloat(payment.paidAmount) || 0;
    const remaining = Math.max(totalAmount - paid, 0);
    const updated = { ...payment, remainingAmount: remaining };
    setPayment(updated);
    onChange?.(updated);
  }, [payment.paidAmount, totalAmount]);

  // Reset paid amount when total changes
  useEffect(() => {
    setPayment((prev) => ({
      ...prev,
      paidAmount: totalAmount,
      remainingAmount: 0,
    }));
  }, [totalAmount]);

  const handleChange = (field, value) => {
    setPayment((prev) => {
      const updated = { ...prev, [field]: value };
      onChange?.(updated);
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleChange("image", file);
  };

  return (
    <div className="border rounded-md shadow-md p-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">Payment Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* Payment Method */}
        <div>
          <label className="block text-gray-600 mb-1">Payment Method</label>
          <select
            value={payment.method}
            onChange={(e) => handleChange("method", e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="card">Card</option>
            <option value="cheque">Cheque</option>
            <option value="credit">Credit</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-gray-600 mb-1">Payment Status</label>
          <select
            value={payment.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select</option>
            <option value="full">Full Payment</option>
            <option value="partial">Partial Payment</option>
            <option value="pending">Pending</option>
            <option value="nopayment">No Payment</option>
          </select>
        </div>
        {/* Transfer Details */}
        {payment.method === "transfer" && (
          <>
            <div>
              <label className="block text-gray-600 mb-1">From Bank</label>
              <select
                value={payment.fromBank}
                onChange={(e) => handleChange("fromBank", e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select Bank</option>
                {bankOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {payment.fromBank === "Other" && (
                <input
                  placeholder="Specify other bank"
                  value={payment.otherFromBank}
                  onChange={(e) =>
                    handleChange("otherFromBank", e.target.value)
                  }
                  className="w-full border rounded px-2 py-1 mt-1"
                />
              )}
            </div>

            <div>
              <label className="block text-gray-600 mb-1">To Bank</label>
              <select
                value={payment.toBank}
                onChange={(e) => handleChange("toBank", e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select Bank</option>
                {bankOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {payment.toBank === "Other" && (
                <input
                  placeholder="Specify other bank"
                  value={payment.otherToBank}
                  onChange={(e) => handleChange("otherToBank", e.target.value)}
                  className="w-full border rounded px-2 py-1 mt-1"
                />
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1">
                Upload Transfer Slip
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border rounded px-2 py-1"
              />
              {payment.image && (
                <img
                  src={URL.createObjectURL(payment.image)}
                  alt="Transfer Slip"
                  className="mt-2 w-40 h-auto rounded border"
                />
              )}
            </div>
          </>
        )}

        {/* Cheque Details */}
        {payment.method === "cheque" && (
          <>
            <div>
              <label className="block text-gray-600 mb-1">Cheque Number</label>
              <input
                type="text"
                value={payment.chequeNumber}
                onChange={(e) => handleChange("chequeNumber", e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-600 mb-1">
                Upload Cheque Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border rounded px-2 py-1"
              />
              {payment.image && (
                <img
                  src={URL.createObjectURL(payment.image)}
                  alt="Cheque"
                  className="mt-2 w-40 h-auto rounded border"
                />
              )}
            </div>
          </>
        )}
        {/* Paid Amount */}
        <div>
          <label className="block text-gray-600 mb-1">Paid Amount (ETB)</label>
          <input
            type="number"
            value={payment.paidAmount}
            onChange={(e) => handleChange("paidAmount", e.target.value)}
            placeholder="0.00"
            className="w-full border rounded px-2 py-1 no-spinner"
          />
        </div>

        {/* Remaining Amount */}
        <div>
          <label className="block text-gray-600 mb-1">
            Remaining Amount (ETB)
          </label>
          <input
            type="text"
            value={payment.remainingAmount.toFixed(2)}
            readOnly
            className="w-full border rounded px-2 py-1 bg-gray-100"
          />
        </div>

        {/* Paid By */}
        <div>
          <label className="block text-gray-600 mb-1">Paid By</label>
          <input
            value={payment.paidBy}
            onChange={(e) => handleChange("paidBy", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Received By */}
        <div>
          <label className="block text-gray-600 mb-1">Received By</label>
          <input
            value={payment.approvedBy}
            onChange={(e) => handleChange("approvedBy", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Paid For */}
        <div className="md:col-span-2">
          <label className="block text-gray-600 mb-1">Paid For</label>
          <textarea
            value={payment.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Enter reason for payment here..."
            rows={2}
            className="w-full border rounded px-2 py-1 resize-y"
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentInfo;
