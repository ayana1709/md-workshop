import React, { useState, useEffect } from "react";
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

function ProformaTable({
  labourRows,
  setLabourRows,
  spareRows,
  setSpareRows,
  labourVat,
  setLabourVat,
  spareVat,
  setSpareVat,
  otherCost,
  setOtherCost,
  discount,
  setDiscount,
  setSummary, // ✅ new
}) {
  const vatRate = 0.15;

  // Handlers for Labour
  const handleLabourChange = (index, field, value) => {
    const updated = [...labourRows];
    updated[index][field] = value;

    // Calculate total for labour row (cost * estTime)
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

    // Ensure unit_price and qty are numbers, fallback to 0 if not valid
    if (field === "qty" || field === "unit_price") {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unit_price) || 0;
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
        unit_price: "",
        total: 0,
      },
    ]);
  const removeLabourRow = (i) =>
    setLabourRows(labourRows.filter((_, idx) => idx !== i));
  const removeSpareRow = (i) =>
    setSpareRows(spareRows.filter((_, idx) => idx !== i));

  // Subtotals for labour and spare
  const labourSubtotal = labourRows.reduce((sum, r) => sum + (r.total || 0), 0);
  const spareSubtotal = spareRows.reduce((sum, r) => sum + (r.total || 0), 0);

  // Calculate VAT amounts
  const labourVatAmount = labourVat ? labourSubtotal * vatRate : 0;
  const spareVatAmount = spareVat ? spareSubtotal * vatRate : 0;

  // Total calculations
  const labourTotal = labourSubtotal + labourVatAmount;
  const spareTotal = spareSubtotal + spareVatAmount;

  const total = labourTotal + spareTotal;
  const totalVat = labourVatAmount + spareVatAmount;
  const grossTotal =
    total + (parseFloat(otherCost) || 0) - (parseFloat(discount) || 0);
  const netPay = grossTotal;

  // Updating the summary whenever values change
  useEffect(() => {
    setSummary({
      total,
      totalVat,
      grossTotal,
      netPay,
      netPayInWords: numberToWords(netPay),
    });
  }, [labourRows, spareRows, labourVat, spareVat, otherCost, discount]);

  // Styles
  const tableHeaderStyle =
    "border px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white sticky top-0 z-10";
  const cell = "border px-2 py-2";
  const input =
    "w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all";
  const btn =
    "inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm shadow hover:bg-blue-700 active:scale-[.98]";

  return (
    <div className="space-y-10 p-3 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* === LABOUR TABLE === */}
      <div className="overflow-hidden border rounded-xl shadow-lg bg-white max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-r flex-wrap gap-2">
          <h2 className="font-bold text-blue-900 text-lg">Labour</h2>
          <button onClick={addLabourRow} className={btn} type="button">
            + Add Row
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className={`${tableHeaderStyle} min-w-[50px]`}>#</th>
                <th className={`${tableHeaderStyle} min-w-[200px]`}>
                  Work Description
                </th>
                <th className={`${tableHeaderStyle} min-w-[120px]`}>Unit</th>
                <th className={`${tableHeaderStyle} min-w-[120px]`}>
                  Est Time
                </th>
                <th className={`${tableHeaderStyle} min-w-[120px]`}>Cost</th>
                <th className={`${tableHeaderStyle} min-w-[100px]`}>Total</th>
                <th className={`${tableHeaderStyle} min-w-[80px]`}>Action</th>
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
                      className={`${input} w-full sm:w-auto min-w-[160px]`}
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
                      className={`${input} w-full sm:w-auto min-w-[120px]`}
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
                      className={`${input} w-full text-right no-arrows min-w-[120px] no-spinner`}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.cost}
                      onChange={(e) =>
                        handleLabourChange(i, "cost", e.target.value)
                      }
                      className={`${input} w-full text-right no-arrows min-w-[120px] no-spinner`}
                    />
                  </td>
                  <td
                    className={`${cell} text-right font-semibold min-w-[90px]`}
                  >
                    {row.total.toFixed(2)}
                  </td>
                  <td className={`${cell} min-w-[80px]`}>
                    <button
                      onClick={() => removeLabourRow(i)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm md:text-base"
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
        <div className="p-3 sm:p-4 flex flex-col md:flex-row justify-between gap-3 sm:gap-4 text-xs sm:text-sm md:text-base">
          <div className="text-gray-600 flex items-center gap-2">
            <input
              type="checkbox"
              checked={labourVat}
              onChange={() => setLabourVat((v) => !v)}
            />
            <span>Add VAT ({(vatRate * 100).toFixed(0)}%)</span>
          </div>
          <div className="text-right space-y-1">
            <div>Subtotal: {labourSubtotal.toFixed(2)}</div>
            <div>VAT: {labourVatAmount.toFixed(2)}</div>
            <div className="font-bold">Total: {labourTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* === SPARE CHANGE TABLE === */}
      {/* Same treatment as Labour Table */}
      <div className="overflow-hidden border rounded-xl shadow-lg bg-white max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-r flex-wrap gap-2">
          <h2 className="font-bold text-blue-900 text-lg">Spare Change</h2>
          <button onClick={addSpareRow} className={btn} type="button">
            + Add Row
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs sm:text-sm md:text-base">
            <thead>
              <tr>
                <th className={`${tableHeaderStyle} min-w-[50px]`}>#</th>
                <th className={`${tableHeaderStyle} min-w-[200px]`}>
                  Item Description
                </th>
                <th className={`${tableHeaderStyle} min-w-[120px]`}>Unit</th>
                <th className={`${tableHeaderStyle} min-w-[140px]`}>Brand</th>
                <th className={`${tableHeaderStyle} min-w-[100px]`}>Qty</th>
                <th className={`${tableHeaderStyle} min-w-[120px]`}>
                  Unit Price
                </th>
                <th className={`${tableHeaderStyle} min-w-[110px]`}>Total</th>
                <th className={`${tableHeaderStyle} min-w-[90px]`}>Action</th>
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
                      className={`${input} w-full sm:w-auto min-w-[180px]`}
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
                      className={`${input} w-full sm:w-auto min-w-[120px]`}
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
                      className={`${input} w-full sm:w-auto min-w-[140px]`}
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
                      className={`${input} w-full text-right no-arrows min-w-[100px] no-spinner`}
                    />
                  </td>

                  <td className={cell}>
                    <input
                      type="number"
                      value={row.unit_price}
                      onChange={(e) =>
                        handleSpareChange(i, "unit_price", e.target.value)
                      }
                      className={`${input} w-full text-right no-arrows min-w-[120px] no-spinner`}
                    />
                  </td>

                  <td
                    className={`${cell} text-right font-semibold min-w-[110px]`}
                  >
                    {row.total.toFixed(2)}
                  </td>

                  <td className={`${cell} min-w-[90px]`}>
                    <button
                      onClick={() => removeSpareRow(i)}
                      className="text-red-600 hover:text-red-800 text-xs sm:text-sm md:text-base"
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
        <div className="p-3 sm:p-4 flex flex-col md:flex-row justify-between gap-3 sm:gap-4 text-xs sm:text-sm md:text-base">
          <div className="text-gray-600 flex items-center gap-2">
            <input
              type="checkbox"
              checked={spareVat}
              onChange={() => setSpareVat((v) => !v)}
            />
            <span>Add VAT ({(vatRate * 100).toFixed(0)}%)</span>
          </div>
          <div className="text-right space-y-1">
            <div>Subtotal: {spareSubtotal.toFixed(2)}</div>
            <div>VAT: {spareVatAmount.toFixed(2)}</div>
            <div className="font-bold">Total: {spareTotal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* === PROFORMA SUMMARY === */}
      <div className="w-full max-w-2xl mx-auto rounded-2xl border shadow-lg p-4 sm:p-6 bg-white">
        <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">
          Proforma Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm md:text-base">
          {/* Total */}
          <div className="flex flex-wrap items-center justify-between bg-gray-50 rounded-lg px-3 py-2 gap-2">
            <span>Total</span>
            <span className="font-medium whitespace-nowrap">
              {total.toFixed(2)} Birr
            </span>
          </div>

          {/* VAT */}
          <div className="flex flex-wrap items-center justify-between bg-gray-50 rounded-lg px-3 py-2 gap-2">
            <span>Total VAT</span>
            <span className="font-medium whitespace-nowrap">
              {totalVat.toFixed(2)} Birr
            </span>
          </div>

          {/* Other Cost */}
          <div className="flex flex-wrap items-center justify-between rounded-lg px-3 py-2 border gap-2">
            <span>Other Cost</span>
            <input
              type="number"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
              className={`${input} w-full sm:w-28 text-right no-arrows`}
            />
          </div>

          {/* Discount */}
          <div className="flex flex-wrap items-center justify-between rounded-lg px-3 py-2 border gap-2">
            <span>Discount</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className={`${input} w-full sm:w-28 text-right no-arrows`}
            />
          </div>

          {/* Net Pay */}
          <div className="flex flex-wrap items-center justify-between bg-green-100 rounded-lg px-3 py-2 gap-2 sm:col-span-2">
            <span className="font-bold text-green-700">Gross Total</span>
            <span className="font-bold text-green-700 whitespace-nowrap">
              {netPay.toFixed(2)} Birr
            </span>
          </div>
        </div>

        {/* In Words */}
        <div className="mt-4 text-sm italic text-gray-600">
          <span className="font-semibold">In Words:</span>{" "}
          {numberToWords(netPay)}
        </div>
      </div>
    </div>
  );
}

export default ProformaTable;
