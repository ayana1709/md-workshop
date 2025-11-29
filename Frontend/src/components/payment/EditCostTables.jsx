import React, { useState, useEffect } from "react";

function EditCostTables({ value = {}, onChange }) {
  const [labourRows, setLabourRows] = useState([]);
  const [spareRows, setSpareRows] = useState([]);
  const [otherRows, setOtherRows] = useState([]);
  const [vatLabour, setVatLabour] = useState(false);
  const [vatSpare, setVatSpare] = useState(false);
  const [vatOther, setVatOther] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    // Only run if there's a valid value object and not yet initialized
    if (!prefilled && value && Object.keys(value).length > 0) {
      setLabourRows(
        Array.isArray(value.labourCosts || value.labour)
          ? [...(value.labourCosts || value.labour)]
          : []
      );
      setSpareRows(
        Array.isArray(value.spareCosts || value.spares)
          ? [...(value.spareCosts || value.spares)]
          : []
      );
      setOtherRows(
        Array.isArray(value.otherCosts || value.others)
          ? [...(value.otherCosts || value.others)]
          : []
      );
      setVatLabour(value.vatLabour ?? false);
      setVatSpare(value.vatSpare ?? false);
      setVatOther(value.vatOther ?? false);
      setPrefilled(true);
    }
  }, [value?.id]); // ✅ Only refills when editing a new record

  // === Helpers to check real data ===
  const hasRealLabour = labourRows.some(
    (r) =>
      (r.description && r.description.trim() !== "") ||
      (r.time && r.time.trim() !== "") ||
      (r.total && parseFloat(r.total) > 0)
  );

  const hasRealSpare = spareRows.some(
    (r) =>
      (r.itemName && r.itemName.trim() !== "") ||
      (r.partNumber && r.partNumber.trim() !== "") ||
      (r.qty && parseFloat(r.qty) > 0) ||
      (r.unitPrice && parseFloat(r.unitPrice) > 0) ||
      (r.total && parseFloat(r.total) > 0)
  );

  const hasRealOther = otherRows.some(
    (r) =>
      (r.description && r.description.trim() !== "") ||
      (r.amount && parseFloat(r.amount) > 0)
  );

  // Notify parent with summary
  useEffect(() => {
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

    const summary = {
      labourTotal,
      spareTotal,
      otherTotal,
      subtotal,
      vatAmount,
      grandTotal: subtotal + vatAmount,
    };

    onChange?.({
      labourCosts: labourRows,
      spareCosts: spareRows,
      otherCosts: otherRows,
      vatLabour,
      vatSpare,
      vatOther,
      summary,
    });
  }, [
    labourRows,
    spareRows,
    otherRows,
    vatLabour,
    vatSpare,
    vatOther,
    onChange,
  ]);

  // === Row change handlers ===
  const handleLabourChange = (i, field, val) => {
    const updated = [...labourRows];
    updated[i][field] = field === "total" ? parseFloat(val) || 0 : val;
    setLabourRows(updated);
  };

  const handleSpareChange = (i, field, val) => {
    const updated = [...spareRows];
    if (["qty", "unitPrice"].includes(field)) {
      updated[i][field] = parseFloat(val) || 0;
      updated[i].total = updated[i].qty * updated[i].unitPrice;
    } else {
      updated[i][field] = val;
    }
    setSpareRows(updated);
  };

  const handleOtherChange = (i, field, val) => {
    const updated = [...otherRows];
    updated[i][field] = field === "amount" ? parseFloat(val) || 0 : val;
    setOtherRows(updated);
  };
  // Delete Button
  const DeleteButton = ({ onClick }) => (
    <button
      onClick={onClick}
      type="button"
      className="px-3 py-2 text-xs sm:text-sm text-white bg-red-500 hover:bg-red-600 rounded-md w-full sm:w-auto"
    >
      Delete
    </button>
  );

  // Add row
  const addLabourRow = () =>
    setLabourRows([...labourRows, { description: "", time: "", total: 0 }]);
  const addSpareRow = () =>
    setSpareRows([
      ...spareRows,
      { itemName: "", partNumber: "", qty: 0, unitPrice: 0, total: 0 },
    ]);
  const addOtherRow = () =>
    setOtherRows([...otherRows, { description: "", amount: 0 }]);

  // 🟣 Delete Labour Row
  // 🟣 Delete Labour Row
  const deleteLabourRow = (index) => {
    setLabourRows((prev) =>
      prev
        .map((row, i) =>
          i === index ? { description: "", time: "", total: 0 } : row
        )
        .filter(
          (row) => row.description !== "" || row.time !== "" || row.total !== 0
        )
    );
  };

  // 🟡 Delete Spare Row
  const deleteSpareRow = (index) => {
    setSpareRows((prev) =>
      prev
        .map((row, i) =>
          i === index
            ? { itemName: "", partNumber: "", qty: 0, unitPrice: 0, total: 0 }
            : row
        )
        .filter(
          (row) =>
            row.itemName !== "" ||
            row.partNumber !== "" ||
            row.qty !== 0 ||
            row.unitPrice !== 0 ||
            row.total !== 0
        )
    );
  };

  // 🟠 Delete Other Cost Row
  const deleteOtherRow = (index) => {
    setOtherRows((prev) =>
      prev
        .map((row, i) => (i === index ? { description: "", amount: 0 } : row))
        .filter((row) => row.description !== "" || row.amount !== 0)
    );
  };

  return (
    <div className="space-y-10">
      {/* LABOUR COST TABLE (Only show if real data exists) */}
      {(labourRows.length > 0 || hasRealLabour) && (
        <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b">
            <h3 className="text-lg font-semibold">Labour Cost</h3>
            <button
              type="button"
              onClick={addLabourRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + Add Row
            </button>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Estimation Time</th>
                <th className="px-4 py-2">Total Cost (ETB)</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {labourRows.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <input
                      value={row.description || ""}
                      onChange={(e) =>
                        handleLabourChange(i, "description", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={row.time || ""}
                      onChange={(e) =>
                        handleLabourChange(i, "time", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.total || 0}
                      onChange={(e) =>
                        handleLabourChange(i, "total", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1 no-spinner"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <DeleteButton onClick={() => deleteLabourRow(i)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end gap-3 px-4 py-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={vatLabour}
                onChange={(e) => setVatLabour(e.target.checked)}
              />
              Apply VAT (15%)
            </label>
          </div>
        </div>
      )}

      {/* SPARE COST TABLE */}
      {(spareRows.length > 0 || hasRealSpare) && (
        <div className="overflow-x-auto border rounded-xl shadow-md bg-white w-full max-w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 bg-gray-100 border-b">
            <h3 className="text-lg font-semibold text-gray-700"></h3>
            <button
              type="button"
              onClick={addSpareRow}
              className="w-full sm:w-auto px-5 py-3 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              + Add Row
            </button>
          </div>

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[650px] sm:min-w-full text-xs sm:text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-3 py-2">S.No</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Unit Price</th>
                  <th className="px-3 py-2">Total Price (ETB)</th>
                  <th className="px-4 py-2">Action</th>
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
                      <input
                        value={row.itemName || ""}
                        onChange={(e) =>
                          handleSpareChange(i, "itemName", e.target.value)
                        }
                        className="w-[160px] sm:w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Description"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        value={row.partNumber || ""}
                        onChange={(e) =>
                          handleSpareChange(i, "partNumber", e.target.value)
                        }
                        className="w-[120px] sm:w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400"
                        placeholder="Unit"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.qty || 0}
                        onChange={(e) =>
                          handleSpareChange(i, "qty", e.target.value)
                        }
                        className="w-[100px] sm:w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.unitPrice || 0}
                        onChange={(e) =>
                          handleSpareChange(i, "unitPrice", e.target.value)
                        }
                        className="w-[140px] sm:w-full border rounded-md px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 no-spinner"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.total || 0}
                        readOnly
                        className="w-[140px] sm:w-full border rounded-md px-3 py-2 text-xs sm:text-sm bg-gray-100 no-spinner"
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

          {/* VAT Option */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-4 py-2 text-sm text-gray-700">
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
      )}

      {/* OTHER COST TABLE */}
      {(spareRows.length > 0 || hasRealSpare) && (
        <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b">
            <h3 className="text-lg font-semibold">Other Costs</h3>
            <button
              type="button"
              onClick={addOtherRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + Add Other Cost
            </button>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Amount (ETB)</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {otherRows.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2">
                    <input
                      value={row.description || ""}
                      onChange={(e) =>
                        handleOtherChange(i, "description", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.amount || 0}
                      onChange={(e) =>
                        handleOtherChange(i, "amount", e.target.value)
                      }
                      className="w-full border rounded-md px-2 py-1 no-spinner"
                    />
                  </td>

                  <td className="px-3 py-2 text-center">
                    <DeleteButton onClick={() => deleteOtherRow(i)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end gap-3 px-4 py-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={vatOther}
                onChange={(e) => setVatOther(e.target.checked)}
              />
              Apply VAT (15%)
            </label>
          </div>
        </div>
      )}

      {/* SUMMARY always visible */}
      <div className="bg-white rounded-xl shadow-lg border p-6 space-y-3">
        <h4 className="text-lg font-bold text-gray-800">Final Cost Summary</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <div className="flex justify-between">
            <span>Total Cost (Without VAT)</span>
            <span className="font-semibold">
              {(
                labourRows.reduce(
                  (sum, r) => sum + (parseFloat(r.total) || 0),
                  0
                ) +
                spareRows.reduce(
                  (sum, r) => sum + (parseFloat(r.total) || 0),
                  0
                ) +
                otherRows.reduce(
                  (sum, r) => sum + (parseFloat(r.amount) || 0),
                  0
                )
              ).toFixed(2)}{" "}
              ETB
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total VAT Amount</span>
            <span className="font-semibold">
              {(
                (vatLabour
                  ? labourRows.reduce(
                      (sum, r) => sum + (parseFloat(r.total) || 0),
                      0
                    ) * 0.15
                  : 0) +
                (vatSpare
                  ? spareRows.reduce(
                      (sum, r) => sum + (parseFloat(r.total) || 0),
                      0
                    ) * 0.15
                  : 0) +
                (vatOther
                  ? otherRows.reduce(
                      (sum, r) => sum + (parseFloat(r.amount) || 0),
                      0
                    ) * 0.15
                  : 0)
              ).toFixed(2)}{" "}
              ETB
            </span>
          </div>
          <div className="flex justify-between text-green-700 font-bold border-t pt-2">
            <span>Grand Total</span>
            <span>
              {(
                labourRows.reduce(
                  (sum, r) => sum + (parseFloat(r.total) || 0),
                  0
                ) +
                spareRows.reduce(
                  (sum, r) => sum + (parseFloat(r.total) || 0),
                  0
                ) +
                otherRows.reduce(
                  (sum, r) => sum + (parseFloat(r.amount) || 0),
                  0
                ) +
                ((vatLabour
                  ? labourRows.reduce(
                      (sum, r) => sum + (parseFloat(r.total) || 0),
                      0
                    ) * 0.15
                  : 0) +
                  (vatSpare
                    ? spareRows.reduce(
                        (sum, r) => sum + (parseFloat(r.total) || 0),
                        0
                      ) * 0.15
                    : 0) +
                  (vatOther
                    ? otherRows.reduce(
                        (sum, r) => sum + (parseFloat(r.amount) || 0),
                        0
                      ) * 0.15
                    : 0))
              ).toFixed(2)}{" "}
              ETB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCostTables;
