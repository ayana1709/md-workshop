import React, { useState, useMemo, useEffect } from "react";

function CostTables({ onChange }) {
  // === States ===
  const [labourRows, setLabourRows] = useState([
    { description: "", time: "", total: "" },
  ]);
  const [spareRows, setSpareRows] = useState([
    { itemName: "", partNumber: "", qty: "", unitPrice: "", total: 0 },
  ]);
  const [otherRows, setOtherRows] = useState([{ description: "", amount: "" }]);
  const [discount, setDiscount] = useState(0);

  // VAT Toggles
  const [vatLabour, setVatLabour] = useState(false);
  const [vatSpare, setVatSpare] = useState(false);
  const [vatOther, setVatOther] = useState(false);

  // === Handlers ===
  const handleLabourChange = (i, field, value) => {
    const updated = [...labourRows];
    updated[i][field] = field === "total" ? parseFloat(value) || 0 : value;
    setLabourRows(updated);
  };

  const handleSpareChange = (i, field, value) => {
    const updated = [...spareRows];
    if (["qty", "unitPrice"].includes(field)) {
      updated[i][field] = parseFloat(value) || 0;
      updated[i].total = updated[i].qty * updated[i].unitPrice;
    } else {
      updated[i][field] = value;
    }
    setSpareRows(updated);
  };

  const handleOtherChange = (i, field, value) => {
    const updated = [...otherRows];
    updated[i][field] = field === "amount" ? parseFloat(value) || 0 : value;
    setOtherRows(updated);
  };

  // === Row Actions ===
  const deleteLabourRow = (i) =>
    setLabourRows(labourRows.filter((_, idx) => idx !== i));
  const deleteSpareRow = (i) =>
    setSpareRows(spareRows.filter((_, idx) => idx !== i));
  const deleteOtherRow = (i) =>
    setOtherRows(otherRows.filter((_, idx) => idx !== i));

  const addLabourRow = () =>
    setLabourRows([...labourRows, { description: "", time: "", total: "" }]);
  const addSpareRow = () =>
    setSpareRows([
      ...spareRows,
      { itemName: "", partNumber: "", qty: "", unitPrice: "", total: 0 },
    ]);
  const addOtherRow = () =>
    setOtherRows([...otherRows, { description: "", amount: "" }]);

  // === Summary Calculation ===
  const summary = useMemo(() => {
    const labourTotal = labourRows.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0),
      0
    );
    const spareTotal = spareRows.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0),
      0
    );
    const otherTotal = otherRows.reduce(
      (sum, r) => sum + (parseFloat(r.amount) || 0),
      0
    );

    const subtotal = labourTotal + spareTotal + otherTotal;
    const vatRate = 0.15;
    const vatAmount =
      (vatLabour ? labourTotal * vatRate : 0) +
      (vatSpare ? spareTotal * vatRate : 0) +
      (vatOther ? otherTotal * vatRate : 0);

    const grandTotal = Math.max(subtotal + vatAmount - discount, 0);

    return {
      labourTotal,
      spareTotal,
      otherTotal,
      subtotal,
      vatAmount,
      discount,
      grandTotal,
    };
  }, [
    labourRows,
    spareRows,
    otherRows,
    vatLabour,
    vatSpare,
    vatOther,
    discount,
  ]);

  useEffect(() => {
    onChange?.({
      labour: labourRows,
      spares: spareRows,
      others: otherRows,
      vatLabour,
      vatSpare,
      vatOther,
      discount,
      summary,
    });
  }, [
    labourRows,
    spareRows,
    otherRows,
    vatLabour,
    vatSpare,
    vatOther,
    discount,
    summary,
  ]);

  // === UI ===
  const DeleteButton = ({ onClick }) => (
    <button
      onClick={onClick}
      type="button"
      className="px-3 py-2 text-xs sm:text-sm text-white bg-red-500 hover:bg-red-600 rounded-md w-full sm:w-auto"
    >
      Delete
    </button>
  );

  return (
    <div className="space-y-8 pb-6">
      {/* ===== LABOUR COST ===== */}
      <div className="border rounded-xl shadow-md bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 py-3 bg-gray-100 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">
            Labour Cost
          </h3>
          <button
            type="button"
            onClick={addLabourRow}
            className="px-5 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full sm:w-auto"
          >
            + Add Labour Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-xs sm:text-sm">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-3">S.No</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Estimation Time</th>
                <th className="px-3 py-3">Total Cost (ETB)</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {labourRows.map((row, i) => (
                <tr key={i} className="border-t even:bg-gray-50">
                  <td className="px-3 py-2 text-center">{i + 1}</td>
                  <td className="px-3 py-2">
                    {row.isTextarea ? (
                      /* ================================
       TEXTAREA (after pressing Enter)
       ================================ */
                      <textarea
                        value={row.description}
                        onChange={(e) =>
                          handleLabourChange(i, "description", e.target.value)
                        }
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();

                            const newText =
                              (row.description?.trim() || "") + "\n• ";

                            handleLabourChange(i, "description", newText);

                            setTimeout(() => {
                              e.target.selectionStart = e.target.selectionEnd =
                                newText.length;

                              e.target.style.height = "auto";
                              e.target.style.height =
                                e.target.scrollHeight + "px";
                            }, 0);
                          }
                        }}
                        className="w-full resize-none overflow-hidden min-w-[220px] border rounded-lg px-4 py-3 text-base sm:text-sm leading-relaxed"
                        placeholder="Describe work..."
                      />
                    ) : (
                      /* ================================
       NORMAL INPUT (before Enter)
       ================================ */
                      <input
                        value={row.description}
                        onChange={(e) =>
                          handleLabourChange(i, "description", e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();

                            // Switch to textarea mode
                            handleLabourChange(i, "isTextarea", true);

                            // Create first bullet
                            const firstText = "• " + (row.description || "");
                            handleLabourChange(i, "description", firstText);
                          }
                        }}
                        className="w-full min-w-[220px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Description"
                      />
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <input
                      value={row.time}
                      onChange={(e) =>
                        handleLabourChange(i, "time", e.target.value)
                      }
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="Time"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.total}
                      onChange={(e) =>
                        handleLabourChange(i, "total", e.target.value)
                      }
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <DeleteButton onClick={() => deleteLabourRow(i)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 py-3 border-t text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vatLabour}
              onChange={(e) => setVatLabour(e.target.checked)}
              className="w-4 h-4"
            />
            Apply VAT (15%)
          </label>
        </div>
      </div>

      {/* ===== SPARE COST ===== */}
      <div className="border rounded-xl shadow-md bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 py-3 bg-gray-100 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">
            Spare Cost
          </h3>
          <button
            type="button"
            onClick={addSpareRow}
            className="px-5 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full sm:w-auto"
          >
            + Add Spare Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-xs sm:text-sm">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-3">S.No</th>
                <th className="px-3 py-3">Item Name</th>
                <th className="px-3 py-3">Part Number</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Unit Price</th>
                <th className="px-3 py-3">Total Price (ETB)</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {spareRows.map((row, i) => (
                <tr key={i} className="border-t even:bg-gray-50">
                  <td className="px-3 py-2 text-center">{i + 1}</td>

                  <td className="px-3 py-2">
                    {row.isItemTextarea ? (
                      /* ================================
       TEXTAREA (after pressing Enter)
       ================================ */
                      <textarea
                        value={row.itemName}
                        onChange={(e) =>
                          handleSpareChange(i, "itemName", e.target.value)
                        }
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();

                            const newText =
                              (row.itemName?.trim() || "") + "\n• ";

                            handleSpareChange(i, "itemName", newText);

                            setTimeout(() => {
                              e.target.selectionStart = e.target.selectionEnd =
                                newText.length;

                              e.target.style.height = "auto";
                              e.target.style.height =
                                e.target.scrollHeight + "px";
                            }, 0);
                          }
                        }}
                        className="w-full resize-none overflow-hidden min-w-[220px] border rounded-lg px-4 py-3 text-base sm:text-sm leading-relaxed"
                        placeholder="Item name..."
                      />
                    ) : (
                      /* ================================
       NORMAL INPUT (before Enter)
       ================================ */
                      <input
                        value={row.itemName}
                        onChange={(e) =>
                          handleSpareChange(i, "itemName", e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();

                            // Switch input → textarea mode
                            handleSpareChange(i, "isItemTextarea", true);

                            // Create first bullet
                            const firstText = "• " + (row.itemName || "");
                            handleSpareChange(i, "itemName", firstText);
                          }
                        }}
                        className="w-full min-w-[220px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Item name"
                      />
                    )}
                  </td>

                  <td className="px-3 py-2">
                    <input
                      value={row.partNumber}
                      onChange={(e) =>
                        handleSpareChange(i, "partNumber", e.target.value)
                      }
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="Part No."
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) =>
                        handleSpareChange(i, "qty", e.target.value)
                      }
                      className="w-full min-w-[150px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) =>
                        handleSpareChange(i, "unitPrice", e.target.value)
                      }
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.total}
                      readOnly
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm bg-gray-100 no-spinner"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <DeleteButton onClick={() => deleteSpareRow(i)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 py-3 border-t text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vatSpare}
              onChange={(e) => setVatSpare(e.target.checked)}
              className="w-4 h-4"
            />
            Apply VAT (15%)
          </label>
        </div>
      </div>

      {/* ===== OTHER COST ===== */}
      <div className="border rounded-xl shadow-md bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 py-3 bg-gray-100 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700">
            Other Costs
          </h3>
          <button
            type="button"
            onClick={addOtherRow}
            className="px-5 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full sm:w-auto"
          >
            + Add Other Cost
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-xs sm:text-sm">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-3">S.No</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Amount (ETB)</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {otherRows.map((row, i) => (
                <tr key={i} className="border-t even:bg-gray-50">
                  <td className="px-3 py-2 text-center">{i + 1}</td>
                  <td className="px-3 py-2">
                    <input
                      value={row.description}
                      onChange={(e) =>
                        handleOtherChange(i, "description", e.target.value)
                      }
                      className="w-full min-w-[220px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400"
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) =>
                        handleOtherChange(i, "amount", e.target.value)
                      }
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <DeleteButton onClick={() => deleteOtherRow(i)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 px-4 py-3 border-t text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={vatOther}
              onChange={(e) => setVatOther(e.target.checked)}
              className="w-4 h-4"
            />
            Apply VAT (15%)
          </label>
        </div>
      </div>

      {/* ===== FINAL SUMMARY ===== */}
      <div className="bg-white rounded-xl shadow-lg border p-6 space-y-4">
        <h4 className="text-lg sm:text-xl font-bold text-gray-800">
          Final Cost Summary
        </h4>

        <div className="text-sm sm:text-base text-gray-700 space-y-3">
          <div className="flex justify-between">
            <span>Total Cost (Without VAT)</span>
            <span className="font-semibold">
              {summary.subtotal.toFixed(2)} ETB
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total VAT Amount</span>
            <span className="font-semibold">
              {summary.vatAmount.toFixed(2)} ETB
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <label className="flex items-center gap-2 w-full sm:w-auto">
              <span>Discount (ETB)</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full sm:w-24 border rounded-md px-4 py-3 text-sm text-right no-spinner"
              />
            </label>
            <span className="font-semibold text-red-600">
              - {discount.toFixed(2)} ETB
            </span>
          </div>

          <div className="flex justify-between text-green-700 font-bold border-t pt-3 text-base sm:text-lg">
            <span>Grand Total</span>
            <span>{summary.grandTotal.toFixed(2)} ETB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostTables;
