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
        product_name: formData.product_name,
        types_of_jobs: formData.types_of_jobs,
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

      Swal.fire("Updated!", "Proforma updated successfully.", "success");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed!", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-11/12 max-h-[95vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">
          Edit Proforma #{formData.job_id}
        </h2>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ========== MAIN FIELDS ========== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Customer Name</label>
              <input
                type="text"
                value={formData.customer_name || ""}
                onChange={(e) => handleChange("customer_name", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Product Name</label>
              <input
                type="text"
                value={formData.product_name || ""}
                onChange={(e) => handleChange("product_name", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Ref Num</label>
              <input
                type="text"
                value={formData.ref_num || ""}
                onChange={(e) => handleChange("ref_num", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label>Prepared By</label>
              <input
                type="text"
                value={formData.prepared_by || ""}
                onChange={(e) => handleChange("prepared_by", e.target.value)}
                className="w-full border px-2 py-1 rounded"
              />
            </div>
          </div>

          {/* ========== LABOUR ROWS ========== */}
          <div>
            <h3 className="font-semibold mb-2">Labour Items</h3>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Est. Time</th>
                  <th>Cost</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.labour_items?.map((row, index) => (
                  <tr key={index} className="text-center">
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => handleRemoveRow("labour_items", index)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="mt-2 px-2 py-1 bg-green-500 text-white rounded"
              onClick={() => handleAddRow("labour_items")}
            >
              + Add Labour Row
            </button>
          </div>

          {/* ========== SPARE ROWS ========== */}
          <div>
            <h3 className="font-semibold mb-2">Spare Items</h3>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Brand</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.spare_items?.map((row, index) => (
                  <tr key={index} className="text-center">
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
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
                        className="border w-full"
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => handleRemoveRow("spare_items", index)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="mt-2 px-2 py-1 bg-green-500 text-white rounded"
              onClick={() => handleAddRow("spare_items")}
            >
              + Add Spare Row
            </button>
          </div>

          {/* ========== SUBMIT ========== */}
          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProformaModal;
