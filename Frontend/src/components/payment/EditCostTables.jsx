import React, { useState, useEffect } from "react";

function EditCostTables({ value = {}, onChange }) {
  const [labourRows, setLabourRows] = useState([
    { description: "", time: "", total: 0 },
  ]);
  const [spareRows, setSpareRows] = useState([
    { itemName: "", partNumber: "", qty: 0, unitPrice: 0, total: 0 },
  ]);
  const [otherRows, setOtherRows] = useState([{ description: "", amount: 0 }]);

  const [vatLabour, setVatLabour] = useState(false);
  const [vatSpare, setVatSpare] = useState(false);
  const [vatOther, setVatOther] = useState(false);

  // Prefill from parent
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!prefilled && value) {
      console.log("Prefilling EditCostTables with:", value);
      setLabourRows(Array.isArray(value.labour) ? value.labour : []);
      setSpareRows(Array.isArray(value.spares) ? value.spares : []);
      setOtherRows(Array.isArray(value.others) ? value.others : []);
      setVatLabour(value.vatLabour ?? false);
      setVatSpare(value.vatSpare ?? false);
      setVatOther(value.vatOther ?? false);
      setPrefilled(true);
    }
  }, [value, prefilled]);

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

  // === Handlers ===
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

  const addLabourRow = () =>
    setLabourRows([...labourRows, { description: "", time: "", total: 0 }]);
  const addSpareRow = () =>
    setSpareRows([
      ...spareRows,
      { itemName: "", partNumber: "", qty: 0, unitPrice: 0, total: 0 },
    ]);
  const addOtherRow = () =>
    setOtherRows([...otherRows, { description: "", amount: 0 }]);

  return (
    <div className="space-y-10">
      {/* LABOUR COST */}
      <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
        <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b">
          <h3 className="text-lg font-semibold">Labour Cost</h3>
          <button
            type="button"
            onClick={addLabourRow}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Add Labour Row
          </button>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Estimation Time</th>
              <th className="px-4 py-2">Total Cost (ETB)</th>
            </tr>
          </thead>
          <tbody>
            {labourRows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  <input
                    value={row.description}
                    onChange={(e) =>
                      handleLabourChange(i, "description", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={row.time}
                    onChange={(e) =>
                      handleLabourChange(i, "time", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.total}
                    onChange={(e) =>
                      handleLabourChange(i, "total", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1 no-spinner"
                  />
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

      {/* SPARE COST */}
      <div className="overflow-x-auto border rounded-xl shadow-md bg-white">
        <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b">
          <h3 className="text-lg font-semibold">Spare Cost</h3>
          <button
            type="button"
            onClick={addSpareRow}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            + Add Spare Row
          </button>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Item Name</th>
              <th className="px-4 py-2">Part Number</th>
              <th className="px-4 py-2">Request Qty</th>
              <th className="px-4 py-2">Unit Price</th>
              <th className="px-4 py-2">Total Price (ETB)</th>
            </tr>
          </thead>
          <tbody>
            {spareRows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  <input
                    value={row.itemName}
                    onChange={(e) =>
                      handleSpareChange(i, "itemName", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={row.partNumber}
                    onChange={(e) =>
                      handleSpareChange(i, "partNumber", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      handleSpareChange(i, "qty", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1 no-spinner"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) =>
                      handleSpareChange(i, "unitPrice", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1 no-spinner"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.total}
                    readOnly
                    className="w-full border rounded-md px-2 py-1 bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-end gap-3 px-4 py-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={vatSpare}
              onChange={(e) => setVatSpare(e.target.checked)}
            />
            Apply VAT (15%)
          </label>
        </div>
      </div>

      {/* OTHER COST */}
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
            </tr>
          </thead>
          <tbody>
            {otherRows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">
                  <input
                    value={row.description}
                    onChange={(e) =>
                      handleOtherChange(i, "description", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) =>
                      handleOtherChange(i, "amount", e.target.value)
                    }
                    className="w-full border rounded-md px-2 py-1 no-spinner"
                  />
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

      {/* SUMMARY */}
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
              {(vatLabour
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
                  : 0
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
