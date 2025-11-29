import React, { useState, useMemo, useEffect } from "react";

function FormalCostTables({ onChange }) {
  const [labourRows, setLabourRows] = useState([
    { description: "", time: "", total: "" },
  ]);
  const [spareRows, setSpareRows] = useState([
    { itemName: "", partNumber: "", qty: "", unitPrice: "", total: 0 },
  ]);
  const [otherRows, setOtherRows] = useState([{ description: "", amount: "" }]);
  const [discount, setDiscount] = useState(0);
  const [vatSpare, setVatSpare] = useState(false);

  // === Handlers ===
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

  const deleteSpareRow = (i) =>
    setSpareRows(spareRows.filter((_, idx) => idx !== i));

  const addSpareRow = () =>
    setSpareRows([
      ...spareRows,
      { itemName: "", partNumber: "", qty: "", unitPrice: "", total: 0 },
    ]);

  // === Calculations ===
  const summary = useMemo(() => {
    const spareTotal = spareRows.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0),
      0
    );

    const subtotal = spareTotal;
    const vatRate = 0.15;
    const vatAmount = vatSpare ? spareTotal * vatRate : 0;
    const grandTotal = Math.max(subtotal + vatAmount - discount, 0);

    return {
      subtotal,
      vatAmount,
      discount,
      grandTotal,
    };
  }, [spareRows, vatSpare, discount]);

  useEffect(() => {
    onChange?.({
      spares: spareRows,
      vatSpare,
      discount,
      summary,
    });
  }, [spareRows, vatSpare, discount, summary]);

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
      {/* SPARE COST TABLE */}
      <div className="border rounded-xl shadow-md bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 py-3 bg-gray-100 border-b">
          <button
            type="button"
            onClick={addSpareRow}
            className="px-5 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full sm:w-auto"
          >
            + Add New Row
          </button>
        </div>

        {/* Scrollable Table on Small Screens */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 text-xs sm:text-sm">
              <tr className="text-left text-gray-600">
                <th className="px-3 py-3">S.No</th>
                <th className="px-3 py-3">Description</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Unit Price</th>
                <th className="px-3 py-3">Total (ETB)</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {spareRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t even:bg-gray-50 hover:bg-gray-100 transition"
                >
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
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                      placeholder="Unit"
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
                      className="w-full min-w-[180px] sm:min-w-0 border rounded-lg px-4 py-3 text-base sm:text-sm focus:ring-2 focus:ring-blue-400  no-spinner"
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

        {/* VAT Checkbox */}
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

      {/* SUMMARY */}
      <div className="bg-white rounded-xl shadow-lg border p-6 space-y-4">
        {/* <h4 className="text-lg sm:text-xl font-bold text-gray-800">
          Final Cost Summary
        </h4> */}

        <div className="text-sm sm:text-base text-gray-700 space-y-3">
          <div className="flex justify-between">
            <span>Total (Without VAT)</span>
            <span className="font-semibold">
              {summary.subtotal.toFixed(2)} ETB
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total VAT</span>
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

export default FormalCostTables;
