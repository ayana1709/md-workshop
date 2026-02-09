import React, { useEffect, useState } from "react";
import api from "@/api";
import Header from "@/partials/Header";
import Sidebar from "@/partials/Sidebar";
import { CheckCircle, XCircle } from "lucide-react";

export default function ManageReceipt() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data } = await api.get("/receipt");
      setReceipts(data);
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const ReceiptStatus = ({ hasReceipt, total }) =>
    hasReceipt ? (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle size={16} />
        <span>{total}</span>
      </div>
    ) : (
      <XCircle size={16} className="text-red-500" />
    );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-8">
          <h2 className="text-xl font-bold mb-4">Manage Receipts</h2>

          {loading ? (
            <div>Loading receipts...</div>
          ) : receipts.length === 0 ? (
            <div>No receipts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-200 text-center">
                    <th rowSpan="2" className="border px-2 py-2">Receipt ID</th>
                    <th rowSpan="2" className="border px-2 py-2">Item Code</th>
                    <th rowSpan="2" className="border px-2 py-2">Item Name</th>

                    <th colSpan="2" className="border px-2 py-2">Purchase</th>
                    <th colSpan="2" className="border px-2 py-2">Sales</th>
                  </tr>

                  <tr className="bg-gray-100 text-center">
                    <th className="border px-2 py-1">Receipt</th>
                    <th className="border px-2 py-1">Actual Price</th>
                    <th className="border px-2 py-1">Receipt</th>
                    <th className="border px-2 py-1">Actual Price</th>
                  </tr>
                </thead>

                <tbody>
                  {receipts.map((r) => {
                    const isPurchase =
                      r.receiptable_type === "App\\Models\\Purchasee";
                    const isSale =
                      r.receiptable_type === "App\\Models\\Sell";

                    const hasReceipt = !!r.receipt_total_price;

                    return (
                      <tr key={r.id} className="text-center">
                        <td className="border px-2 py-1">{r.id}</td>
                        <td className="border px-2 py-1">{r.item_code}</td>
                        <td className="border px-2 py-1">
                          {r.item?.item_name || "—"}
                        </td>

                        {/* Purchase */}
                        <td className="border px-2 py-1">
                          {isPurchase ? (
                            <ReceiptStatus
                              hasReceipt={hasReceipt}
                              total={r.receipt_total_price}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {isPurchase ? r.receipt_unit_price : "—"}
                        </td>

                        {/* Sales */}
                        <td className="border px-2 py-1">
                          {isSale ? (
                            <ReceiptStatus
                              hasReceipt={hasReceipt}
                              total={r.receipt_total_price}
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="border px-2 py-1">
                          {isSale ? r.receipt_unit_price : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
