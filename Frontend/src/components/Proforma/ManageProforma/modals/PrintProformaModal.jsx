import { useStores } from "@/contexts/storeContext";
import React from "react";
// import { useStores } from "../contexts/storeContext";

function ProformaPrint({ proforma, open, onClose }) {
  const { companyData } = useStores();

  if (!open || !proforma) return null;

  const handlePrint = () => {
    window.print();
  };

  // Split items into Labor & Spare
  const laborItems = proforma.items?.filter((i) => i.type === "labor") || [];
  const spareItems = proforma.items?.filter((i) => i.type === "spare") || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white w-[900px] max-h-[95vh] overflow-y-auto rounded-lg shadow-lg p-8 relative print:w-[210mm] print:h-[297mm] print:p-10">
        {/* Print Section */}
        <div id="print-section" className="font-sans text-sm text-black">
          {/* Header Section */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            {/* Left: Logo */}
            <div>
              {companyData?.logo && (
                <img
                  src={`${import.meta.env.VITE_API_URL}/storage/${
                    companyData.logo
                  }`}
                  alt="Company Logo"
                  className="h-20"
                />
              )}
            </div>

            {/* Right: Company Name */}
            <div className="text-right">
              <h2 className="font-bold text-red-600 text-lg">
                {companyData?.name_am || "የኩባንያ ስም"}
              </h2>
              <h2 className="font-bold text-gray-800 text-lg uppercase">
                {companyData?.name_en || "Company Name"}
              </h2>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="font-bold text-xl text-white bg-red-600 py-2 rounded-md">
              የቅድመ ክፍያ ደረሰኝ / PROFORMA INVOICE
            </h3>
          </div>

          {/* Customer Info */}
          <div className="mb-4 text-sm">
            <p className="font-semibold">To: {proforma.customer_name}</p>
            <p>Address: {proforma.customer_address || "----"}</p>
            <p>Customer TIN: {proforma.customer_tin || "----"}</p>
            <p>Date: {proforma.date}</p>
            <p>Ref No: {proforma.ref_no}</p>
          </div>

          {/* Labor Table */}
          {laborItems.length > 0 && (
            <>
              <h4 className="mt-4 mb-2 font-bold text-gray-700 underline">
                Labor Charges
              </h4>
              <table className="w-full border-collapse text-sm mb-6">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th className="border px-2 py-1 w-12">No</th>
                    <th className="border px-2 py-1">Description</th>
                    <th className="border px-2 py-1 w-20">Qty</th>
                    <th className="border px-2 py-1 w-24">Unit Price</th>
                    <th className="border px-2 py-1 w-28">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {laborItems.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="border px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-1">{item.description}</td>
                      <td className="border px-2 py-1 text-center">
                        {item.qty}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {item.unit_price}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {item.total_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Spare Table */}
          {spareItems.length > 0 && (
            <>
              <h4 className="mt-4 mb-2 font-bold text-gray-700 underline">
                Spare Parts
              </h4>
              <table className="w-full border-collapse text-sm mb-6">
                <thead>
                  <tr className="bg-gray-200 text-gray-800">
                    <th className="border px-2 py-1 w-12">No</th>
                    <th className="border px-2 py-1">Description</th>
                    <th className="border px-2 py-1 w-20">Qty</th>
                    <th className="border px-2 py-1 w-24">Unit Price</th>
                    <th className="border px-2 py-1 w-28">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {spareItems.map((item, index) => (
                    <tr key={index} className="border">
                      <td className="border px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="border px-2 py-1">{item.description}</td>
                      <td className="border px-2 py-1 text-center">
                        {item.qty}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {item.unit_price}
                      </td>
                      <td className="border px-2 py-1 text-right">
                        {item.total_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-1/3 space-y-1 text-sm">
              <p>Total: {proforma.total} Birr</p>
              <p>VAT (15%): {proforma.vat} Birr</p>
              <p className="font-bold border-t pt-1">
                Grand Total: {proforma.net_pay} Birr
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="mt-12 text-sm border-t pt-4 flex justify-between">
            <div>
              <p className="font-semibold">
                Prepared By: {proforma.prepared_by}
              </p>
              <p>Signature: ___________________</p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p>Tel: {companyData?.phone || "---"}</p>
              <p>Email: {companyData?.email || "---"}</p>
              <p>Website: {companyData?.website || "---"}</p>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-center gap-4 mt-6 no-print">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProformaPrint;
