import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "@/api";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";

export default function EcommerceManager() {
  const { state } = useLocation();
  const [items, setItems] = useState(state?.items || []);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ ONLY show posted items
  const ecommerceItems = items.filter((item) => item.posted_to_ecommerce);

  // Fetch posted items from backend
  const fetchPostedItems = async () => {
    try {
      const res = await api.get("/items/ecommerce");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ecommerce items");
    }
  };

  useEffect(() => {
    fetchPostedItems();
  }, []);

  // Toggle posted status
  const togglePost = async (item_code, posted) => {
    try {
      await api.post("/items/ecommerce/toggle", {
        item_code,
        posted,
      });

      setItems((prev) =>
        prev.map((item) =>
          item.item_code === item_code
            ? { ...item, posted_to_ecommerce: posted }
            : item,
        ),
      );

      toast.success("Ecommerce status updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ecommerce status");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              Ecommerce Posted Items
            </h2>

            {ecommerceItems.length === 0 ? (
              <p className="text-gray-500 text-center">
                No items are posted to ecommerce yet.
              </p>
            ) : (
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr className="text-left text-sm text-gray-600">
                    <th className="p-3 border">Image</th>
                    <th className="p-3 border">Item</th>
                    <th className="p-3 border">Category</th>
                    <th className="p-3 border">Brand</th>
                    <th className="p-3 border">Price</th>
                    <th className="p-3 border text-center">Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {ecommerceItems.map((item) => {
                    const images = JSON.parse(item.images || "[]");
                    const imageUrl = images[0]
                      ? `${import.meta.env.VITE_API_URL}/storage/${images[0]}`
                      : null;

                    return (
                      <tr
                        key={item.item_code}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="p-3 border">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.item_name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded" />
                          )}
                        </td>

                        <td className="p-3 border">
                          <div className="font-medium">{item.item_name}</div>
                          <div className="text-xs text-gray-500">
                            {item.item_code}
                          </div>
                        </td>

                        <td className="p-3 border">{item.category?.name}</td>

                        <td className="p-3 border">{item.brand?.name}</td>

                        <td className="p-3 border font-semibold">
                          {Number(item.selling_price).toLocaleString()} ETB
                        </td>

                        <td className="p-3 border text-center">
                          <Checkbox
                            checked={item.posted_to_ecommerce}
                            onCheckedChange={(val) =>
                              togglePost(item.item_code, val)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
