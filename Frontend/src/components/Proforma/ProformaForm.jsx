import { useState } from "react";
import ProformaHeader from "./ProformaHeader";
import ProformaTable from "./ProformaTable";
import ProformaTotals from "./ProformaTotals";
import ProformaFooter from "./ProformaFooter";
import Sidebar from "@/partials/Sidebar";
import Header from "@/partials/Header";
import { format } from "date-fns";
import api from "@/api";
import Swal from "sweetalert2";
import { useStores } from "@/contexts/storeContext";
// import { useStores } from "@/contexts/storeContext"; // your global store

function ProformaForm() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    jobId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    product_name: "",
    types_of_jobs: "",
    customerName: "",
    items: [
      {
        description: "",
        quantity: 1,
        materialCost: 0,
        laborCost: 0,
        totalCost: 0,
      },
    ],
    preparedBy: "",
    deliveryTime: "",
    notes: "",
  });

  const { setProformas } = useStores(); // import from context

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/proformas", formData);

      // ⬅ Save to context right after saving to DB
      setProformas((prev) => [...prev, data]);

      Swal.fire({
        title: "Success!",
        text: "Proforma created successfully. Do you want to print it?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Yes, Print",
        cancelButtonText: "No, Thanks",
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(`/proforma-print/${data.id}`);
        } else {
          // Reset form
          setFormData({
            jobId: "",
            date: format(new Date(), "yyyy-MM-dd"),
            product_name: "",
            types_of_jobs: "",
            customerName: "",
            items: [
              {
                description: "",
                quantity: 1,
                materialCost: 0,
                laborCost: 0,
                totalCost: 0,
              },
            ],
            preparedBy: "",
            deliveryTime: "",
            notes: "",
          });
        }
      });
    } catch (error) {
      console.error("Proforma save failed:", error);
      Swal.fire("Error", "Failed to save proforma.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-6">
          <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-semibold mb-6 text-center">
              Proforma Invoice
            </h1>

            <ProformaHeader formData={formData} setFormData={setFormData} />
            <ProformaTable formData={formData} setFormData={setFormData} />
            <ProformaTotals formData={formData} />
            <ProformaFooter formData={formData} setFormData={setFormData} />

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save Proforma"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProformaForm;
