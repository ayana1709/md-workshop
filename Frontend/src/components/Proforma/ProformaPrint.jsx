import React, { forwardRef } from "react";

const ProformaPrint = forwardRef(({ data }, ref) => {
  return (
    <div ref={ref} className="p-4 bg-white">
      <h2 className="text-xl font-bold mb-2">Proforma Invoice #{data.jobId}</h2>
      <p>
        <strong>Date:</strong> {data.date}
      </p>
      <p>
        <strong>Customer:</strong> {data.customerName}
      </p>
      <p>
        <strong>RefNum:</strong> {data.refNum}
      </p>
      <p>
        <strong>Prepared by:</strong> {data.preparedBy}
      </p>

      {/* Labour Items Table */}
      <table className="w-full mt-4 border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Description</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Est. Time</th>
            <th className="border p-2">Cost</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.labourRows?.map((row, i) => (
            <tr key={i}>
              <td className="border p-2">{row.description}</td>
              <td className="border p-2">{row.unit}</td>
              <td className="border p-2">{row.estTime}</td>
              <td className="border p-2">{row.cost}</td>
              <td className="border p-2">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Spare Items Table */}
      <table className="w-full mt-4 border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Description</th>
            <th className="border p-2">Unit</th>
            <th className="border p-2">Brand</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.spareRows?.map((row, i) => (
            <tr key={i}>
              <td className="border p-2">{row.description}</td>
              <td className="border p-2">{row.unit}</td>
              <td className="border p-2">{row.brand}</td>
              <td className="border p-2">{row.qty}</td>
              <td className="border p-2">{row.unitPrice}</td>
              <td className="border p-2">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="mt-4">
        <p>
          <strong>Total:</strong> {data.summary?.total}
        </p>
        <p>
          <strong>VAT:</strong> {data.summary?.totalVat}
        </p>
        <p>
          <strong>Gross Total:</strong> {data.summary?.grossTotal}
        </p>
        <p>
          <strong>Withholding:</strong> {data.summary?.withholding}
        </p>
        <p>
          <strong>Net Pay:</strong> {data.summary?.netPay}
        </p>
      </div>
    </div>
  );
});

export default ProformaPrint;
