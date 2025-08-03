import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api";

const PurchaseRecievedVoucher = () => {
  const [purchases, setPurchases] = useState([]);
  console.log(purchases);

  useEffect(() => {
    api
      .get("/purchases")
      .then((response) => {
        console.log(response);
        setPurchases(response.data);
      })
      .catch((error) => {
        console.error("Error fetching purchases:", error);
      });
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-green-500 tracking-wider uppercase">
        Purchase List
      </h2>
      <table className="w-full border-collapse border border-table-border">
        <thead className="bg-table-head border-table-border text-white">
          <tr className="dark:text-white">
            <th className="border border-table-border p-2">#</th>
            <th className="border border-table-border p-2">Purchase Date</th>
            <th className="border border-table-border p-2">Purchased By</th>
            <th className="border border-table-border p-2">Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {purchases?.map((purchase, index) => (
            <tr key={purchase.id} className="text-center dark:text-white">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{purchase.purchase_date}</td>
              <td className="border p-2">{purchase.purchased_by}</td>
              <td className="border p-2">{purchase.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseRecievedVoucher;
