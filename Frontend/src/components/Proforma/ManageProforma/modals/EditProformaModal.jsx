import React, { useState, useEffect } from "react";
import api from "@/api";
import Swal from "sweetalert2";

function EditProformaModal({ proforma, open, onClose, onUpdated }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (proforma) {
      setFormData(proforma);
    }
  }, [proforma]);

  if (!open || !formData) return null;

  // ✅ Handle top-level changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Handle row changes
  const handleRowChange = (type, index, field, value) => {
    setFormData((prev) => {
      const updatedRows = [...prev[type]];
      updatedRows[index] = { ...updatedRows[index], [field]: value };
      return { ...prev, [type]: updatedRows };
    });
  };

  // ✅ Add row
  const handleAddRow = (type) => {
    const emptyRow =
      type === "labour_items"
        ? { description: "", unit: "", est_time: "", cost: "", total: "" }
        : {
            description: "",
            unit: "",
            brand: "",
            quantity: "",
            unit_price: "",
            total: "",
          };

    setFormData((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), emptyRow],
    }));
  };

  // ✅ Remove row
  const handleRemoveRow = (type, index) => {
    setFormData((prev) => {
      const updatedRows = [...prev[type]];
      updatedRows.splice(index, 1);
      return { ...prev, [type]: updatedRows };
    });
  };

  // ✅ Save
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customerName: formData.customer_name,
        customerTin: formData.customer_tin,

        preparedBy: formData.prepared_by,
        refNum: formData.ref_num,
        validityDate: formData.validity_date,
        notes: formData.notes,
        paymentBefore: formData.payment_before,
        discount: formData.discount,
        otherCost: formData.other_cost,
        summary: {
          total: formData.total,
          totalVat: formData.total_vat,
          grossTotal: formData.gross_total,
          withholding: formData.withholding,
          netPay: formData.net_pay,
          netPayInWords: formData.net_pay_in_words,
        },
        labourRows: formData.labour_items?.map((row) => ({
          description: row.description,
          unit: row.unit,
          estTime: row.est_time,
          cost: row.cost,
          total: row.total,
        })),
        spareRows: formData.spare_items?.map((row) => ({
          description: row.description,
          unit: row.unit,
          brand: row.brand,
          qty: row.quantity,
          unitPrice: row.unit_price,
          total: row.total,
        })),
      };

      await api.put(`/proformas/${formData.job_id}`, payload);

      Swal.fire("✅ Updated!", "Proforma updated successfully.", "success");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "Update failed!", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl p-8 relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          ✏️ Edit Proforma #{formData.job_id}
        </h2>

        <form onSubmit={handleSave} className="space-y-8">
          {/* ========== MAIN FIELDS ========== */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Customer Name</label>
              <input
                type="text"
                value={formData.customer_name || ""}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Ref Num</label>
              <input
                type="text"
                value={formData.ref_num || ""}
                onChange={(e) => handleChange("ref_num", e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Prepared By</label>
              <input
                type="text"
                value={formData.prepared_by || ""}
                onChange={(e) => handleChange("prepared_by", e.target.value)}
                className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ========== LABOUR ROWS ========== */}
          <div>
            <h3 className="text-lg font-semibold mb-3">👷 Labour Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="p-2">Description</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Est. Time</th>
                    <th className="p-2">Cost</th>
                    <th className="p-2">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.labour_items?.map((row, index) => (
                    <tr key={index} className="text-center border-t">
                      <td>
                        <input
                          value={row.description || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "labour_items",
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.unit || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "labour_items",
                              index,
                              "unit",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.est_time || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "labour_items",
                              index,
                              "est_time",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.cost || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "labour_items",
                              index,
                              "cost",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.total || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "labour_items",
                              index,
                              "total",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveRow("labour_items", index)}
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              onClick={() => handleAddRow("labour_items")}
            >
              + Add Labour Row
            </button>
          </div>

          {/* ========== SPARE ROWS ========== */}
          <div>
            <h3 className="text-lg font-semibold mb-3">⚙️ Spare Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border rounded-lg">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="p-2">Description</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Brand</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Unit Price</th>
                    <th className="p-2">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.spare_items?.map((row, index) => (
                    <tr key={index} className="text-center border-t">
                      <td>
                        <input
                          value={row.description || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "spare_items",
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.unit || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "spare_items",
                              index,
                              "unit",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.brand || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "spare_items",
                              index,
                              "brand",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.quantity || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "spare_items",
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.unit_price || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "spare_items",
                              index,
                              "unit_price",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <input
                          value={row.total || ""}
                          onChange={(e) =>
                            handleRowChange(
                              "spare_items",
                              index,
                              "total",
                              e.target.value
                            )
                          }
                          className="border w-full px-2 py-1 rounded"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveRow("spare_items", index)}
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
              onClick={() => handleAddRow("spare_items")}
            >
              + Add Spare Row
            </button>
          </div>

          {/* ========== SUBMIT ========== */}
          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              💾 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProformaModal;
