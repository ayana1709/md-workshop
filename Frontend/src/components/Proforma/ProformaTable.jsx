import React, { useState } from "react";
import { toWords } from "number-to-words";

const numberToWords = (num) => {
  const safe = isFinite(num) ? num : 0;
  const [whole, decimal] = safe.toFixed(2).split(".");
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
  const labourVatAmount = labourVat ? labourSubtotal * vatRate : 0;
  const spareVatAmount = spareVat ? spareSubtotal * vatRate : 0;

  const labourTotal = labourSubtotal + labourVatAmount;
  const spareTotal = spareSubtotal + spareVatAmount;

  // Proforma Summary Calculations
  const total = labourTotal + spareTotal;
  const totalVat = labourVatAmount + spareVatAmount;
  const grossTotal =
    total + (parseFloat(otherCost) || 0) - (parseFloat(discount) || 0);
  const withholding = grossTotal * withholdingRate;
  const netPay = grossTotal - withholding;

  // Styles
  const tableHeaderStyle =
    "border px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white sticky top-0 z-10";
  const cell = "border px-2 py-2";
  const input =
    "w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all";
  const btn =
    "inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm shadow hover:bg-blue-700 active:scale-[.98]";

  return (
    <div className="space-y-10 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* === LABOUR TABLE === */}
      <div className="overflow-hidden border rounded-xl shadow-lg bg-white">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-200">
          <h2 className="font-bold text-blue-900">Labour</h2>
          <button onClick={addLabourRow} className={btn} type="button">
            + Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className={tableHeaderStyle}>#</th>
                <th className={tableHeaderStyle}>Work Description</th>
                <th className={tableHeaderStyle}>Unit</th>
                <th className={tableHeaderStyle}>Est Time</th>
                <th className={tableHeaderStyle}>Cost</th>
                <th className={tableHeaderStyle}>Total</th>
                <th className={tableHeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {labourRows.map((row, i) => (
                <tr
                  key={i}
                  className="text-center hover:bg-blue-50 transition-colors even:bg-gray-50"
                >
                  <td className={cell}>{i + 1}</td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleLabourChange(i, "description", e.target.value)
                      }
                      className={input}
                      placeholder="Describe work..."
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) =>
                        handleLabourChange(i, "unit", e.target.value)
                      }
                      className={input}
                      placeholder="hr / job"
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.estTime}
                      onChange={(e) =>
                        handleLabourChange(i, "estTime", e.target.value)
                      }
                      className={`${input} text-right no-arrows`}
                      placeholder="0"
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.cost}
                      onChange={(e) =>
                        handleLabourChange(i, "cost", e.target.value)
                      }
                      className={`${input} text-right no-arrows`}
                      placeholder="0.00"
                    />
                  </td>
                  <td className={`${cell} text-right font-semibold`}>
                    {row.total.toFixed(2)}
                  </td>
                  <td className={cell}>
                    <button
                      onClick={() => removeLabourRow(i)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      type="button"
                      title="Delete row"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="text-sm text-gray-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={labourVat}
                onChange={() => setLabourVat((v) => !v)}
              />
              <span>Add VAT ({(vatRate * 100).toFixed(0)}%)</span>
            </label>
          </div>
          <div className="text-right space-y-1">
            <div>Subtotal: {labourSubtotal.toFixed(2)}</div>
            <div>VAT: {labourVatAmount.toFixed(2)}</div>
            <div className="font-bold">Total: {labourTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* === SPARE CHANGE TABLE === */}
      <div className="overflow-hidden border rounded-xl shadow-lg bg-white">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-100 to-emerald-200">
          <h2 className="font-bold text-emerald-900">Spare Change</h2>
          <button onClick={addSpareRow} className={btn} type="button">
            + Add Row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className={tableHeaderStyle}>#</th>
                <th className={tableHeaderStyle}>Item Description</th>
                <th className={tableHeaderStyle}>Unit</th>
                <th className={tableHeaderStyle}>Brand</th>
                <th className={tableHeaderStyle}>Qty</th>
                <th className={tableHeaderStyle}>Unit Price</th>
                <th className={tableHeaderStyle}>Total</th>
                <th className={tableHeaderStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {spareRows.map((row, i) => (
                <tr
                  key={i}
                  className="text-center hover:bg-emerald-50 transition-colors even:bg-gray-50"
                >
                  <td className={cell}>{i + 1}</td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        handleSpareChange(i, "description", e.target.value)
                      }
                      className={input}
                      placeholder="Describe item..."
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.unit}
                      onChange={(e) =>
                        handleSpareChange(i, "unit", e.target.value)
                      }
                      className={input}
                      placeholder="pcs / set"
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.brand}
                      onChange={(e) =>
                        handleSpareChange(i, "brand", e.target.value)
                      }
                      className={input}
                      placeholder="Brand"
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) =>
                        handleSpareChange(i, "qty", e.target.value)
                      }
                      className={`${input} text-right no-arrows`}
                      placeholder="0"
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) =>
                        handleSpareChange(i, "unitPrice", e.target.value)
                      }
                      className={`${input} text-right no-arrows`}
                      placeholder="0.00"
                    />
                  </td>
                  <td className={`${cell} text-right font-semibold`}>
                    {row.total.toFixed(2)}
                  </td>
                  <td className={cell}>
                    <button
                      onClick={() => removeSpareRow(i)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      type="button"
                      title="Delete row"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="text-sm text-gray-600">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={spareVat}
                onChange={() => setSpareVat((v) => !v)}
              />
              <span>Add VAT ({(vatRate * 100).toFixed(0)}%)</span>
            </label>
          </div>
          <div className="text-right space-y-1">
            <div>Subtotal: {spareSubtotal.toFixed(2)}</div>
            <div>VAT: {spareVatAmount.toFixed(2)}</div>
            <div className="font-bold">Total: {spareTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* === PROFORMA SUMMARY === */}
      <div className="w-full max-w-2xl ml-auto rounded-2xl border shadow-lg p-6 bg-white">
        <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">
          Proforma Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span>Total</span>
            <span className="font-medium">{total.toFixed(2)} Birr</span>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span>Total VAT</span>
            <span className="font-medium">{totalVat.toFixed(2)} Birr</span>
          </div>

          <div className="flex items-center justify-between rounded-lg px-3 py-2 border">
            <span>Other Cost</span>
            <input
              type="number"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
              className={`${input} w-28 text-right no-arrows`}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg px-3 py-2 border">
            <span>Discount</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className={`${input} w-28 text-right no-arrows`}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2 sm:col-span-2">
            <span>Withholding / Withdrawal (2%)</span>
            <span className="font-medium">{withholding.toFixed(2)} Birr</span>
          </div>

          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 sm:col-span-2">
            <span className="font-semibold">Gross Total</span>
            <span className="font-semibold">{grossTotal.toFixed(2)} Birr</span>
          </div>

          <div className="flex items-center justify-between bg-green-100 rounded-lg px-3 py-2 sm:col-span-2">
            <span className="font-bold text-green-700">Net Pay</span>
            <span className="font-bold text-green-700">
              {netPay.toFixed(2)} Birr
            </span>
          </div>
        </div>

        <div className="mt-4 text-sm italic text-gray-600">
          <span className="font-semibold">In Words:</span>{" "}
          {numberToWords(netPay)}
        </div>
      </div>

      {/* Remove arrows from number inputs */}
      <style>
        {`
          /* Chrome, Safari, Edge, Opera */
          .no-arrows::-webkit-outer-spin-button,
          .no-arrows::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          /* Firefox */
          .no-arrows[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
    </div>
  );
}

export default ProformaTable;
