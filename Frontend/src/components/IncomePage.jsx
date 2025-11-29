import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import React, { useEffect, useState } from "react";
import api from "@/api"; // assuming you use axios instance as api

export default function IncomePage() {
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch sales + payments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, paymentsRes] = await Promise.all([
          api.get("/sales"),
          api.get("/payments"),
        ]);

        const sales = salesRes.data.map((s) => ({
          id: `sale-${s.id}`,
          date: s.sales_date,
          customer: s.customer_name || s.company_name || "N/A",
          totalAmount: parseFloat(s.total_amount),
          paidAmount: parseFloat(s.paid_amount),
          remainingAmount: parseFloat(s.due_amount),
          status: s.payment_status,
          method: s.payment_type || "N/A",
          type: "Sale",
        }));

        const payments = paymentsRes.data.map((p) => ({
          id: `payment-${p.id}`,
          date: p.date,
          customer: p.name || "N/A",
          totalAmount: parseFloat(p.summary?.grandTotal || p.paidAmount),
          paidAmount: parseFloat(p.paidAmount),
          remainingAmount: parseFloat(p.remainingAmount),
          status: p.status,
          method: p.method,
          type: "Payment",
        }));

        setRecords([...sales, ...payments]);
      } catch (err) {
        console.error("Error fetching income data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filter
  const filteredRecords =
    filter === "all"
      ? records
      : records.filter((r) => r.type.toLowerCase() === filter.toLowerCase());

  // Calculate total paid amount
  const totalPaid = filteredRecords.reduce(
    (sum, r) => sum + (r.paidAmount || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6">Income Report</h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <select
                className="border rounded-lg px-3 py-2 shadow-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="sale">Sales</option>
                <option value="payment">Payments</option>
              </select>

              <div className="ml-auto bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold shadow">
                Total Paid: {totalPaid.toFixed(2)} Birr
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">#</th>
                    <th className="border px-4 py-2 text-left">Date</th>
                    <th className="border px-4 py-2 text-left">Customer</th>
                    <th className="border px-4 py-2 text-right">
                      Total Amount
                    </th>
                    <th className="border px-4 py-2 text-right">Paid Amount</th>
                    <th className="border px-4 py-2 text-right">
                      Remaining / Due
                    </th>
                    <th className="border px-4 py-2 text-left">Status</th>
                    <th className="border px-4 py-2 text-left">Method</th>
                    <th className="border px-4 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-6 text-gray-500 font-medium"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((rec, index) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-gray-50 transition duration-150"
                      >
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2">
                          {new Date(rec.date).toLocaleDateString()}
                        </td>
                        <td className="border px-4 py-2">{rec.customer}</td>
                        <td className="border px-4 py-2 text-right">
                          {rec.totalAmount.toFixed(2)}
                        </td>
                        <td className="border px-4 py-2 text-right font-medium">
                          {rec.paidAmount.toFixed(2)}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {rec.remainingAmount.toFixed(2)}
                        </td>
                        <td className="border px-4 py-2">{rec.status}</td>
                        <td className="border px-4 py-2">{rec.method}</td>
                        <td className="border px-4 py-2">{rec.type}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-6 text-gray-500 font-medium"
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
