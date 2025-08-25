import { useStores } from "@/contexts/storeContext";
import React from "react";

const PrintableJobPage = React.forwardRef(
  ({ jobInfo, tasks, spares, otherCost, status, totalCost }, ref) => {
    const { companyData } = useStores();

    return (
      <div
        ref={ref}
        className="p-10 text-sm text-gray-800"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Company Header */}
        <div className="flex items-center border-b-2 border-gray-400 pb-4 mb-6">
          {/* Company Logo */}
          {companyData?.logo ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/storage/${
                companyData.logo
              }`}
              alt="Company Logo"
              className="h-24 object-contain"
            />
          ) : (
            <div className="h-20 w-20 bg-gray-200 flex items-center justify-center mr-4">
              <span className="text-xs text-gray-500">No Logo</span>
            </div>
          )}

          {/* Company Info */}
          <div>
            <h1 className="text-2xl font-bold">
              {companyData?.name_en || "My Workshop Company"}
            </h1>
            {companyData?.tagline && (
              <p className="italic text-gray-600">{companyData.tagline}</p>
            )}
            <p>{companyData?.address || "Addis Ababa, Ethiopia"}</p>
            <p>
              📞 {companyData?.phone || "N/A"}{" "}
              {companyData?.email && `| ✉ ${companyData.email}`}
            </p>
            {companyData?.website && (
              <p className="text-blue-600">{companyData.website}</p>
            )}
          </div>
        </div>

        {/* Job Info */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">
            Job Information
          </h2>
          <p>
            <strong>Job ID:</strong> {jobInfo.jobId}
          </p>
          <p>
            <strong>Customer:</strong> {jobInfo.customer_name}
          </p>
          <p>
            <strong>Mobile:</strong> {jobInfo.mobile}
          </p>
          <p>
            <strong>Product:</strong> {jobInfo.product_name}
          </p>
          <p>
            <strong>Status:</strong> {status}
          </p>
        </div>

        {/* Tasks */}
        {tasks?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 border-b pb-1">Tasks</h2>
            <table className="w-full border border-gray-300 text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Task Name</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Cost</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr key={i} className="odd:bg-gray-50">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{task.name}</td>
                    <td className="p-2 border capitalize">{task.status}</td>
                    <td className="p-2 border">{task.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Spares */}
        {spares?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 border-b pb-1">Spares</h2>
            <table className="w-full border border-gray-300 text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">#</th>
                  <th className="p-2 border">Spare Name</th>
                  <th className="p-2 border">Price</th>
                </tr>
              </thead>
              <tbody>
                {spares.map((spare, i) => (
                  <tr key={i} className="odd:bg-gray-50">
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{spare.name}</td>
                    <td className="p-2 border">{spare.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Costs */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 border-b pb-1">
            Cost Summary
          </h2>
          <p>
            <strong>Other Cost:</strong> {otherCost || 0}
          </p>
          <p className="text-lg font-bold">
            <strong>Total Cost:</strong> {totalCost || 0}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-xs border-t pt-4">
          <p>
            Thank you for trusting{" "}
            {companyData?.name_en || "My Workshop Company"} 🚗🔧
          </p>
          <p>Printed on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }
);

export default PrintableJobPage;
