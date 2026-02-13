import React, { useEffect, useState, useMemo } from "react";
import api from "@/api";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

const ReceiptPage = () => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =========================
     FETCH DATA
  ========================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesRes = await api.get("/salee"); // ← your real sale endpoint
        const purchaseRes = await api.get("/purchases/with-receipt");

        console.log("Sales:", salesRes.data);
        console.log("Purchases:", purchaseRes.data);

        setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
        setPurchases(Array.isArray(purchaseRes.data) ? purchaseRes.data : []);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* =========================
     MERGE SALES + PURCHASES
  ========================== */
  const combinedData = useMemo(() => {
    const formattedSales = sales.map((sale) => ({
      id: `sale-${sale.id}`,
      invoiceImage: sale.receipt?.invoice_image || null,
      itemCode:
        sale.items && sale.items.length > 0
          ? sale.items.map((i) => i.item_code).join(", ")
          : "-",
      type: "Sale",
      total: sale.grand_total,
      vat: sale.receipt?.vat_collected || 0,
    }));

    const formattedPurchases = purchases.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      invoiceImage: purchase.receipt?.invoice_image || null,
      itemCode: purchase.item_code || "-",
      type: "Purchase",
      total: purchase.actual_total_price,
      vat: purchase.receipt?.vat_paid || 0,
    }));

    return [...formattedSales, ...formattedPurchases];
  }, [sales, purchases]);

  /* =========================
     TOTALS
  ========================== */
  const totalSalesAmount = sales.reduce(
    (acc, s) => acc + parseFloat(s.grand_total || 0),
    0,
  );

  const totalPurchaseAmount = purchases.reduce(
    (acc, p) => acc + parseFloat(p.actual_total_price || 0),
    0,
  );

  const totalSalesVAT = sales.reduce(
    (acc, s) => acc + parseFloat(s.receipt?.vat_collected || 0),
    0,
  );

  const totalPurchaseVAT = purchases.reduce(
    (acc, p) => acc + parseFloat(p.receipt?.vat_paid || 0),
    0,
  );

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 text-lg">
        Loading receipt report...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          <div className="p-6 space-y-8">
            {/* =========================
         SUMMARY CARDS
      ========================== */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white shadow rounded-xl p-5 border">
                <h3 className="text-sm text-gray-500">Total Sales</h3>
                <p className="text-2xl font-bold text-green-600">
                  {totalSalesAmount.toFixed(2)} ETB
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-5 border">
                <h3 className="text-sm text-gray-500">VAT Collected</h3>
                <p className="text-2xl font-bold text-green-500">
                  {totalSalesVAT.toFixed(2)} ETB
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-5 border">
                <h3 className="text-sm text-gray-500">Total Purchases</h3>
                <p className="text-2xl font-bold text-red-600">
                  {totalPurchaseAmount.toFixed(2)} ETB
                </p>
              </div>

              <div className="bg-white shadow rounded-xl p-5 border">
                <h3 className="text-sm text-gray-500">VAT Paid</h3>
                <p className="text-2xl font-bold text-red-500">
                  {totalPurchaseVAT.toFixed(2)} ETB
                </p>
              </div>
            </div>

            {/* =========================
         COMBINED TABLE
      ========================== */}
            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold mb-4">
                All Receipts (Sales + Purchases)
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 border">Type</th>
                      <th className="p-3 border">Item Code</th>
                      <th className="p-3 border">Total</th>
                      <th className="p-3 border">VAT</th>
                      <th className="p-3 border">Invoice Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((row) => (
                      <tr key={row.id} className="text-center hover:bg-gray-50">
                        <td
                          className={`p-2 border font-semibold ${
                            row.type === "Sale"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {row.type}
                        </td>

                        <td className="p-2 border">{row.itemCode}</td>
                        <td className="p-2 border">{row.total}</td>
                        <td className="p-2 border">{row.vat}</td>

                        <td className="p-2 border">
                          {row.invoiceImage ? (
                            <img
                              src={row.invoiceImage}
                              alt="Invoice"
                              className="h-16 mx-auto rounded shadow cursor-pointer hover:scale-105 transition"
                              onClick={() =>
                                window.open(row.invoiceImage, "_blank")
                              }
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
