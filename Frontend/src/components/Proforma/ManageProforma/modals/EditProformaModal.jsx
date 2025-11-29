import React, { useState, useEffect } from "react";
import api from "@/api";
import Swal from "sweetalert2";
import { FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";
import DateInput from "@/components/DateInput";
import numberToWords from "number-to-words";
function EditProformaModal({ proforma, open, onClose, onUpdated }) {
  const [formData, setFormData] = useState({});

  // ✅ 1. All hooks stay at the top
  useEffect(() => {
    if (open && proforma) {
      setFormData({ ...proforma });
    }
  }, [open, proforma]);

  const calcSubTotal = (items = []) =>
    items.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);

  const calcVAT = (subTotal, vatEnabled) => (vatEnabled ? subTotal * 0.15 : 0);

  const labourSub = calcSubTotal(formData.labour_items);
  const labourVAT = calcVAT(labourSub, formData.labour_vat);
  const labourGrand = labourSub + labourVAT;

  const spareSub = calcSubTotal(formData.spare_items);
  const spareVAT = calcVAT(spareSub, formData.spare_vat);
  const spareGrand = spareSub + spareVAT;

  const combinedSub = labourSub + spareSub;
  const combinedVAT = labourVAT + spareVAT;
  const combinedGrand = combinedSub + combinedVAT;

  // ✅ 2. Auto-update words + amount
  useEffect(() => {
    if (open && !isNaN(combinedGrand)) {
      const words =
        numberToWords
          .toWords(Number(combinedGrand))
          .replace(/^\w/, (c) => c.toUpperCase()) + " birr only";

      setFormData((prev) => ({
        ...prev,
        net_pay: combinedGrand.toFixed(2),
        net_pay_in_words: words,
      }));
    }
  }, [combinedGrand, open]);

  // ✅ 3. Only after hooks are declared:
  if (!open || !formData) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (type, index, field, value) => {
    setFormData((prev) => {
      const updatedRows = [...(prev[type] || [])];
      const row = { ...updatedRows[index], [field]: value };

      // Auto-update total for spare items
      if (
        type === "spare_items" &&
        (field === "qty" || field === "unit_price")
      ) {
        const qty = parseInt(row.qty) || 0;
        const unitPrice = parseFloat(row.unit_price) || 0;
        row.total = qty * unitPrice;
      }

      updatedRows[index] = row;

      return { ...prev, [type]: updatedRows };
    });
  };

  const toggleVAT = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] ? 0 : 1,
    }));
  };
  const handleAddRow = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), {}],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      // Calculate totals
      const labourSub = calcSubTotal(formData.labour_items);
      const labourVAT = calcVAT(labourSub, formData.labour_vat);
      const labourGrand = labourSub + labourVAT;

      const spareSub = calcSubTotal(formData.spare_items);
      const spareVAT = calcVAT(spareSub, formData.spare_vat);
      const spareGrand = spareSub + spareVAT;

      const combinedSub = labourSub + spareSub;
      const combinedVAT = labourVAT + spareVAT;
      const combinedGrand = combinedSub + combinedVAT;

      // ✅ Prepare readable words for backend
      const words =
        numberToWords
          .toWords(Number(combinedGrand))
          .replace(/^\w/, (c) => c.toUpperCase()) + " birr only";

      // ✅ Prepare payload (for backend consistency)
      const payload = {
        ...formData,
        labour_items: formData.labour_items?.map((r) => ({
          description: r.description || "",
          unit: r.unit || "",
          est_time: parseFloat(r.est_time) || 0,
          cost: parseFloat(r.cost) || 0,
          total: parseFloat(r.total) || 0,
          remark: r.remark || "",
        })),
        spare_items: formData.spare_items?.map((r) => ({
          description: r.description || "",
          unit: r.unit || "",
          brand: r.brand || "",
          qty: parseFloat(r.qty) || 0,
          unit_price: parseFloat(r.unit_price) || 0,
          total: parseFloat(r.total) || 0,
          remark: r.remark || "",
        })),
        summary: {
          total: combinedSub,
          totalVat: combinedVAT,
          grossTotal: combinedGrand,
          netPay: combinedGrand,
          netPayInWords: words, // ✅ send net words to backend
        },
      };

      const transformed = {
        date: formData.date,
        refNum: formData.ref_num,
        customerName: formData.customer_name,
        customerTin: formData.customer_tin,
        preparedBy: formData.prepared_by,
        status: formData.status,
        deliveryDate: formData.delivery_date,
        validityDate: formData.validity_date,
        notes: formData.notes,
        paymentBefore: formData.payment_before,
        discount: formData.discount,
        otherCost: formData.other_cost,
        labourVat: !!formData.labour_vat,
        spareVat: !!formData.spare_vat,
        labourRows: formData.labour_items || [],
        spareRows: formData.spare_items || [],
        summary: {
          total: combinedSub,
          totalVat: combinedVAT,
          grossTotal: combinedGrand,
          netPay: combinedGrand,
          netPayInWords: words, // ✅ include here too
        },
      };

      await api.put(`/proformas/${formData.ref_num}`, transformed);

      Swal.fire("✅ Updated!", "Proforma updated successfully.", "success");
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("❌ Error", "Failed to update proforma.", "error");
    }
  };

  const labourVisible =
    formData.labour_items && formData.labour_items.length > 0;
  const spareVisible = formData.spare_items && formData.spare_items.length > 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl p-4 sm:p-8 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold mb-6 border-b pb-2">
          ✏️ Edit Proforma ({formData.ref_num})
        </h2>

        <form onSubmit={handleSave} className="space-y-8">
          {/* ======= MAIN INFO ======= */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium">Date</label>
              <DateInput
                value={formData.date ? formData.date.slice(0, 10) : ""}
                onChange={(v) => handleChange("date", v)}
              />
            </div>

            {[
              { label: "Ref Num", key: "ref_num" },
              { label: "Customer Name", key: "customer_name" },
              { label: "Customer TIN", key: "customer_tin" },
              // { label: "Status", key: "status" },
              { label: "Validity Date", key: "validity_date" },
              { label: "Prepared By", key: "prepared_by" },
              { label: "Payment Before", key: "payment_before" },
              { label: "Notes", key: "notes" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium">{label}</label>
                <input
                  type="text"
                  value={formData[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium">Delivery Date</label>
              <DateInput
                value={
                  formData.delivery_date
                    ? formData.delivery_date.slice(0, 10)
                    : ""
                }
                onChange={(v) => handleChange("delivery_date", v)}
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status || "pending"}
                onChange={(e) => handleChange("status", e.target.value)}
                className="bg-white dark:bg-gray-800 border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
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
                  onChange={(e) => handleChange("otherStatus", e.target.value)}
                  placeholder="Specify other status"
                  className="mt-2 bg-white dark:bg-gray-800 border rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:outline-none transition-all duration-200 border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* ======= TABLES (AUTO DETECT) ======= */}
          {labourVisible && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <span>👷 Labour Items</span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleVAT("labour_vat")}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    VAT:{" "}
                    {formData.labour_vat ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRow("labour_items")}
                    className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md flex items-center gap-2"
                  >
                    <FaPlus /> Add Row
                  </button>
                </div>
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full border rounded-lg text-sm sm:text-base">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Est. Time</th>
                      <th className="p-2">Cost</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.labour_items.map((r, i) => (
                      <tr key={i} className="text-center border-t">
                        {[
                          "description",
                          "unit",
                          "est_time",
                          "cost",
                          "total",
                        ].map((f) => (
                          <td key={f} className="p-1">
                            <input
                              value={r[f] || ""}
                              onChange={(e) =>
                                handleRowChange(
                                  "labour_items",
                                  i,
                                  f,
                                  e.target.value
                                )
                              }
                              className="border w-full px-2 py-1 rounded-md text-center min-w-[100px]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={4} className="text-right p-2">
                        Subtotal:
                      </td>
                      <td className="p-2">{labourSub.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={4} className="text-right p-2">
                        VAT (15%):
                      </td>
                      <td className="p-2">{labourVAT.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={4} className="text-right p-2">
                        Grand Total:
                      </td>
                      <td className="p-2">{labourGrand.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {spareVisible && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                <span></span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => toggleVAT("spare_vat")}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    VAT:{" "}
                    {formData.spare_vat ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddRow("spare_items")}
                    className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md flex items-center gap-2"
                  >
                    <FaPlus /> Add Row
                  </button>
                </div>
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-[800px] w-full border rounded-lg text-sm sm:text-base">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2">Unit</th>
                      {/* <th className="p-2">Brand</th> */}
                      <th className="p-2">Qty</th>
                      <th className="p-2">Unit Price</th>
                      <th className="p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.spare_items.map((r, i) => (
                      <tr key={i} className="text-center border-t">
                        {[
                          "description",
                          "unit",
                          // "brand",
                          "qty",
                          "unit_price",
                          "total",
                        ].map((f) => (
                          <td key={f} className="p-1">
                            <input
                              type={
                                f === "qty" || f === "unit_price"
                                  ? "number"
                                  : "text"
                              }
                              value={
                                f === "qty" ? parseInt(r[f]) || "" : r[f] || ""
                              }
                              onChange={(e) =>
                                handleRowChange(
                                  "spare_items",
                                  i,
                                  f,
                                  e.target.value
                                )
                              }
                              className="border w-full px-2 py-1 rounded-md text-center min-w-[110px]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {/* Totals */}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={5} className="text-right p-2">
                        Subtotal:
                      </td>
                      <td className="p-2">{spareSub.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={5} className="text-right p-2">
                        VAT (15%):
                      </td>
                      <td className="p-2">{spareVAT.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={5} className="text-right p-2">
                        Grand Total:
                      </td>
                      <td className="p-2">{spareGrand.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {labourVisible && spareVisible && (
            <div className="text-right mt-8 border-t pt-4">
              <p className="font-semibold">
                Combined Subtotal: {combinedSub.toFixed(2)}
              </p>
              <p className="font-semibold">
                Combined VAT: {combinedVAT.toFixed(2)}
              </p>
              <p className="font-bold text-lg">
                Combined Grand Total: {combinedGrand.toFixed(2)}
              </p>
            </div>
          )}
          <div className="mt-4 text-right italic text-gray-700">
            <p>
              In Words:{" "}
              <span className="font-semibold">{formData.net_pay_in_words}</span>
            </p>
          </div>

          <div className="text-right mt-6">
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
