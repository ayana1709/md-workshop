import React from "react";
// import { useStores } from "../context/StoreContext"; // your store context
import { format } from "date-fns";
import { useStores } from "@/contexts/storeContext";

export default function ProformaListPage() {
  const { companyData, proformas } = useStores(); // get both from context
  console.log("Company Data:", companyData);
  console.log("Proformas:", proformas);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Company Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          {companyData?.logo && (
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/${
                companyData.logo
              }`}
              alt="Company Logo"
              className="h-16 mb-2"
            />
          )}
          <h1 className="text-2xl font-bold">
            {companyData?.name || "Company Name"}
          </h1>
          <p className="text-sm text-gray-600">{companyData?.address}</p>
          <p className="text-sm text-gray-600">
            Phone: {companyData?.phone} | Email: {companyData?.email}
          </p>
        </div>
      </div>

      {/* Page Title */}
      <h2 className="text-xl font-semibold mb-4">Proforma List</h2>

      {/* Proforma Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3 border">#</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Job ID</th>
              <th className="p-3 border">Customer</th>
              <th className="p-3 border">Product Name</th>
              <th className="p-3 border">Prepared By</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {proformas.length > 0 ? (
              proformas.map((proforma, index) => (
                <tr key={proforma.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">
                    {format(new Date(proforma.date), "yyyy-MM-dd")}
                  </td>
                  <td className="p-3 border">{proforma.jobId}</td>
                  <td className="p-3 border">{proforma.customerName}</td>
                  <td className="p-3 border">{proforma.product_name}</td>
                  <td className="p-3 border">{proforma.preparedBy}</td>
                  <td className="p-3 border">
                    <button
                      onClick={() =>
                        window.open(`/proforma-print/${proforma.id}`)
                      }
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 p-4 border"
                >
                  No proformas found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
