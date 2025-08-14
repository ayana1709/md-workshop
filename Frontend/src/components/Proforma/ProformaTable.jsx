import React, { useState } from "react";
import { toWords } from "number-to-words";

const numberToWords = (num) => {
  const [whole, decimal] = num.toFixed(2).split(".");
  let words = toWords(Number(whole));
  if (Number(decimal) > 0) {
    words += ` and ${toWords(Number(decimal))} Cents`;
  }
  return words.charAt(0).toUpperCase() + words.slice(1) + " Birr";
};

function ProformaTable() {
  // Labour and Spare rows
  const [labourRows, setLabourRows] = useState([
    { description: "", unit: "", estTime: "", cost: "", total: 0 },
  ]);
  const [spareRows, setSpareRows] = useState([
    { description: "", unit: "", brand: "", qty: "", unitPrice: "", total: 0 },
  ]);

  // VAT toggles
  const [labourVat, setLabourVat] = useState(false);
  const [spareVat, setSpareVat] = useState(false);

  // Other costs and discount
  const [otherCost, setOtherCost] = useState(0);
  const [discount, setDiscount] = useState(0);

  const vatRate = 0.15;
  const withholdingRate = 0.02;

  // Handlers for Labour
  const handleLabourChange = (index, field, value) => {
    const updated = [...labourRows];
    updated[index][field] = value;
    if (field === "cost" || field === "estTime") {
      const cost = parseFloat(updated[index].cost) || 0;
      const time = parseFloat(updated[index].estTime) || 0;
      updated[index].total = cost * time;
    }
    setLabourRows(updated);
  };

  // Handlers for Spare
  const handleSpareChange = (index, field, value) => {
    const updated = [...spareRows];
    updated[index][field] = value;
    if (field === "qty" || field === "unitPrice") {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unitPrice) || 0;
      updated[index].total = qty * price;
    }
    setSpareRows(updated);
  };

  // Row controls
  const addLabourRow = () =>
    setLabourRows([
      ...labourRows,
      { description: "", unit: "", estTime: "", cost: "", total: 0 },
    ]);
  const addSpareRow = () =>
    setSpareRows([
      ...spareRows,
      {
        description: "",
        unit: "",
        brand: "",
        qty: "",
        unitPrice: "",
        total: 0,
      },
    ]);
  const removeLabourRow = (i) =>
    setLabourRows(labourRows.filter((_, idx) => idx !== i));
  const removeSpareRow = (i) =>
    setSpareRows(spareRows.filter((_, idx) => idx !== i));

  // Subtotals
  const labourSubtotal = labourRows.reduce((sum, r) => sum + (r.total || 0), 0);
  const spareSubtotal = spareRows.reduce((sum, r) => sum + (r.total || 0), 0);

  // Apply VAT if selected
  const labourTotal =
    labourSubtotal + (labourVat ? labourSubtotal * vatRate : 0);
  const spareTotal = spareSubtotal + (spareVat ? spareSubtotal * vatRate : 0);

  // Proforma Summary Calculations
  const total = labourTotal + spareTotal;
  const totalVat =
    (labourVat ? labourSubtotal * vatRate : 0) +
    (spareVat ? spareSubtotal * vatRate : 0);
  const grossTotal =
    total + parseFloat(otherCost || 0) - parseFloat(discount || 0);
  const withholding = grossTotal * withholdingRate;
  const netPay = grossTotal - withholding;

  return (
    <div className="space-y-10">
      {/* === Labour Table === */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <h2 className="bg-gray-200 p-2 font-bold">Labour</h2>
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Work Description</th>
              <th className="border px-3 py-2">Unit</th>
              <th className="border px-3 py-2">Est Time</th>
              <th className="border px-3 py-2">Cost</th>
              <th className="border px-3 py-2">Total</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {labourRows.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border">{i + 1}</td>
                <td className="border">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) =>
                      handleLabourChange(i, "description", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border">
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) =>
                      handleLabourChange(i, "unit", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border">
                  <input
                    type="number"
                    value={row.estTime}
                    onChange={(e) =>
                      handleLabourChange(i, "estTime", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded text-right"
                  />
                </td>
                <td className="border">
                  <input
                    type="number"
                    value={row.cost}
                    onChange={(e) =>
                      handleLabourChange(i, "cost", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded text-right"
                  />
                </td>
                <td className="border text-right">{row.total.toFixed(2)}</td>
                <td className="border">
                  <button
                    onClick={() => removeLabourRow(i)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 flex justify-between">
          <button
            onClick={addLabourRow}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Add Row
          </button>
          <div className="text-right space-y-2">
            <div>Subtotal: {labourSubtotal.toFixed(2)}</div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={labourVat}
                onChange={() => setLabourVat(!labourVat)}
              />
              Add VAT ({vatRate * 100}%)
            </label>
            <div className="font-bold">Total: {labourTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* === Spare Change Table === */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <h2 className="bg-gray-200 p-2 font-bold">Spare Change</h2>
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="border px-3 py-2">#</th>
              <th className="border px-3 py-2">Item Description</th>
              <th className="border px-3 py-2">Unit</th>
              <th className="border px-3 py-2">Brand</th>
              <th className="border px-3 py-2">Qty</th>
              <th className="border px-3 py-2">Unit Price</th>
              <th className="border px-3 py-2">Total</th>
              <th className="border px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {spareRows.map((row, i) => (
              <tr key={i} className="text-center">
                <td className="border">{i + 1}</td>
                <td className="border">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) =>
                      handleSpareChange(i, "description", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border">
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) =>
                      handleSpareChange(i, "unit", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border">
                  <input
                    type="text"
                    value={row.brand}
                    onChange={(e) =>
                      handleSpareChange(i, "brand", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded"
                  />
                </td>
                <td className="border">
                  <input
                    type="number"
                    value={row.qty}
                    onChange={(e) =>
                      handleSpareChange(i, "qty", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded text-right"
                  />
                </td>
                <td className="border">
                  <input
                    type="number"
                    value={row.unitPrice}
                    onChange={(e) =>
                      handleSpareChange(i, "unitPrice", e.target.value)
                    }
                    className="w-full px-2 py-1 border rounded text-right"
                  />
                </td>
                <td className="border text-right">{row.total.toFixed(2)}</td>
                <td className="border">
                  <button
                    onClick={() => removeSpareRow(i)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 flex justify-between">
          <button
            onClick={addSpareRow}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Add Row
          </button>
          <div className="text-right space-y-2">
            <div>Subtotal: {spareSubtotal.toFixed(2)}</div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={spareVat}
                onChange={() => setSpareVat(!spareVat)}
              />
              Add VAT ({vatRate * 100}%)
            </label>
            <div className="font-bold">Total: {spareTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* === Proforma Summary === */}
      <div className="w-full max-w-lg ml-auto mt-8 rounded-2xl border shadow-lg p-6 bg-white">
        <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">
          Proforma Summary
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{total.toFixed(2)} Birr</span>
          </div>
          <div className="flex justify-between">
            <span>Total VAT</span>
            <span>{totalVat.toFixed(2)} Birr</span>
          </div>
          <div className="flex justify-between">
            <span>Other Cost</span>
            <input
              type="number"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
              className="w-24 text-right border rounded px-1"
            />
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-24 text-right border rounded px-1"
            />
          </div>
          <div className="flex justify-between">
            <span>Add Withdrawal (2%)</span>
            <span>{withholding.toFixed(2)} Birr</span>
          </div>
          <div className="flex justify-between font-bold text-green-600 text-base pt-3 border-t">
            <span>Gross Total</span>
            <span>{grossTotal.toFixed(2)} Birr</span>
          </div>
          <div className="flex justify-between font-bold text-green-600 text-base">
            <span>Net Pay</span>
            <span>{netPay.toFixed(2)} Birr</span>
          </div>
        </div>

        <div className="mt-4 text-sm italic text-gray-500">
          <span className="font-semibold">In Words:</span>{" "}
          {numberToWords(netPay)}
        </div>
      </div>
    </div>
  );
}

export default ProformaTable;
