import React, { useState, useEffect } from "react";

function PaymentInfo({ onChange, totalAmount = 0 }) {
  const [payment, setPayment] = useState({
    method: "",
    status: "",
    paidAmount: "",
    remainingAmount: "",
    reference: "",
    date: "",
    paidBy: "",
    approvedBy: "",
    reason: "",
    remarks: "",
  });

  // Update remaining when paidAmount changes
  useEffect(() => {
    if (totalAmount > 0) {
      const paid = parseFloat(payment.paidAmount) || 0;
      const remaining = Math.max(totalAmount - paid, 0);
      setPayment((prev) => ({
        ...prev,
        remainingAmount: remaining.toFixed(2),
      }));
    }
  }, [payment.paidAmount, totalAmount]);

  const handleChange = (field, value) => {
    const updated = { ...payment, [field]: value };
    setPayment(updated);
    onChange?.(updated);
  };

  return (
    <div className="border rounded-md shadow-md p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Payment Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
          </select>
        </div>

        {/* Paid Amount */}
        <div>
          <label className="block text-gray-600 mb-1">Paid Amount (ETB)</label>
          <input
            type="number"
            value={payment.paidAmount}
            onChange={(e) => handleChange("paidAmount", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Remaining Amount */}
        <div>
          <label className="block text-gray-600 mb-1">
            Remaining Amount (ETB)
          </label>
          <input
            type="number"
            value={payment.remainingAmount}
            readOnly
            className="w-full border rounded px-2 py-1 bg-gray-100"
          />
        </div>

        {/* Reference No */}
        <div>
          <label className="block text-gray-600 mb-1">Reference No</label>
          <input
            value={payment.reference}
            onChange={(e) => handleChange("reference", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-gray-600 mb-1">Date of Payment</label>
          <input
            type="date"
            value={payment.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full border rounded px-2 py-1"
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

        {/* Approved By */}
        <div>
          <label className="block text-gray-600 mb-1">Approved By</label>
          <input
            value={payment.approvedBy}
            onChange={(e) => handleChange("approvedBy", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Reason of Payment */}
        <div className="md:col-span-2">
          <label className="block text-gray-600 mb-1">Reason of Payment</label>
          <input
            value={payment.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block text-gray-600 mb-1">Remarks</label>
          <textarea
            value={payment.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentInfo;
