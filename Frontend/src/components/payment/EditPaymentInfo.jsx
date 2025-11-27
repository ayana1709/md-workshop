import React, { useState, useEffect } from "react";

function EditPaymentInfo({ value = {}, onChange, totalAmount = 0 }) {
  const [payment, setPayment] = useState({
    method: "",
    status: "",
    paidAmount: "",
    remainingAmount: "",
    paidBy: "",
    approvedBy: "",
    reason: "",
  });

  // 🔹 Prefill payment info when editing
  useEffect(() => {
    if (value && Object.keys(value).length > 0) {
      setPayment((prev) => ({
        ...prev,
        ...value,
      }));
    }
  }, [value]);

  // 🔹 Auto-update paid & remaining when totalAmount changes
  useEffect(() => {
    if (totalAmount > 0) {
      setPayment((prev) => {
        const paid =
          prev.status === "full"
            ? totalAmount // if full payment → paid = total
            : parseFloat(prev.paidAmount) || 0;
        const remaining = Math.max(totalAmount - paid, 0);

        const updated = {
          ...prev,
          paidAmount: prev.status === "full" ? totalAmount.toFixed(2) : paid,
          remainingAmount: remaining.toFixed(2),
        };

        // notify parent
        onChange?.(updated);
        return updated;
      });
    }
  }, [totalAmount, payment.status]);

  const handleChange = (field, value) => {
    setPayment((prev) => {
      const updated = { ...prev, [field]: value };

      // recalc remaining if paidAmount changes
      if (field === "paidAmount") {
        const paid = parseFloat(value) || 0;
        const remaining = Math.max(totalAmount - paid, 0);
        updated.remainingAmount = remaining.toFixed(2);
      }

      // handle full payment
      if (field === "status" && value === "full") {
        updated.paidAmount = totalAmount.toFixed(2);
        updated.remainingAmount = "0.00";
      }

      onChange?.(updated);
      return updated;
    });
  };

  return (
    <div className="border rounded-md shadow-md p-4 bg-white">
      <h2 className="text-lg font-semibold mb-4">Edit Payment Information</h2>

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
            <option value="cheque">Cheque</option>
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
            className="w-full border rounded px-2 py-1 no-spinner"
          />
        </div>

        {/* Remaining Amount */}
        <div>
          <label className="block text-gray-600 mb-1">
            Remaining Amount (ETB)
          </label>
          <input
            type="number"
            readOnly
            value={payment.remainingAmount}
            className="w-full border rounded px-2 py-1 bg-gray-100 no-spinner"
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

        {/* Paid For */}
        <div className="md:col-span-2">
          <label className="block text-gray-600 mb-1">Paid For</label>
          <textarea
            value={payment.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Parts, labor, diagnostics..."
            rows={2}
            className="w-full border rounded px-2 py-1 resize-y"
          />
        </div>
      </div>
    </div>
  );
}

export default EditPaymentInfo;
