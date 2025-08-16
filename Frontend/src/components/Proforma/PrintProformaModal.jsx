import React from "react";
import { useStores } from "@/contexts/storeContext";

function PrintProformaModal({ proforma, open, onClose }) {
  const { companyData } = useStores();

  if (!open || !proforma) return null;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-[90%] max-w-[210mm] max-h-[95vh] overflow-y-auto rounded-lg shadow-lg p-6 relative">
        {/* Printable Section */}
        <div id="print-section" className="text-black font-sans">
          {/* Header with red banner */}
          <div className="flex justify-between items-center bg-red-600 text-white p-4 mb-2">
            <div>
              <h1 className="text-xl font-bold">{companyData.name_en}</h1>
              <p>PROFORMA INVOICE</p>
            </div>
            {companyData.logo && (
              <img
                src={`${import.meta.env.VITE_API_URL}/storage/${
                  companyData.logo
                }`}
                alt="Logo"
                className="h-16 object-contain"
              />
            )}
          </div>

          {/* Top Info Section */}
          <div className="flex justify-between mb-4 text-sm">
            <div className="space-y-1">
              {companyData.address && <p>Address: {companyData.address}</p>}
              {companyData.phone && <p>Phone: {companyData.phone}</p>}
              {companyData.tin && <p>TIN No: {companyData.tin}</p>}
            </div>
            <div className="space-y-1">
              <p>Plate Number: __________</p>
              <p>Chassis No: __________</p>
              <p>Model: __________</p>
              <p>Customer TIN: {proforma.customer_tin || "__________"}</p>
              <p>Date: {proforma.date}</p>
              <p>Ref No: {proforma.ref_num}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border px-2 py-1">No</th>
                <th className="border px-2 py-1">Description</th>
                <th className="border px-2 py-1">Unit</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">Unit Price</th>
                <th className="border px-2 py-1">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...proforma.labour_items.map((i) => ({ ...i, type: "Labour" })),
                ...proforma.spare_items.map((i) => ({ ...i, type: "Spare" })),
              ].map((item, idx) => (
                <tr key={item.id} className="text-center">
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{item.description}</td>
                  <td className="border px-2 py-1">{item.unit || "-"}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                  <td className="border px-2 py-1">{item.unit_price}</td>
                  <td className="border px-2 py-1">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <div className="flex justify-between text-sm mt-2">
            <div className="space-y-1">
              <p>In Words: {proforma.net_pay_in_words}</p>
              <p>Proforma Validity: ____ days</p>
              <p>Date of Delivery: {proforma.delivery_date || "________"}</p>
              <p>Prepared By: {proforma.prepared_by}</p>
            </div>
            <div className="space-y-1 text-right">
              <p>Total: {proforma.total}</p>
              <p>VAT: {proforma.total_vat}</p>
              <p>Grand Total: {proforma.gross_total}</p>
            </div>
          </div>

          {/* Footer Contacts */}
          <div className="mt-6 text-sm">
            <p>Contacts: {companyData.phone}</p>
            <p>Email: {companyData.email}</p>
            <p>Website: {companyData.website}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end items-center gap-2 mt-4 no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            ✖ Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Print Now
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #print-section, #print-section * { visibility: visible; }
            #print-section { position: absolute; left: 0; top: 0; width: 210mm; padding: 10mm; }
            #print-section table { page-break-inside: avoid; }
            .no-print { display: none !important; }
          }
        `}
      </style>
    </div>
  );
}

export default PrintProformaModal;
