import React, { useEffect } from "react";
import { toWords } from "number-to-words";

// Convert number to words
const numberToWords = (num) => {
  const safe = isFinite(num) ? num : 0;
  const [whole, decimal] = safe.toFixed(2).split(".");
  let words = toWords(Number(whole));
  if (Number(decimal) > 0) {
    words += ` and ${toWords(Number(decimal))} Cents`;
  }
  return words.charAt(0).toUpperCase() + words.slice(1) + " Birr";
};

function EditProformaTable({
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
  setSummary,
}) {
  const vatRate = 0.15;

  // ===== Handlers =====
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

  const handleSpareChange = (index, field, value) => {
    const updated = [...spareRows];
    updated[index][field] = value;

    if (field === "qty" || field === "unit_price") {
      const qty = parseFloat(updated[index].qty) || 0;
      const price = parseFloat(updated[index].unit_price) || 0;
      updated[index].total = qty * price;
    }

    setSpareRows(updated);
  };

  // ===== Row Controls =====
  const addLabourRow = () =>
    setLabourRows([
      ...labourRows,
      {
        description: "",
        unit: "",
        estTime: "",
        cost: "",
        total: 0,
        remark: "",
      },
    ]);
  const removeLabourRow = (i) =>
    setLabourRows(labourRows.filter((_, idx) => idx !== i));

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
        remark: "",
      },
    ]);
  const removeSpareRow = (i) =>
    setSpareRows(spareRows.filter((_, idx) => idx !== i));

  // ===== Subtotals & Totals =====
  const labourSubtotal = labourRows.reduce((sum, r) => sum + (r.total || 0), 0);
  const spareSubtotal = spareRows.reduce((sum, r) => sum + (r.total || 0), 0);

  const labourVatAmount = labourVat ? labourSubtotal * vatRate : 0;
  const spareVatAmount = spareVat ? spareSubtotal * vatRate : 0;

  const labourTotal = labourSubtotal + labourVatAmount;
  const spareTotal = spareSubtotal + spareVatAmount;

  const total = labourSubtotal + spareSubtotal;
  const totalVat = labourVatAmount + spareVatAmount;

  const grossTotal =
    total +
    totalVat +
    (parseFloat(otherCost) || 0) -
    (parseFloat(discount) || 0);
  const netPay = grossTotal;

  // Update summary whenever dependent values change
  useEffect(() => {
    setSummary({
      total,
      totalVat,
      grossTotal,
      netPay,
      netPayInWords: numberToWords(netPay),
    });
  }, [labourRows, spareRows, labourVat, spareVat, otherCost, discount]);

  // ===== Styles =====
  const tableHeaderStyle =
    "border px-3 py-2 text-xs sm:text-sm bg-blue-600 text-white sticky top-0 z-10";
  const cell = "border px-2 py-2";
  const input =
    "w-full px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all";
  const btn =
    "inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm shadow hover:bg-blue-700 active:scale-[.98]";

  return (
    <div className="space-y-10 p-3 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* ===== Labour Table ===== */}
      <div className="overflow-hidden border rounded-xl shadow-lg bg-white max-w-full">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-r flex-wrap gap-2">
          <h2 className="font-bold text-blue-900 text-lg">Labour</h2>
          <button onClick={addLabourRow} className={btn} type="button">
            + Add Row
          </button>
        </div>

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
                <th className={`${tableHeaderStyle} min-w-[100px]`}>Remark</th>
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
                    <textarea
                      value={row.description}
                      onChange={(e) =>
                        handleLabourChange(i, "description", e.target.value)
                      }
                      className={`${input} w-full resize-none`}
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
                      className={`${input} text-right`}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.cost}
                      onChange={(e) =>
                        handleLabourChange(i, "cost", e.target.value)
                      }
                      className={`${input} text-right`}
                    />
                  </td>
                  <td className={`${cell} text-right font-semibold`}>
                    {row.total.toFixed(2)}
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.remark}
                      onChange={(e) =>
                        handleLabourChange(i, "remark", e.target.value)
                      }
                      className={input}
                    />
                  </td>
                  <td className={cell}>
                    <button
                      onClick={() => removeLabourRow(i)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Labour Footer */}
        <div className="p-3 sm:p-4 flex flex-col md:flex-row justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
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

      {/* ===== Spare Table ===== */}
      <div className="overflow-hidden border rounded-xl shadow-lg bg-white max-w-full">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-gradient-to-r flex-wrap gap-2">
          <h2 className="font-bold text-blue-900 text-lg">Spare Items</h2>
          <button onClick={addSpareRow} className={btn} type="button">
            + Add Row
          </button>
        </div>

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
                <th className={`${tableHeaderStyle} min-w-[110px]`}>Remark</th>
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
                    <textarea
                      value={row.description}
                      onChange={(e) =>
                        handleSpareChange(i, "description", e.target.value)
                      }
                      className={`${input} w-full resize-none`}
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
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.qty}
                      onChange={(e) =>
                        handleSpareChange(i, "qty", e.target.value)
                      }
                      className={`${input} text-right`}
                    />
                  </td>
                  <td className={cell}>
                    <input
                      type="number"
                      value={row.unit_price}
                      onChange={(e) =>
                        handleSpareChange(i, "unit_price", e.target.value)
                      }
                      className={`${input} text-right`}
                    />
                  </td>
                  <td className={`${cell} text-right font-semibold`}>
                    {row.total.toFixed(2)}
                  </td>
                  <td className={cell}>
                    <input
                      type="text"
                      value={row.remark}
                      onChange={(e) =>
                        handleSpareChange(i, "remark", e.target.value)
                      }
                      className={input}
                    />
                  </td>
                  <td className={cell}>
                    <button
                      onClick={() => removeSpareRow(i)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Spare Footer */}
        <div className="p-3 sm:p-4 flex flex-col md:flex-row justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
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

      {/* ===== Summary ===== */}
      <div className="w-full max-w-2xl mx-auto rounded-2xl border shadow-lg p-4 sm:p-6 bg-white">
        <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">
          Proforma Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span>Total</span>
            <span>{total.toFixed(2)} Birr</span>
          </div>
          <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
            <span>Total VAT</span>
            <span>{totalVat.toFixed(2)} Birr</span>
          </div>
          <div className="flex justify-between rounded-lg px-3 py-2 border">
            <span>Other Cost</span>
            <input
              type="number"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
              className={`${input} w-24 text-right`}
            />
          </div>
          <div className="flex justify-between rounded-lg px-3 py-2 border">
            <span>Discount</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className={`${input} w-24 text-right`}
            />
          </div>
          <div className="flex justify-between bg-green-100 rounded-lg px-3 py-2 sm:col-span-2">
            <span className="font-bold text-green-700">Gross Total</span>
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
    </div>
  );
}

export default EditProformaTable;
