import { useEffect, useState } from "react";
import api from "../api";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    api.get("/sales/history").then((res) => setSales(res.data));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Sales History</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-3">{s.customer_name || "Walk-in"}</td>
                <td>{s.total}</td>
                <td>{s.payment_method}</td>
                <td>{s.status}</td>
                <td>{s.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
