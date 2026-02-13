import React, { useEffect, useState } from "react";
import api from "@/api";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";

export default function ManageReceipt() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get("/report/items-vat");
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    if (status === "NORMAL") return "bg-green-100 text-green-700";
    if (status === "LOW RISK") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-800">VAT Item Report</h1>

          {loading ? (
            <div className="text-gray-500">Loading report...</div>
          ) : reports.length === 0 ? (
            <div className="text-gray-500">No report data found.</div>
          ) : (
            reports.map((item) => (
              <div
                key={item.item_code}
                className="bg-white rounded-lg shadow border p-6 space-y-6"
              >
                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{item.item_name}</h2>
                    <p className="text-sm text-gray-500">
                      Item Code: {item.item_code}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* ================= PURCHASE TABLE ================= */}
                <div>
                  <h3 className="font-semibold mb-2">Purchase</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2">Receipt</th>
                          <th className="border px-3 py-2">Quantity</th>
                          <th className="border px-3 py-2">Total Price</th>
                          <th className="border px-3 py-2">VAT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.purchase_table.rows.map((row, i) => (
                          <tr key={i} className="text-center">
                            <td className="border px-2 py-1">
                              {row.with_receipt}
                            </td>
                            <td className="border px-2 py-1">{row.quantity}</td>
                            <td className="border px-2 py-1">
                              {row.total_purchase_price}
                            </td>
                            <td className="border px-2 py-1">{row.vat}</td>
                          </tr>
                        ))}

                        {/* TOTAL */}
                        <tr className="font-semibold bg-gray-50 text-center">
                          <td className="border px-2 py-1">TOTAL</td>
                          <td className="border px-2 py-1">
                            {item.purchase_table.total.quantity}
                          </td>
                          <td className="border px-2 py-1">
                            {item.purchase_table.total.total_purchase_price}
                          </td>
                          <td className="border px-2 py-1">
                            {item.purchase_table.total.vat}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ================= SALES TABLE ================= */}
                <div>
                  <h3 className="font-semibold mb-2">Sales</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-3 py-2">Receipt</th>
                          <th className="border px-3 py-2">Quantity</th>
                          <th className="border px-3 py-2">Total Price</th>
                          <th className="border px-3 py-2">VAT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.sales_table.rows.map((row, i) => (
                          <tr key={i} className="text-center">
                            <td className="border px-2 py-1">
                              {row.with_receipt}
                            </td>
                            <td className="border px-2 py-1">{row.quantity}</td>
                            <td className="border px-2 py-1">
                              {row.total_sell_price}
                            </td>
                            <td className="border px-2 py-1">{row.vat}</td>
                          </tr>
                        ))}

                        {/* TOTAL */}
                        <tr className="font-semibold bg-gray-50 text-center">
                          <td className="border px-2 py-1">TOTAL</td>
                          <td className="border px-2 py-1">
                            {item.sales_table.total.quantity}
                          </td>
                          <td className="border px-2 py-1">
                            {item.sales_table.total.total_sell_price}
                          </td>
                          <td className="border px-2 py-1">
                            {item.sales_table.total.vat}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ================= RECOMMENDATION ================= */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded text-sm text-blue-700">
                  <strong>Recommendation:</strong> {item.recommendation}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}
